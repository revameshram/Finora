import React from 'react';
import { X, Calendar } from 'lucide-react';
import { DepositScheduleEntryDto, BondScheduleEntryDto } from '../../types/portfolio';
import { Money } from '../shared';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'DEPOSIT' | 'BOND';
  depositSchedule?: DepositScheduleEntryDto[];
  bondSchedule?: BondScheduleEntryDto[];
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  title,
  type,
  depositSchedule = [],
  bondSchedule = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E7E5E4] shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E5E4] flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FAF2E8] border border-[#C27D38]/30 text-[#C27D38]">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1917]">{title}</h3>
              <p className="text-[11px] text-[#78716C]">
                {type === 'DEPOSIT'
                  ? 'Computed quarterly interest accrual and capital trajectory'
                  : 'Computed coupon payment dates and principal maturity'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#78716C] hover:text-[#1C1917] rounded-lg hover:bg-stone-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {type === 'DEPOSIT' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-[#78716C] font-semibold uppercase text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Earned Interest</th>
                  <th className="py-2.5 px-3 text-right">Accumulated Capital</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {depositSchedule.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FAFAF9]">
                    <td className="py-2.5 px-3 font-semibold text-[#1C1917]">{row.date}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold tabular-nums">
                      +<Money amount={row.earnedInterest} />
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#1C1917] tabular-nums">
                      <Money amount={row.capital} />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                          row.status === 'Realized' || row.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-[#78716C] font-semibold uppercase text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Coupon Rate Payout</th>
                  <th className="py-2.5 px-3 text-right">Total Payout</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {bondSchedule.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FAFAF9]">
                    <td className="py-2.5 px-3 font-semibold text-[#1C1917]">{row.date}</td>
                    <td className="py-2.5 px-3 text-right text-[#C27D38] font-semibold tabular-nums">
                      <Money amount={row.coupon} />
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#1C1917] tabular-nums">
                      <Money amount={row.payout} />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                          row.status === 'Realized' || row.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E7E5E4] bg-[#FAFAF9] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#1C1917] bg-white border border-[#E7E5E4] hover:bg-stone-50 rounded-lg transition-colors"
          >
            Close Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
