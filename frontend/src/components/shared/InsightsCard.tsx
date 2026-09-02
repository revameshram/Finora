import React from 'react';
import { SourceModule } from '../../types';
import { Sparkles, TrendingUp, AlertTriangle, AlertCircle, X } from 'lucide-react';

export type InsightType = 'positive' | 'warning' | 'neutral' | 'critical';

export interface InsightsCardProps {
  title: string;
  description: string;
  type?: InsightType;
  sourceModule?: SourceModule;
  metric?: string;
  metricSubtext?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

const INSIGHT_THEMES: Record<
  InsightType,
  { icon: typeof Sparkles; barColor: string; iconColor: string; badgeBg: string; badgeText: string }
> = {
  positive: {
    icon: TrendingUp,
    barColor: 'border-l-[#C27D38]',
    iconColor: 'text-[#C27D38]',
    badgeBg: 'bg-[#FAF2E8]',
    badgeText: 'text-[#8E561C]',
  },
  warning: {
    icon: AlertTriangle,
    barColor: 'border-l-[#A66D29]',
    iconColor: 'text-[#A66D29]',
    badgeBg: 'bg-[#FAF4EB]',
    badgeText: 'text-[#855318]',
  },
  neutral: {
    icon: Sparkles,
    barColor: 'border-l-[#355260]',
    iconColor: 'text-[#355260]',
    badgeBg: 'bg-[#EEF4F7]',
    badgeText: 'text-[#223E4D]',
  },
  critical: {
    icon: AlertCircle,
    barColor: 'border-l-[#B84A39]',
    iconColor: 'text-[#B84A39]',
    badgeBg: 'bg-[#FDF2F0]',
    badgeText: 'text-[#B84A39]',
  },
};

export const InsightsCard: React.FC<InsightsCardProps> = ({
  title,
  description,
  type = 'neutral',
  sourceModule,
  metric,
  metricSubtext,
  action,
  onDismiss,
  className = '',
}) => {
  const theme = INSIGHT_THEMES[type];
  const Icon = theme.icon;

  return (
    <div
      className={`bg-white border border-[#E6E2DA] border-l-4 ${theme.barColor} p-4 rounded-lg transition-all ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-1.5 rounded bg-[#F8F7F4] border border-[#E6E2DA] flex-shrink-0 mt-0.5">
            <Icon className={`h-4 w-4 ${theme.iconColor}`} />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs font-bold text-[#1F1A16]">{title}</h4>
              {sourceModule && (
                <span className="text-[10px] font-semibold tracking-wide px-1.5 py-0.2 rounded bg-[#F8F7F4] text-[#6B635B] border border-[#E6E2DA]">
                  {sourceModule.replace('_', ' ')}
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B635B] leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Metric and Close button */}
        <div className="flex items-start gap-2 flex-shrink-0">
          {metric && (
            <div className="text-right">
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${theme.badgeBg} ${theme.badgeText} tabular-nums`}>
                {metric}
              </span>
              {metricSubtext && (
                <span className="block text-[10px] text-[#6B635B]/80 mt-0.5">{metricSubtext}</span>
              )}
            </div>
          )}

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-[#6B635B]/60 hover:text-[#1F1A16] p-0.5 rounded transition-colors"
              aria-label="Dismiss insight"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {action && (
        <div className="mt-3 pt-2.5 border-t border-[#E6E2DA]/60 flex justify-end">
          <button
            type="button"
            onClick={action.onClick}
            className="text-xs font-semibold text-[#1F1A16] hover:text-[#C27D38] transition-colors"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
};

export default InsightsCard;
