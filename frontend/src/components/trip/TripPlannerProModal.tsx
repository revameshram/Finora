import React, { useState } from 'react';
import { X, Sparkles, Wand2, Calendar, MapPin, CheckCircle2, Clock, IndianRupee } from 'lucide-react';
import { AiTripPlanRequest, AiTripPlanResponse, CreateTripRequest } from '../../types/trip';
import { tripApi } from '../../services/tripApi';

interface TripPlannerProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdoptTrip: (data: CreateTripRequest, stops?: AiTripPlanResponse['suggestedStops']) => Promise<void>;
}

export const TripPlannerProModal: React.FC<TripPlannerProModalProps> = ({ isOpen, onClose, onAdoptTrip }) => {
  const [destination, setDestination] = useState('Kyoto & Tokyo, Japan');
  const [departureLocation, setDepartureLocation] = useState('Mumbai (BOM)');
  const [adultsCount, setAdultsCount] = useState(2);
  const [kidsCount, setKidsCount] = useState(0);
  const [startDate, setStartDate] = useState(new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0]);
  const [hotelPreference, setHotelPreference] = useState('Boutique Ryokan & 4-Star Central');
  const [promptText, setPromptText] = useState('Focus on historic tea ceremonies, bamboo groves, bullet train scenic views, artisan ramen streets, and evening river walks.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftResult, setDraftResult] = useState<AiTripPlanResponse | null>(null);
  const [isAdopting, setIsAdopting] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!destination.trim()) return;
    setIsGenerating(true);
    try {
      const req: AiTripPlanRequest = {
        destination: destination.trim(),
        departureLocation: departureLocation.trim() || undefined,
        adultsCount,
        kidsCount,
        startDate,
        endDate,
        hotelPreference,
        promptText,
      };
      const res = await tripApi.generateAiPlan(req);
      setDraftResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdopt = async () => {
    if (!draftResult) return;
    setIsAdopting(true);
    try {
      await onAdoptTrip({
        name: draftResult.generatedTripTitle,
        destination: draftResult.destination,
        departureLocation: departureLocation || undefined,
        adultsCount,
        kidsCount,
        startDate,
        endDate,
        hotelPreference,
        additionalDetails: draftResult.description,
        totalBudget: draftResult.recommendedBudget,
      }, draftResult.suggestedStops);
      onClose();
    } finally {
      setIsAdopting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-5xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900">Trip Planner Pro</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                  AI Quota 19/20
                </span>
              </div>
              <p className="text-xs text-stone-500">Autonomous itinerary drafting, smart budgeting, and packing suggestions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Two-Pane Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-stone-200 overflow-y-auto flex-1">
          {/* Left Form Pane (5 cols) */}
          <div className="lg:col-span-5 p-6 space-y-4 bg-stone-50/40">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Destination <span className="text-amber-600">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Kyoto, Japan"
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Departure From
                </label>
                <input
                  type="text"
                  value={departureLocation}
                  onChange={(e) => setDepartureLocation(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Adults
                </label>
                <input
                  type="number"
                  min="1"
                  value={adultsCount}
                  onChange={(e) => setAdultsCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Kids
                </label>
                <input
                  type="number"
                  min="0"
                  value={kidsCount}
                  onChange={(e) => setKidsCount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Hotel Preference
              </label>
              <input
                type="text"
                value={hotelPreference}
                onChange={(e) => setHotelPreference(e.target.value)}
                placeholder="e.g. 4-Star Heritage, Villa"
                className="w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  AI Travel Prompt (1200 chars)
                </label>
                <span className="text-[10px] text-stone-400">{promptText.length}/1200</span>
              </div>
              <textarea
                rows={3}
                maxLength={1200}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Describe your travel style, activities, food preferences..."
                className="w-full p-3 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !destination.trim()}
              className="w-full py-2.5 px-4 bg-[#B88728] hover:bg-[#a67520] text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Drafting Itinerary with AI...' : 'Generate Itinerary Plan'}
            </button>
          </div>

          {/* Right Draft Preview Pane (7 cols) */}
          <div className="lg:col-span-7 p-6 bg-white flex flex-col justify-between">
            {draftResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        AI Draft Generated
                      </span>
                      <h3 className="text-base font-bold text-stone-900 mt-0.5">
                        {draftResult.generatedTripTitle}
                      </h3>
                      <p className="text-xs text-stone-600 mt-0.5">{draftResult.generatedSubtitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-stone-500 block">
                        Estimated Budget
                      </span>
                      <span className="text-sm font-bold text-amber-900 flex items-center justify-end">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {draftResult.recommendedBudget.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 mt-2 italic border-t border-amber-200/50 pt-2">
                    "{draftResult.description}"
                  </p>
                </div>

                {/* Stops Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                    Suggested Day-by-Day Stops ({draftResult.suggestedStops.length})
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {draftResult.suggestedStops.map((stop, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="px-1.5 py-0.5 bg-stone-200 text-stone-700 font-bold rounded text-[10px] mt-0.5">
                            Day {stop.dayNumber}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                              <span>{stop.title}</span>
                              <span className="text-stone-400 font-normal">({stop.location})</span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5">{stop.description}</p>
                          </div>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <div className="flex items-center gap-1 text-stone-500 text-[10px]">
                            <Clock className="w-3 h-3" />
                            {stop.time}
                          </div>
                          <span className="font-semibold text-stone-800 text-[11px]">
                            ₹{stop.estimatedCost.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Packing tips */}
                <div>
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                    Packing Essentials
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {draftResult.recommendedPackingItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-700 rounded text-[11px] flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-stone-700">Ready to plan your next adventure?</h4>
                <p className="text-xs text-stone-500 max-w-sm mt-1">
                  Provide your destination and preferences on the left, then click "Generate Itinerary Plan" to draft a full multi-day itinerary.
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            {draftResult && (
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Refresh Ideas
                </button>
                <button
                  type="button"
                  onClick={handleAdopt}
                  disabled={isAdopting}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isAdopting ? 'Creating...' : 'Adopt & Open Trip Workspace'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
