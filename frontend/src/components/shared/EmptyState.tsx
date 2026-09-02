import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  headline: string;
  subtext: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  headline,
  subtext,
  action,
  secondaryAction,
  className = '',
}) => {
  const ActionIcon = action?.icon;

  return (
    <div
      className={`p-8 text-center bg-white border border-[#E6E2DA] rounded-lg flex flex-col items-center justify-center space-y-3.5 ${className}`}
    >
      <div className="h-10 w-10 rounded-lg bg-[#FAF2E8] border border-[#E6E2DA] flex items-center justify-center text-[#C27D38]">
        <Icon className="h-5 w-5 stroke-[1.5]" />
      </div>

      <div className="max-w-sm space-y-1">
        <h3 className="text-sm font-bold text-[#1F1A16]">{headline}</h3>
        <p className="text-xs text-[#6B635B] leading-relaxed">{subtext}</p>
      </div>

      {(action || secondaryAction) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md bg-[#1F1A16] hover:bg-[#342D27] text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#1F1A16] focus:ring-offset-2"
            >
              {ActionIcon && <ActionIcon className="h-3.5 w-3.5" />}
              <span>{action.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="text-xs font-medium text-[#6B635B] hover:text-[#1F1A16] underline px-2 py-1"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
