import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Send, 
  X, 
  RefreshCw
} from 'lucide-react';
import { TripDto, SettleMatrixDto, CreatePaymentRequest, TripParticipantDto } from '../../types/trip';
import { tripApi } from '../../services/tripApi';
import { useToast } from '../shared/ToastContext';

interface SettleSubTabProps {
  trip: TripDto;
  participants: TripParticipantDto[];
  onRefresh: () => void;
}

export const SettleSubTab: React.FC<SettleSubTabProps> = ({
  trip,
  participants,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [settleData, setSettleData] = useState<SettleMatrixDto | null>(null);
  const [_loading, setLoading] = useState(true);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Settlement Payment Modal Form State
  const [fromPartId, setFromPartId] = useState('');
  const [toPartId, setToPartId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [payNotes, setPayNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSettleMatrix = async () => {
    try {
      setLoading(true);
      const data = await tripApi.getSettleMatrix(trip.id);
      setSettleData(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load settlement matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettleMatrix();
  }, [trip.id]);

  const openSettleTransfer = (fromId: string, toId: string, amt: number) => {
    setFromPartId(fromId);
    setToPartId(toId);
    setPayAmount(amt.toString());
    setPayMethod('UPI');
    setPayNotes('Trip group balance settlement');
    setIsPayModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromPartId || !toPartId || !payAmount) return;

    setIsSubmitting(true);
    try {
      const req: CreatePaymentRequest = {
        fromParticipantId: fromPartId,
        toParticipantId: toPartId,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        notes: payNotes.trim() || undefined,
      };
      await tripApi.createPayment(trip.id, req);
      toast.success('Settlement payment recorded successfully!');
      setIsPayModalOpen(false);
      fetchSettleMatrix();
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allTravelers = participants.flatMap(p => [p, ...(p.dependents || [])]);

  return (
    <div className="space-y-6">
      {/* Top Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
            Total Group Spending
          </span>
          <div className="text-xl font-bold font-serif text-stone-900 mt-0.5">
            ₹{settleData ? settleData.totalTripExpenses.toLocaleString('en-IN') : '0'}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">Total shared group ledger outflow</p>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
            Settlement Payments Logged
          </span>
          <div className="text-xl font-bold font-serif text-emerald-800 mt-0.5">
            ₹{settleData ? settleData.totalPaymentsMade.toLocaleString('en-IN') : '0'}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">Direct reimbursements and transfers</p>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
            Unsettled Net Debts
          </span>
          <div className="text-xl font-bold font-serif text-amber-900 mt-0.5">
            ₹{settleData ? settleData.totalUnsettledBalance.toLocaleString('en-IN') : '0'}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">Pending peer-to-peer clearances</p>
        </div>
      </div>

      {/* Suggested Pairwise Settlements (§16.2 / §17) */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Suggested Settle-Up Transfers</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Simplified minimum transactions to resolve all traveler debts
            </p>
          </div>
          <button
            onClick={fetchSettleMatrix}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {settleData?.suggestedTransfers.length === 0 ? (
            <div className="p-8 text-center bg-stone-50 border border-stone-200 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-stone-900">All Balances Settled!</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">No outstanding group debts remain for this trip.</p>
            </div>
          ) : (
            settleData?.suggestedTransfers.map((tx, idx) => (
              <div
                key={idx}
                className="p-4 bg-stone-50/80 border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                      <span className="text-rose-700 font-bold">{tx.fromParticipantName}</span>
                      <span className="text-stone-400">pays</span>
                      <span className="text-emerald-700 font-bold">{tx.toParticipantName}</span>
                    </div>
                    <span className="text-[11px] text-stone-500">
                      Direct UPI / Cash reimbursement
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-base font-bold font-mono text-stone-900">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => openSettleTransfer(tx.fromParticipantId, tx.toParticipantId, tx.amount)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all"
                  >
                    Record Payment
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Participant Balance Matrix Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
            Participant Net Balances Summary
          </h3>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/50 text-[11px] font-semibold text-stone-600 uppercase">
              <th className="py-2.5 px-4">Participant</th>
              <th className="py-2.5 px-4 text-right">Total Paid (Out of Pocket)</th>
              <th className="py-2.5 px-4 text-right">Total Share (Consumed)</th>
              <th className="py-2.5 px-4 text-right">Net Balance</th>
              <th className="py-2.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {settleData?.participantBalances.map((pb) => {
              const isOwed = pb.netBalance > 0;
              const isOwes = pb.netBalance < 0;

              return (
                <tr key={pb.participantId} className="hover:bg-stone-50/50">
                  <td className="py-3 px-4 font-semibold text-stone-900">
                    {pb.participantName}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-stone-800">
                    ₹{pb.totalPaid.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-stone-800">
                    ₹{pb.totalShare.toLocaleString('en-IN')}
                  </td>
                  <td className={`py-3 px-4 text-right font-mono font-bold ${
                    isOwed ? 'text-emerald-700' : isOwes ? 'text-rose-600' : 'text-stone-500'
                  }`}>
                    {isOwed ? `+₹${pb.netBalance.toLocaleString('en-IN')}` : isOwes ? `-₹${Math.abs(pb.netBalance).toLocaleString('en-IN')}` : '₹0.00'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isOwed 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : isOwes 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {pb.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Record Settlement Payment Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-sm font-bold text-stone-900">Record Settlement Payment</h3>
              <button onClick={() => setIsPayModalOpen(false)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Payer (Sent Money)</label>
                <select
                  value={fromPartId}
                  onChange={(e) => setFromPartId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                >
                  <option value="">-- Select Payer --</option>
                  {allTravelers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Payee (Received Money)</label>
                <select
                  value={toPartId}
                  onChange={(e) => setToPartId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                >
                  <option value="">-- Select Receiver --</option>
                  {allTravelers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="Amount"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer (IMPS/NEFT)</option>
                    <option value="CARD">Card / Forex</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Notes / Transaction Reference</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. UPI ref #942084920"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-3 py-1.5 text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !fromPartId || !toPartId || !payAmount}
                  className="px-4 py-1.5 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm Settlement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
