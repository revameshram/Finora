import React, { useState, useEffect } from 'react';
import { LucideIcon, X, CheckSquare, Square, Lightbulb, BookOpen } from 'lucide-react';

export interface OnboardingStep {
  stepNumber: number;
  title: string;
  description: string;
  tip?: string;
}

export interface OnboardingTip {
  id: string;
  label: string;
  completed?: boolean;
}

export interface OnboardingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  moduleName: string;
  subtitle: string;
  icon?: LucideIcon;
  steps: OnboardingStep[];
  tipsChecklist?: OnboardingTip[];
  storageKey?: string;
}

export const OnboardingDrawer: React.FC<OnboardingDrawerProps> = ({
  isOpen,
  onClose,
  moduleName,
  subtitle,
  icon: ModuleIcon,
  steps,
  tipsChecklist = [],
  storageKey,
}) => {
  const [checkedTips, setCheckedTips] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`finora_onboarding_${storageKey}`);
      if (saved) {
        try {
          setCheckedTips(JSON.parse(saved));
        } catch {
          // ignore error
        }
      }
    }
  }, [storageKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleTip = (tipId: string) => {
    const updated = { ...checkedTips, [tipId]: !checkedTips[tipId] };
    setCheckedTips(updated);
    if (storageKey) {
      localStorage.setItem(`finora_onboarding_${storageKey}`, JSON.stringify(updated));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#1F1A16]/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col border-l border-[#E6E2DA]">
          {/* Header */}
          <div className="p-6 border-b border-[#E6E2DA] flex items-start justify-between bg-[#F8F7F4]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#1F1A16] text-[#C27D38] flex items-center justify-center border border-[#E6E2DA]">
                {ModuleIcon ? <ModuleIcon className="h-4.5 w-4.5" /> : <BookOpen className="h-4.5 w-4.5" />}
              </div>
              <div>
                <h2 className="text-base font-serif font-bold text-[#1F1A16]">{moduleName} Handbook</h2>
                <p className="text-xs text-[#6B635B] mt-0.5">{subtitle}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-[#6B635B] hover:text-[#1F1A16] p-1 rounded-md hover:bg-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Numbered Steps */}
            <div>
              <h3 className="text-xs font-bold text-[#1F1A16] mb-3">
                Operating Guide
              </h3>
              <div className="space-y-3">
                {steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-4 rounded-lg border border-[#E6E2DA] bg-white space-y-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-[#1F1A16] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 tabular-nums">
                        {step.stepNumber}
                      </span>
                      <h4 className="text-xs font-bold text-[#1F1A16]">{step.title}</h4>
                    </div>
                    <p className="text-xs text-[#6B635B] leading-relaxed pl-7.5">
                      {step.description}
                    </p>
                    {step.tip && (
                      <div className="ml-7.5 p-2 rounded bg-[#FAF2E8] border border-[#C27D38]/30 text-[11px] text-[#8E561C] flex items-start gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-[#C27D38] flex-shrink-0 mt-0.5" />
                        <span>{step.tip}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist */}
            {tipsChecklist.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-[#1F1A16] mb-3">
                  Checklist & Best Practices
                </h3>
                <div className="space-y-2">
                  {tipsChecklist.map((tip) => {
                    const isDone = !!checkedTips[tip.id];
                    return (
                      <div
                        key={tip.id}
                        onClick={() => toggleTip(tip.id)}
                        className={`p-3 rounded-lg border cursor-pointer select-none flex items-center gap-3 transition-all ${
                          isDone
                            ? 'bg-[#FAF2E8] border-[#C27D38]/40 text-[#8E561C]'
                            : 'bg-white border-[#E6E2DA] hover:border-[#6B635B] text-[#1F1A16]'
                        }`}
                      >
                        {isDone ? (
                          <CheckSquare className="h-4 w-4 text-[#C27D38] flex-shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-[#6B635B]/60 flex-shrink-0" />
                        )}
                        <span className={`text-xs ${isDone ? 'line-through opacity-80' : 'font-medium'}`}>
                          {tip.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-4 border-t border-[#E6E2DA] bg-[#F8F7F4] flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-md bg-[#1F1A16] hover:bg-[#342D27] text-white font-semibold text-xs shadow-xs transition-colors text-center"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingDrawer;
