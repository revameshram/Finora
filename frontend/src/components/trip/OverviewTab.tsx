import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  IndianRupee, 
  CheckSquare, 
  Luggage, 
  ChevronRight, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Baby, 
  ShieldCheck, 
  Car, 
  Utensils, 
  Compass, 
  X,
  ArrowRight
} from 'lucide-react';
import { 
  TripDto, 
  TripParticipantDto, 
  TripPlanStopDto, 
  TripInsightsDto, 
  CreateParticipantRequest, 
  UpdateParticipantRequest,
  ParticipantCategory 
} from '../../types/trip';
import { tripApi } from '../../services/tripApi';
import { useToast } from '../shared/ToastContext';

interface OverviewTabProps {
  trip: TripDto;
  participants: TripParticipantDto[];
  planStops: TripPlanStopDto[];
  insights: TripInsightsDto | null;
  onRefresh: () => void;
  onNavigateTab: (tab: 'overview' | 'plan' | 'money' | 'pack' | 'checklist', subTab?: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  trip,
  participants,
  planStops,
  insights,
  onRefresh,
  onNavigateTab,
}) => {
  const { toast } = useToast();
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<TripParticipantDto | null>(null);
  const [draggedParticipantId, setDraggedParticipantId] = useState<string | null>(null);

  // Add/Edit Participant Form State
  const [partName, setPartName] = useState('');
  const [partEmail, setPartEmail] = useState('');
  const [partMobile, setPartMobile] = useState('');
  const [partDob, setPartDob] = useState('');
  const [partLang, setPartLang] = useState('');
  const [partFood, setPartFood] = useState('');
  const [partCategory, setPartCategory] = useState<ParticipantCategory>('TOURIST');
  const [partParentId, setPartParentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = (parentId?: string) => {
    setEditingParticipant(null);
    setPartName('');
    setPartEmail('');
    setPartMobile('');
    setPartDob('');
    setPartLang('English');
    setPartFood('');
    setPartCategory('TOURIST');
    setPartParentId(parentId || '');
    setIsAddParticipantOpen(true);
  };

  const openEditModal = (p: TripParticipantDto) => {
    setEditingParticipant(p);
    setPartName(p.name);
    setPartEmail(p.email || '');
    setPartMobile(p.mobile || '');
    setPartDob(p.dob || '');
    setPartLang(p.preferredLanguage || '');
    setPartFood(p.foodPreferences || '');
    setPartCategory(p.category);
    setPartParentId(p.parentParticipantId || '');
    setIsAddParticipantOpen(true);
  };

  const handleSaveParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingParticipant) {
        const req: UpdateParticipantRequest = {
          name: partName.trim(),
          email: partEmail.trim() || undefined,
          mobile: partMobile.trim() || undefined,
          dob: partDob || undefined,
          preferredLanguage: partLang.trim() || undefined,
          foodPreferences: partFood.trim() || undefined,
          category: partCategory,
          parentParticipantId: partParentId || undefined,
        };
        await tripApi.updateParticipant(trip.id, editingParticipant.id, req);
        toast.success('Participant details updated!');
      } else {
        const req: CreateParticipantRequest = {
          name: partName.trim(),
          email: partEmail.trim() || undefined,
          mobile: partMobile.trim() || undefined,
          dob: partDob || undefined,
          preferredLanguage: partLang.trim() || undefined,
          foodPreferences: partFood.trim() || undefined,
          category: partCategory,
          parentParticipantId: partParentId || undefined,
        };
        await tripApi.createParticipant(trip.id, req);
        toast.success('Traveler added to group!');
      }
      setIsAddParticipantOpen(false);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save participant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteParticipant = async (pId: string, name: string) => {
    if (!confirm(`Remove ${name} from this trip?`)) return;
    try {
      await tripApi.deleteParticipant(trip.id, pId);
      toast.success(`${name} removed`);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not remove participant');
    }
  };

  // Drag-and-Drop Dependent Nesting Handlers (§16.4 / §18.1 Phase 5)
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedParticipantId(id);
  };

  const handleDropOnParent = async (e: React.DragEvent, targetParentId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    setDraggedParticipantId(null);
    if (!draggedId || draggedId === targetParentId) return;

    try {
      await tripApi.updateParticipant(trip.id, draggedId, {
        parentParticipantId: targetParentId,
      });
      toast.success('Traveler nested under family parent!');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Could not nest participant');
    }
  };

  const handleUnnest = async (participantId: string) => {
    try {
      await tripApi.updateParticipant(trip.id, participantId, {
        parentParticipantId: undefined,
      });
      toast.success('Unnested to standalone traveler');
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not unnest');
    }
  };

  // Next Plan Stop
  const nextStop = planStops.length > 0 ? planStops[0] : null;

  // Flattened total travelers count
  const allTravelersCount = participants.reduce((acc, p) => acc + 1 + (p.dependents ? p.dependents.length : 0), 0);

  const getCategoryBadge = (cat: ParticipantCategory) => {
    switch (cat) {
      case 'TRAVEL_MANAGER':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-full flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Travel Manager</span>;
      case 'DRIVER':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full flex items-center gap-1"><Car className="w-3 h-3" /> Driver</span>;
      case 'COOK':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 rounded-full flex items-center gap-1"><Utensils className="w-3 h-3" /> Cook</span>;
      case 'GUIDE':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1"><Compass className="w-3 h-3" /> Guide</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200 rounded-full">Tourist</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Deep-Link Dashboard Tiles (§12.3 / §16.5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Next on Plan */}
        <div 
          onClick={() => onNavigateTab('plan')}
          className="p-4 bg-white border border-stone-200 rounded-xl hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-amber-600" /> Next on Plan</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            {nextStop ? (
              <div>
                <h4 className="text-sm font-bold text-stone-900 line-clamp-1">{nextStop.title}</h4>
                <p className="text-xs text-stone-500 mt-0.5">{nextStop.stopDate} {nextStop.stopTime && `• ${nextStop.stopTime}`}</p>
                {nextStop.location && <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">📍 {nextStop.location}</p>}
              </div>
            ) : (
              <div className="py-2 text-stone-400 text-xs italic">
                No stops scheduled yet
              </div>
            )}
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-amber-700">
            <span>Open Day Itinerary</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Tile 2: Budget */}
        <div 
          onClick={() => onNavigateTab('money', 'budget')}
          className="p-4 bg-white border border-stone-200 rounded-xl hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5 text-amber-600" /> Budget Status</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold font-serif text-stone-900">
                  ₹{(trip.totalSpent || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-stone-400">
                  of {trip.totalBudget > 0 ? `₹${trip.totalBudget.toLocaleString('en-IN')}` : '₹0'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {insights ? `${insights.usedPercent}% utilized • ₹${Math.max(0, insights.budgetLeft).toLocaleString('en-IN')} left` : '0% utilized'}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-amber-700">
            <span>View Budget vs Plan</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Tile 3: Checklist */}
        <div 
          onClick={() => onNavigateTab('checklist')}
          className="p-4 bg-white border border-stone-200 rounded-xl hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5 text-amber-600" /> Checklist</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div>
              <div className="text-lg font-bold font-serif text-stone-900">
                {trip.checklistOpenCount} open tasks
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {trip.checklistTotalCount - trip.checklistOpenCount} of {trip.checklistTotalCount} tasks completed
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-amber-700">
            <span>Manage Preps</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Tile 4: Packing */}
        <div 
          onClick={() => onNavigateTab('pack')}
          className="p-4 bg-white border border-stone-200 rounded-xl hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5"><Luggage className="w-3.5 h-3.5 text-amber-600" /> Packing List</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div>
              <div className="text-lg font-bold font-serif text-stone-900">
                {trip.packingPackedCount} / {trip.packingTotalCount} Packed
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {trip.packingTotalCount === 0 ? 'No items seeded yet' : `${Math.round((trip.packingPackedCount / Math.max(1, trip.packingTotalCount)) * 100)}% luggage packed`}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-amber-700">
            <span>Open Packing Bag</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Participants & Dependent Nesting Section (§16.4 / §16.13) */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">Trip Participants</h3>
              <span className="px-2 py-0.5 text-xs font-bold bg-stone-100 text-stone-800 rounded-full">
                {allTravelersCount} {allTravelersCount === 1 ? 'Person' : 'People'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage travelers, travel managers, drivers, and drag-and-drop children to nest under family parents
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openAddModal()}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Participant
            </button>
          </div>
        </div>

        {/* Participants Cards Grid */}
        <div className="mt-6 space-y-4">
          {participants.length === 0 ? (
            <div className="py-10 text-center text-stone-400">
              <Users className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="text-xs font-medium">No participants added yet.</p>
              <button
                onClick={() => openAddModal()}
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100"
              >
                + Add First Traveler
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participants.map((p) => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, p.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnParent(e, p.id)}
                  className={`p-4 bg-stone-50/70 border ${
                    draggedParticipantId === p.id ? 'border-amber-400 opacity-60' : 'border-stone-200'
                  } rounded-xl hover:border-stone-300 transition-all space-y-3`}
                >
                  {/* Parent Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-700">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-stone-900">{p.name}</h4>
                          {getCategoryBadge(p.category)}
                        </div>
                        <p className="text-[11px] text-stone-500">
                          {p.email || p.mobile || 'No contact details'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openAddModal(p.id)}
                        title="Add child dependent under this traveler"
                        className="p-1 text-stone-400 hover:text-amber-600 rounded hover:bg-stone-200/50"
                      >
                        <Baby className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-200/50"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteParticipant(p.id, p.name)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-200/50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  {(p.foodPreferences || p.preferredLanguage || p.dob) && (
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-600">
                      {p.dob && (
                        <span className="px-2 py-0.5 bg-white border border-stone-200 rounded">
                          DOB: {p.dob}
                        </span>
                      )}
                      {p.preferredLanguage && (
                        <span className="px-2 py-0.5 bg-white border border-stone-200 rounded">
                          🗣️ {p.preferredLanguage}
                        </span>
                      )}
                      {p.foodPreferences && (
                        <span className="px-2 py-0.5 bg-white border border-stone-200 rounded">
                          🥗 {p.foodPreferences}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Nested Family / Child Dependents (§16.4) */}
                  {p.dependents && p.dependents.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-stone-200/70 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                        Family Dependents ({p.dependents.length})
                      </span>
                      {p.dependents.map((child) => (
                        <div
                          key={child.id}
                          className="pl-3 py-1.5 border-l-2 border-amber-400 bg-white rounded-r-lg flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Baby className="w-3.5 h-3.5 text-amber-600" />
                            <div>
                              <span className="font-bold text-stone-900">{child.name}</span>
                              <span className="text-[10px] text-stone-400 ml-1.5">
                                (of {p.name}{child.dob ? ` • DOB ${child.dob}` : ''})
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 pr-2">
                            <button
                              onClick={() => handleUnnest(child.id)}
                              title="Unnest from family"
                              className="text-[10px] text-stone-400 hover:text-stone-700 underline"
                            >
                              Unnest
                            </button>
                            <button
                              onClick={() => handleDeleteParticipant(child.id, child.name)}
                              className="p-1 text-stone-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Participant Modal */}
      {isAddParticipantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="text-base font-bold text-stone-900">
                {editingParticipant ? 'Edit Participant Details' : 'Add Trip Participant'}
              </h3>
              <button onClick={() => setIsAddParticipantOpen(false)}>
                <X className="w-5 h-5 text-stone-400 hover:text-stone-700" />
              </button>
            </div>

            <form onSubmit={handleSaveParticipant} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">
                  Full Name <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={partEmail}
                    onChange={(e) => setPartEmail(e.target.value)}
                    placeholder="rajesh@example.com"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Mobile</label>
                  <input
                    type="text"
                    value={partMobile}
                    onChange={(e) => setPartMobile(e.target.value)}
                    placeholder="+91 98200 00000"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Role / Category</label>
                  <select
                    value={partCategory}
                    onChange={(e) => setPartCategory(e.target.value as ParticipantCategory)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  >
                    <option value="TOURIST">Tourist</option>
                    <option value="TRAVEL_MANAGER">Travel Manager</option>
                    <option value="DRIVER">Driver</option>
                    <option value="COOK">Cook</option>
                    <option value="GUIDE">Guide</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={partDob}
                    onChange={(e) => setPartDob(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Preferred Language</label>
                  <input
                    type="text"
                    value={partLang}
                    onChange={(e) => setPartLang(e.target.value)}
                    placeholder="Hindi, English"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Food / Dietary</label>
                  <input
                    type="text"
                    value={partFood}
                    onChange={(e) => setPartFood(e.target.value)}
                    placeholder="Vegetarian, Jain, Vegan"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Family Nesting Parent Selection */}
              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">
                  Nest Under Family Parent (Optional)
                </label>
                <select
                  value={partParentId}
                  onChange={(e) => setPartParentId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                >
                  <option value="">-- Standalone Traveler (No Parent) --</option>
                  {participants
                    .filter((p) => p.id !== editingParticipant?.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.category})
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddParticipantOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !partName.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Traveler'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
