import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Sparkles, 
  Database, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowRight, 
  Search 
} from 'lucide-react';
import { TripDto, CreateTripRequest, AiTripPlanResponse } from '../../types/trip';
import { tripApi } from '../../services/tripApi';
import { useToast } from '../shared/ToastContext';
import { CreateTripModal } from './CreateTripModal';
import { TripPlannerProModal } from './TripPlannerProModal';

interface TripListProps {
  onSelectTrip: (tripId: string) => void;
}

export const TripList: React.FC<TripListProps> = ({ onSelectTrip }) => {
  const { toast } = useToast();
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await tripApi.listTrips();
      setTrips(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleCreateManual = async (req: CreateTripRequest) => {
    try {
      const created = await tripApi.createTrip(req);
      toast.success('Trip created successfully!');
      fetchTrips();
      onSelectTrip(created.id);
    } catch (err) {
      console.error(err);
      toast.error('Could not create trip');
    }
  };

  const handleAdoptAiTrip = async (req: CreateTripRequest, stops?: AiTripPlanResponse['suggestedStops']) => {
    try {
      const created = await tripApi.createTrip(req);
      if (stops && stops.length > 0) {
        for (const stop of stops) {
          const stopDate = req.startDate 
            ? new Date(new Date(req.startDate).getTime() + (stop.dayNumber - 1) * 86400000).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

          await tripApi.createPlanStop(created.id, {
            stopDate,
            stopTime: stop.time,
            title: stop.title,
            category: (stop.category as any) || 'ACTIVITY',
            location: stop.location,
            description: stop.description,
            estimatedCost: stop.estimatedCost,
          });
        }
      }
      toast.success('AI Itinerary adopted into new trip workspace!');
      fetchTrips();
      onSelectTrip(created.id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to adopt AI trip');
    }
  };

  const handleSeedSampleData = async () => {
    try {
      setSeeding(true);
      const sample = await tripApi.seedSampleVietnam();
      toast.success('Sample Vietnam Trip seeded with 8 travelers & full itinerary!');
      fetchTrips();
      onSelectTrip(sample.id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to seed sample data');
    } finally {
      setSeeding(false);
    }
  };

  const filteredTrips = trips.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.destination && t.destination.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-stone-900">Trip Manager</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
              Privacy-First Group Ledger
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Day-by-day itinerary planning, multi-currency group expense splitting, and luggage checklists
          </p>
        </div>

        {/* Global Action Strip */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiPlannerOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Trip Planner Pro
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Trip
          </button>
        </div>
      </div>

      {/* Getting Started Card (Observed §12.1 / §12.1.1) */}
      {trips.length === 0 && !loading && (
        <div className="p-6 bg-stone-50/70 border border-stone-200 rounded-2xl">
          <div className="max-w-2xl">
            <h3 className="text-base font-bold text-stone-900">
              Create a trip to plan your itinerary, track expenses, and settle with travelers.
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              Organize your travel details into 5 specialized workspaces: Overview, Plan, Money, Pack & Prep, and Checklist.
            </p>

            {/* 3 Numbered Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <div className="p-3.5 bg-white border border-stone-200 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center mb-2">
                  1
                </div>
                <h4 className="text-xs font-bold text-stone-900">Create a Trip</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">Use Trip Planner Pro or create a manual trip workspace.</p>
              </div>

              <div className="p-3.5 bg-white border border-stone-200 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center mb-2">
                  2
                </div>
                <h4 className="text-xs font-bold text-stone-900">Add Travelers</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">Manage participants with family & dependent nesting.</p>
              </div>

              <div className="p-3.5 bg-white border border-stone-200 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center mb-2">
                  3
                </div>
                <h4 className="text-xs font-bold text-stone-900">Plan & Settle</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">Log expenses, run Smart Split, and track luggage packing.</p>
              </div>
            </div>

            {/* 3 CTAs */}
            <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-stone-200/80">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Create your first trip
              </button>
              <button
                onClick={() => setIsAiPlannerOpen(true)}
                className="px-4 py-2 text-xs font-bold text-amber-900 bg-amber-100/70 border border-amber-300/80 hover:bg-amber-200/70 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Trip Planner Pro <span className="text-[10px] text-amber-700 opacity-80">(20/20)</span>
              </button>
              <button
                onClick={handleSeedSampleData}
                disabled={seeding}
                className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5 text-stone-500" />
                {seeding ? 'Seeding Vietnam Demo...' : 'Try with sample data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trips Grid & Search */}
      {trips.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trips by title or destination..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 self-end">
              <button
                onClick={handleSeedSampleData}
                disabled={seeding}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <Database className="w-3.5 h-3.5" />
                {seeding ? 'Seeding...' : '+ Add Sample Vietnam Trip'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTrips.map((t) => {
              const budget = t.totalBudget || 0;
              const spent = t.totalSpent || 0;
              const utilPercent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTrip(t.id)}
                  className="group bg-white border border-stone-200 rounded-2xl p-5 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        t.status === 'COMPLETED' 
                          ? 'bg-stone-100 text-stone-700 border-stone-200' 
                          : t.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {t.status}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {t.participantsCount} {t.participantsCount === 1 ? 'Traveler' : 'Travelers'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-stone-900 mt-2.5 group-hover:text-amber-800 transition-colors line-clamp-1">
                      {t.name}
                    </h3>

                    {/* Destination & Dates */}
                    <div className="space-y-1 mt-2 text-xs text-stone-500">
                      {t.destination && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          <span className="line-clamp-1">{t.destination}</span>
                        </div>
                      )}
                      {(t.startDate || t.endDate) && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          <span>
                            {t.startDate ? new Date(t.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible'}
                            {' → '}
                            {t.endDate ? new Date(t.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metrics Strip */}
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-stone-100 text-center">
                      <div className="p-1.5 bg-stone-50 rounded-lg">
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">Plan Stops</span>
                        <span className="text-xs font-bold text-stone-800">{t.stopsCount}</span>
                      </div>
                      <div className="p-1.5 bg-stone-50 rounded-lg">
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">Checklist</span>
                        <span className="text-xs font-bold text-stone-800">{t.checklistTotalCount - t.checklistOpenCount}/{t.checklistTotalCount}</span>
                      </div>
                      <div className="p-1.5 bg-stone-50 rounded-lg">
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">Packing</span>
                        <span className="text-xs font-bold text-stone-800">{t.packingPackedCount}/{t.packingTotalCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Budget Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-stone-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-stone-500 font-medium">Spent: ₹{spent.toLocaleString('en-IN')}</span>
                      <span className="font-bold text-stone-900">
                        {budget > 0 ? `₹${budget.toLocaleString('en-IN')}` : 'No Budget Set'}
                      </span>
                    </div>
                    {budget > 0 && (
                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            utilPercent > 90 ? 'bg-rose-500' : utilPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${utilPercent}%` }}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3 text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform">
                      <span>Open Trip Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateTripModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateManual}
      />

      <TripPlannerProModal
        isOpen={isAiPlannerOpen}
        onClose={() => setIsAiPlannerOpen(false)}
        onAdoptTrip={handleAdoptAiTrip}
      />
    </div>
  );
};
