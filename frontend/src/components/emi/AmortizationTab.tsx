import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Clock 
} from 'lucide-react';
import { AmortizationScheduleDto, LoanDto } from '../../types/emi';
import { useToast } from '../shared/ToastContext';

interface AmortizationTabProps {
  loan: LoanDto;
  schedule: AmortizationScheduleDto | null;
}

export const AmortizationTab: React.FC<AmortizationTabProps> = ({ loan, schedule }) => {
  const { toast } = useToast();
  const [expandedYears, setExpandedYears] = useState<{ [year: number]: boolean }>({
    [new Date().getFullYear()]: true,
  });

  if (!schedule) {
    return (
      <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl text-stone-400">
        <Clock className="w-8 h-8 mx-auto mb-2 text-stone-300" />
        <p className="text-xs">Computing reducing balance amortization schedule...</p>
      </div>
    );
  }

  const toggleYear = (year: number) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const expandAll = () => {
    const all: { [year: number]: boolean } = {};
    schedule.yearlySchedules.forEach(y => { all[y.calendarYear] = true; });
    setExpandedYears(all);
  };

  const collapseAll = () => {
    setExpandedYears({});
  };

  const handleExportCsv = () => {
    let csv = 'Installment,Date,Opening Balance,EMI,Principal,Interest,Prepayment,Closing Balance\n';
    schedule.monthlySchedules.forEach(m => {
      csv += `${m.installmentNumber},${m.paymentDate},${m.openingBalance},${m.emiAmount},${m.principalComponent},${m.interestComponent},${m.prepaymentAmount},${m.closingBalance}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${loan.loanName.replace(/\s+/g, '_')}_Amortization.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Amortization schedule exported as CSV!');
  };

  return (
    <div className="space-y-6">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Total Principal</span>
          <div className="text-xl font-bold font-serif text-stone-900 mt-0.5">
            ₹{schedule.sanctionedAmount.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Original sanctioned debt</p>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Total Interest</span>
          <div className="text-xl font-bold font-serif text-amber-900 mt-0.5">
            ₹{schedule.totalInterestPaid.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Payable across {schedule.actualTenureMonths} months</p>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Interest Saved</span>
          <div className="text-xl font-bold font-serif text-emerald-700 mt-0.5">
            ₹{schedule.totalInterestSaved.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">{schedule.monthsSaved} months shaved off</p>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Projected Payoff</span>
          <div className="text-base font-bold text-stone-900 mt-1">
            {schedule.projectedPayoffDate}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Final debt clearance date</p>
        </div>
      </div>

      {/* Amortization Schedule Ledger */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Yearly & Monthly Amortization Breakdown</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Exact reducing balance allocation across principal, interest, and prepayments
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 text-[11px] font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-md"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 text-[11px] font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-md"
            >
              Collapse All
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3 py-1 text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-md flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Yearly Accordion List */}
        <div className="mt-5 space-y-4">
          {schedule.yearlySchedules.map((year) => {
            const isExpanded = !!expandedYears[year.calendarYear];

            return (
              <div key={year.calendarYear} className="border border-stone-200 rounded-xl overflow-hidden">
                {/* Year Header Summary Bar */}
                <div
                  onClick={() => toggleYear(year.calendarYear)}
                  className="p-4 bg-stone-50/80 hover:bg-stone-100/70 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                      Y{year.yearIndex}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">
                        Year {year.calendarYear}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {year.months.length} installments scheduled
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-stone-400 block font-sans">Principal</span>
                      <span className="font-bold text-stone-800">₹{year.totalPrincipalPaid.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-stone-400 block font-sans">Interest</span>
                      <span className="font-bold text-amber-900">₹{year.totalInterestPaid.toLocaleString('en-IN')}</span>
                    </div>
                    {year.totalPrepaymentPaid > 0 && (
                      <div>
                        <span className="text-[9px] uppercase font-bold text-emerald-700 block font-sans">Prepaid</span>
                        <span className="font-bold text-emerald-700">₹{year.totalPrepaymentPaid.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[9px] uppercase font-bold text-stone-400 block font-sans">Year-End Balance</span>
                      <span className="font-bold text-stone-900">₹{year.closingBalance.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Months Table */}
                {isExpanded && (
                  <div className="overflow-x-auto border-t border-stone-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-stone-50/50 text-[10px] font-semibold text-stone-600 uppercase border-b border-stone-200">
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Due Date</th>
                          <th className="py-2.5 px-3 text-right">Opening (₹)</th>
                          <th className="py-2.5 px-3 text-right">EMI (₹)</th>
                          <th className="py-2.5 px-3 text-right">Principal (₹)</th>
                          <th className="py-2.5 px-3 text-right">Interest (₹)</th>
                          <th className="py-2.5 px-3 text-right">Prepayment (₹)</th>
                          <th className="py-2.5 px-3 text-right">Closing (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                        {year.months.map((m) => (
                          <tr key={m.installmentNumber} className="hover:bg-stone-50/60">
                            <td className="py-2 px-3 text-stone-400 font-sans font-semibold">
                              {m.installmentNumber}
                            </td>
                            <td className="py-2 px-3 text-stone-700 font-sans whitespace-nowrap">
                              {m.paymentDate}
                            </td>
                            <td className="py-2 px-3 text-right text-stone-600">
                              {m.openingBalance.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-stone-900">
                              {m.emiAmount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 px-3 text-right text-stone-800">
                              {m.principalComponent.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 px-3 text-right text-amber-900">
                              {m.interestComponent.toLocaleString('en-IN')}
                            </td>
                            <td className={`py-2 px-3 text-right font-bold ${m.prepaymentAmount > 0 ? 'text-emerald-700 bg-emerald-50/60' : 'text-stone-300'}`}>
                              {m.prepaymentAmount > 0 ? `+₹${m.prepaymentAmount.toLocaleString('en-IN')}` : '—'}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-stone-900">
                              {m.closingBalance.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
