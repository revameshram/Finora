import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Receipt, 
  CreditCard, 
  Compass, 
  TrendingUp, 
  Layers, 
  Target, 
  Flame,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { LEARN_GUIDES } from '../../data/learnGuides';
import { LearnGuideDetail } from './LearnGuideDetail';

interface LearnCenterProps {
  onNavigateToModule?: (moduleId: string) => void;
  onBackToWorkspace?: () => void;
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

export const LearnCenter: React.FC<LearnCenterProps> = ({
  onNavigateToModule,
  onBackToWorkspace,
}) => {
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Cash Flow', 'Growth', 'Security'];

  const filteredGuides = LEARN_GUIDES.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || g.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const activeGuide = LEARN_GUIDES.find((g) => g.id === selectedGuideId);

  if (activeGuide) {
    return (
      <LearnGuideDetail
        guide={activeGuide}
        onBack={() => setSelectedGuideId(null)}
        onNavigateToModule={onNavigateToModule}
      />
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-xs relative overflow-hidden">
        {onBackToWorkspace && (
          <button
            onClick={onBackToWorkspace}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Workspace
          </button>
        )}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Finora Financial Knowledge Hub
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 leading-tight">
            Learn Financial Principles. <br />
            <span className="text-amber-700">Apply with Precision.</span>
          </h1>

          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            Eight deep-dive guides corresponding to each tool in the Finora suite. Master reducing balance mechanics, safe withdrawal rates, zero-knowledge encryption, and currency hedging.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, formulas, frameworks..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#B88728] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGuides.map((guide) => {
          const Icon = ICON_MAP[guide.icon] || BookOpen;

          return (
            <div
              key={guide.id}
              onClick={() => setSelectedGuideId(guide.id)}
              className="bg-white border border-stone-200 hover:border-amber-400 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-700 group-hover:bg-amber-50 group-hover:text-amber-800 group-hover:border-amber-300 transition-colors flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
                      {guide.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-stone-400 font-medium">
                      <Clock className="w-3 h-3" />
                      {guide.readTimeMinutes} min
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-stone-900 mt-4 group-hover:text-amber-900 transition-colors">
                  {guide.title}
                </h3>

                <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                  {guide.tagline}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-400 text-[11px]">
                  {guide.highlights.length} Core Takeaways
                </span>
                <span className="font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Read Guide
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearnCenter;
