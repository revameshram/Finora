import React from 'react';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Lightbulb, 
  ArrowRight, 
  ShieldCheck, 
  Receipt, 
  CreditCard, 
  Compass, 
  TrendingUp, 
  Layers, 
  Target, 
  Flame,
  BookOpen,
  Share2
} from 'lucide-react';
import { LearnGuide } from '../../data/learnGuides';
import { useToast } from '../shared/ToastContext';

interface LearnGuideDetailProps {
  guide: LearnGuide;
  onBack: () => void;
  onNavigateToModule?: (moduleId: string) => void;
}

const ICON_MAP: Record<string, typeof ShieldCheck> = {
  ShieldCheck,
  Receipt,
  CreditCard,
  Compass,
  TrendingUp,
  Layers,
  Target,
  Flame,
};

export const LearnGuideDetail: React.FC<LearnGuideDetailProps> = ({
  guide,
  onBack,
  onNavigateToModule,
}) => {
  const { toast } = useToast();
  const Icon = ICON_MAP[guide.icon] || BookOpen;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Guide link copied to clipboard.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Learn Center
        </button>

        <button
          onClick={handleShare}
          className="p-2 text-stone-500 hover:text-stone-800 bg-white border border-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share Guide
        </button>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Icon className="w-4 h-4" />
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-900/80 text-amber-300 border border-amber-700/80">
              {guide.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-stone-300">
              <Clock className="w-3.5 h-3.5" />
              {guide.readTimeMinutes} min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-serif leading-tight">
            {guide.title}
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            {guide.tagline}
          </p>

          {guide.moduleTarget && onNavigateToModule && (
            <div className="pt-2">
              <button
                onClick={() => onNavigateToModule(guide.moduleTarget!)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Launch {guide.title.split('&')[0].trim()} in Finora
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-stone-900 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <h3>Executive Overview & Takeaways</h3>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {guide.summary}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {guide.highlights.map((h, i) => (
            <div key={i} className="p-3 bg-stone-50 border border-stone-100 rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-stone-800 font-medium leading-normal">{h}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deep-Dive Principles */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-stone-900 font-serif">Core Financial Principles & Mechanics</h2>
        <div className="space-y-4">
          {guide.keyPrinciples.map((kp, i) => (
            <div key={i} className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-stone-900">{kp.heading}</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{kp.explanation}</p>

              {kp.ruleOfThumb && (
                <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-900 block">Rule of Thumb</span>
                    <span className="text-xs font-semibold text-amber-950">{kp.ruleOfThumb}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Practical Action Checklist */}
      <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
          Actionable Step-by-Step Implementation
        </h2>
        <div className="space-y-2.5">
          {guide.practicalSteps.map((step, idx) => (
            <div key={idx} className="p-3.5 bg-stone-50 rounded-xl flex items-start gap-3 text-xs text-stone-800 font-medium">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      {guide.moduleTarget && onNavigateToModule && (
        <div className="p-6 bg-stone-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold">Ready to apply these principles?</h4>
            <p className="text-xs text-stone-400 mt-0.5">
              Open the dedicated tool inside your Finora privacy-first workspace.
            </p>
          </div>
          <button
            onClick={() => onNavigateToModule(guide.moduleTarget!)}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 self-start sm:self-auto transition-colors"
          >
            Launch Tool Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
