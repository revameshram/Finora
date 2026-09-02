import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  Sparkles, 
  Download, 
  Trash2, 
  MapPin, 
  Calendar, 
  Users, 
  IndianRupee, 
  HelpCircle,
  X,
  Compass,
  CreditCard,
  Luggage,
  CheckSquare,
  Layers
} from 'lucide-react';
import { 
  TripDto, 
  TripParticipantDto, 
  TripPlanStopDto, 
  TripCategoryBudgetDto, 
  TripExpenseDto, 
  TripInsightsDto, 
  UpdateTripRequest,
  TripStatus 
} from '../../types/trip';
import { tripApi } from '../../services/tripApi';
import { useToast } from '../shared/ToastContext';
import { OnboardingDrawer } from '../shared/OnboardingDrawer';
import { OverviewTab } from './OverviewTab';
import { PlanTab } from './PlanTab';
import { MoneyTab } from './MoneyTab';
import { PackAndPrepTab } from './PackAndPrepTab';
import { ChecklistTab } from './ChecklistTab';
import { TripPlannerProModal } from './TripPlannerProModal';

interface TripDetailProps {
  tripId: string;
  onBack: () => void;
}

export const TripDetail: React.FC<TripDetailProps> = ({ tripId, onBack }) => {
  const { toast } = useToast();
  const [trip, setTrip] = useState<TripDto | null>(null);
  const [participants, setParticipants] = useState<TripParticipantDto[]>([]);
  const [planStops, setPlanStops] = useState<TripPlanStopDto[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<TripCategoryBudgetDto[]>([]);
  const [expenses, setExpenses] = useState<TripExpenseDto[]>([]);
  const [insights, setInsights] = useState<TripInsightsDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'money' | 'pack' | 'checklist'>('overview');
  const [moneySubTab, setMoneySubTab] = useState<string>('budget');

  // Modals & Drawers
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isEditTripOpen, setIsEditTripOpen] = useState(false);
  const [isAiRegenerateOpen, setIsAiRegenerateOpen] = useState(false);

  // Edit Trip Form
  const [editName, setEditName] = useState('');
  const [editDest, setEditDest] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editStatus, setEditStatus] = useState<TripStatus>('UPCOMING');
  const [editBudget, setEditBudget] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [isUpdatingTrip, setIsUpdatingTrip] = useState(false);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      const [t, p, s, b, e, i] = await Promise.all([
        tripApi.getTrip(tripId),
        tripApi.getParticipants(tripId),
        tripApi.getPlanStops(tripId),
        tripApi.getCategoryBudgets(tripId),
        tripApi.getExpenses(tripId),
        tripApi.getInsights(tripId),
      ]);
      setTrip(t);
      setParticipants(p);
      setPlanStops(s);
      setCategoryBudgets(b);
      setExpenses(e);
      setInsights(i);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load trip workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const openEditTripModal = () => {
    if (!trip) return;
    setEditName(trip.name);
    setEditDest(trip.destination || '');
    setEditStart(trip.startDate || '');
    setEditEnd(trip.endDate || '');
    setEditStatus(trip.status);
    setEditBudget(trip.totalBudget ? trip.totalBudget.toString() : '');
    setEditDetails(trip.additionalDetails || '');
    setIsEditTripOpen(true);
  };

  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip || !editName.trim()) return;

    setIsUpdatingTrip(true);
    try {
      const req: UpdateTripRequest = {
        name: editName.trim(),
        destination: editDest.trim() || undefined,
        startDate: editStart || undefined,
        endDate: editEnd || undefined,
        status: editStatus,
        totalBudget: editBudget ? Number(editBudget) : 0,
        additionalDetails: editDetails.trim() || undefined,
      };
      const updated = await tripApi.updateTrip(trip.id, req);
      setTrip(updated);
      toast.success('Trip settings updated!');
      setIsEditTripOpen(false);
      fetchTripData();
    } catch (err) {
      console.error(err);
      toast.error('Could not update trip');
    } finally {
      setIsUpdatingTrip(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!trip) return;
    if (!confirm(`Delete "${trip.name}" and all its itineraries, expenses, and checklists?`)) return;

    try {
      await tripApi.deleteTrip(trip.id);
      toast.success('Trip deleted');
      onBack();
    } catch (err) {
      console.error(err);
      toast.error('Could not delete trip');
    }
  };

  const handleExportReport = () => {
    if (!trip) return;
    const summary = `FINORA TRIP SUMMARY REPORT: ${trip.name}
Destination: ${trip.destination || 'N/A'}
Dates: ${trip.startDate} to ${trip.endDate}
Budget: ₹${trip.totalBudget} | Spent: ₹${trip.totalSpent}
Participants: ${participants.length}
Generated via Finora Privacy-First Financial Suite`;

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.name.replace(/\s+/g, '_')}_Report.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Trip report exported!');
  };

  const handleNavigateTab = (tab: 'overview' | 'plan' | 'money' | 'pack' | 'checklist', subTab?: string) => {
    setActiveTab(tab);
    if (subTab) {
      setMoneySubTab(subTab);
    }
  };

  if (loading || !trip) {
    return (
      <div className="p-16 text-center text-stone-400">
        <Compass className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-600" />
        <p className="text-xs">Loading trip workspace...</p>
      </div>
    );
  }

  const allTravelersCount = participants.reduce((acc, p) => acc + 1 + (p.dependents ? p.dependents.length : 0), 0);

  return (
    <div className="space-y-6">
      {/* 6-Action Header Bar (§12.3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Trips
        </button>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setIsAiRegenerateOpen(true)}
            title="AI Regenerate Ideas"
            className="p-2 text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
          </button>
          <button
            onClick={openEditTripModal}
            title="Edit Trip Settings"
            className="p-2 text-stone-600 hover:text-stone-900 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportReport}
            title="Export Trip Report"
            className="p-2 text-stone-600 hover:text-stone-900 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeleteTrip}
            title="Delete Trip"
            className="p-2 text-stone-400 hover:text-rose-600 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOnboardingOpen(true)}
            title="Trip Manager Guide"
            className="p-2 text-stone-400 hover:text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Card (§12.3 / §16.5) */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2.5 mb-2">
            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
              trip.status === 'COMPLETED'
                ? 'bg-stone-800 text-stone-300 border-stone-700'
                : trip.status === 'ACTIVE'
                ? 'bg-emerald-900/80 text-emerald-300 border-emerald-700'
                : 'bg-amber-900/80 text-amber-300 border-amber-700'
            }`}>
              {trip.status}
            </span>
            <span className="text-xs text-amber-300 font-medium">Privacy-First Group Ledger</span>
          </div>

          <h2 className="text-2xl font-bold font-serif">{trip.name}</h2>
          {trip.additionalDetails && (
            <p className="text-xs text-stone-300 mt-1 line-clamp-2 leading-relaxed">
              {trip.additionalDetails}
            </p>
          )}

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-stone-300 pt-3 border-t border-stone-700/80">
            {trip.destination && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{trip.destination}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible'}
                {' → '}
                {trip.endDate ? new Date(trip.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>{allTravelersCount} Travelers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
              <span>₹{(trip.totalSpent || 0).toLocaleString('en-IN')} of ₹{(trip.totalBudget || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Navigation Tabs (§12.3 / §16.1–§16.3) */}
      <div className="flex border-b border-stone-200 bg-white rounded-xl px-4 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'plan'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Plan ({planStops.length})
        </button>

        <button
          onClick={() => setActiveTab('money')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'money'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Money
        </button>

        <button
          onClick={() => setActiveTab('pack')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'pack'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Luggage className="w-3.5 h-3.5" />
          Pack & Prep
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'checklist'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Checklist ({trip.checklistOpenCount})
        </button>
      </div>

      {/* Active Tab Component */}
      {activeTab === 'overview' && (
        <OverviewTab
          trip={trip}
          participants={participants}
          planStops={planStops}
          insights={insights}
          onRefresh={fetchTripData}
          onNavigateTab={handleNavigateTab}
        />
      )}

      {activeTab === 'plan' && (
        <PlanTab
          trip={trip}
          planStops={planStops}
          participants={participants}
          onRefresh={fetchTripData}
        />
      )}

      {activeTab === 'money' && (
        <MoneyTab
          trip={trip}
          categoryBudgets={categoryBudgets}
          expenses={expenses}
          participants={participants}
          insights={insights}
          activeSubTab={moneySubTab}
          onRefresh={fetchTripData}
        />
      )}

      {activeTab === 'pack' && (
        <PackAndPrepTab
          trip={trip}
          onRefresh={fetchTripData}
        />
      )}

      {activeTab === 'checklist' && (
        <ChecklistTab
          trip={trip}
          participants={participants}
          onRefresh={fetchTripData}
        />
      )}

      {/* Edit Trip Modal */}
      {isEditTripOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="text-base font-bold text-stone-900">Edit Trip Settings</h3>
              <button onClick={() => setIsEditTripOpen(false)}>
                <X className="w-5 h-5 text-stone-400 hover:text-stone-700" />
              </button>
            </div>

            <form onSubmit={handleUpdateTrip} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Trip Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Destination</label>
                <input
                  type="text"
                  value={editDest}
                  onChange={(e) => setEditDest(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as TripStatus)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Total Budget (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditTripOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingTrip || !editName.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isUpdatingTrip ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Regenerate Modal */}
      <TripPlannerProModal
        isOpen={isAiRegenerateOpen}
        onClose={() => setIsAiRegenerateOpen(false)}
        onAdoptTrip={async (_req, stops) => {
          if (stops && stops.length > 0) {
            for (const stop of stops) {
              const stopDate = trip.startDate || new Date().toISOString().split('T')[0];
              await tripApi.createPlanStop(trip.id, {
                stopDate,
                stopTime: stop.time,
                title: stop.title,
                category: (stop.category as any) || 'ACTIVITY',
                location: stop.location,
                description: stop.description,
                estimatedCost: stop.estimatedCost,
              });
            }
            toast.success('Generated stops added to current itinerary!');
            fetchTripData();
          }
        }}
      />

      {/* Shared Onboarding Guide Drawer (§12.1.1) */}
      <OnboardingDrawer
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        moduleName="Trip Manager"
        subtitle="Group Itinerary & Multi-Currency Ledger"
        icon={Compass}
        steps={[
          {
            stepNumber: 1,
            title: '1. Create Trip & Itinerary',
            description: 'Start with Trip Planner Pro for instant multi-day drafts or create a manual trip workspace with departure and dates.',
            tip: 'Use the 4 deep-link tiles on the Overview tab to quickly jump into specific sub-sections.',
          },
          {
            stepNumber: 2,
            title: '2. Travelers & Family Nesting',
            description: 'Add participants and drag children/dependents to nest them under parents for clear family grouping.',
            tip: 'Single-level nesting keeps family expenses organized without confusing hierarchies.',
          },
          {
            stepNumber: 3,
            title: '3. Log Expenses & Smart Split',
            description: 'Record trip spending across 7 fixed travel categories and run the Smart Split Calculator (By Shares or Percentage).',
            tip: 'Multi-currency expenses are automatically normalized into your base INR currency.',
          },
          {
            stepNumber: 4,
            title: '4. Settle Balances & Pack Luggage',
            description: 'Review pairwise debt suggestions on the Settle tab and track luggage using one-tap Quick-Add templates.',
            tip: 'Export a PDF/Text report when wrapping up before archiving.',
          },
        ]}
        tipsChecklist={[
          { id: 'tip_ai_plan', label: 'Use Trip Planner Pro for a fast starting itinerary, then adjust it by hand' },
          { id: 'tip_log_as_you_go', label: 'Log expenses as you go rather than reconstructing them after the trip' },
          { id: 'tip_export_report', label: 'Export a trip report once the trip wraps up, before archiving it' },
        ]}
      />
    </div>
  );
};
