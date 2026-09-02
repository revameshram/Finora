import React from 'react';
import { SourceModule } from '../../types';
import { Link2, Unlink } from 'lucide-react';

interface LinkedBadgeProps {
  sourceModule: SourceModule;
  isLinked: boolean;
  onDelink?: () => void;
  className?: string;
  sourceEntityId?: string | null;
}

const MODULE_LABELS: Record<SourceModule, { label: string; color: string; border: string; bg: string }> = {
  MANUAL: { label: 'Manual', color: 'text-[#6B635B]', border: 'border-[#E6E2DA]', bg: 'bg-[#F8F7F4]' },
  PORTFOLIO: { label: 'Portfolio', color: 'text-[#C27D38]', border: 'border-[#C27D38]/30', bg: 'bg-[#FAF2E8]' },
  NET_WORTH: { label: 'Net Worth', color: 'text-[#1F1A16]', border: 'border-[#1F1A16]/30', bg: 'bg-[#F8F7F4]' },
  EXPENSE: { label: 'Expense', color: 'text-[#8E561C]', border: 'border-[#8E561C]/30', bg: 'bg-[#FAF2E8]' },
  GOAL: { label: 'Goal', color: 'text-[#355260]', border: 'border-[#355260]/30', bg: 'bg-[#EEF4F7]' },
  FIRE: { label: 'FIRE', color: 'text-[#7D4E5B]', border: 'border-[#7D4E5B]/30', bg: 'bg-[#FAF0F2]' },
  TRIP: { label: 'Trip', color: 'text-[#8C6D3B]', border: 'border-[#8C6D3B]/30', bg: 'bg-[#FAF5ED]' },
  VAULT: { label: 'Vault', color: 'text-[#1F1A16]', border: 'border-[#1F1A16]/30', bg: 'bg-[#F8F7F4]' },
  EMI_MANAGER: { label: 'EMI Loan', color: 'text-[#B84A39]', border: 'border-[#B84A39]/30', bg: 'bg-[#FDF2F0]' },
};

export const LinkedBadge: React.FC<LinkedBadgeProps> = ({
  sourceModule,
  isLinked,
  onDelink,
  className = '',
  sourceEntityId,
}) => {
  if (!isLinked || sourceModule === 'MANUAL') {
    return (
      <span
        className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded bg-[#F8F7F4] text-[#6B635B] border border-[#E6E2DA] ${className}`}
      >
        Manual
      </span>
    );
  }

  const style = MODULE_LABELS[sourceModule] || MODULE_LABELS.MANUAL;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${style.bg} ${style.color} border ${style.border}`}
        title={`Linked to ${style.label} ${sourceEntityId ? `(ID: ${sourceEntityId})` : ''}`}
      >
        <Link2 className="h-3 w-3" />
        <span>Linked: {style.label}</span>
      </span>

      {onDelink && (
        <button
          type="button"
          onClick={onDelink}
          className="text-[#6B635B]/60 hover:text-[#B84A39] p-0.5 rounded hover:bg-[#FDF2F0] transition-colors"
          title="Delink (Converts to standalone manual entry)"
        >
          <Unlink className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default LinkedBadge;
