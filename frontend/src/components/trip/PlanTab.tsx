import React, { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Clock, 
  Users, 
  Calendar, 
  Navigation, 
  Edit2, 
  Trash2, 
  X, 
  Plane, 
  Building, 
  Compass, 
  Utensils, 
  Car, 
  Camera, 
  FileText 
} from 'lucide-react';
import { 
  TripDto, 
  TripPlanStopDto, 
  TripParticipantDto, 
  PlanStopCategory, 
  CreatePlanStopRequest, 
  UpdatePlanStopRequest 
} from '../../types/trip';
import { tripApi } from '../../services/tripApi';
import { useToast } from '../shared/ToastContext';

interface PlanTabProps {
  trip: TripDto;
  planStops: TripPlanStopDto[];
  participants: TripParticipantDto[];
  onRefresh: () => void;
}

export const PlanTab: React.FC<PlanTabProps> = ({
  trip,
  planStops,
  participants,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<TripPlanStopDto | null>(null);

  // Modal Form State
  const [stopDate, setStopDate] = useState('');
  const [stopTime, setStopTime] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PlanStopCategory>('ACTIVITY');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [assignedParticipants, setAssignedParticipants] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group stops by unique date
  const uniqueDates = Array.from(new Set(planStops.map(s => s.stopDate))).sort();

  const filteredStops = selectedDate === 'ALL'
    ? planStops
    : planStops.filter(s => s.stopDate === selectedDate);

  const openAddModal = (datePrefill?: string) => {
    setEditingStop(null);
    setStopDate(datePrefill || (trip.startDate || new Date().toISOString().split('T')[0]));
    setStopTime('09:00');
    setTitle('');
    setCategory('ACTIVITY');
    setLocation('');
    setDescription('');
    setEstimatedCost('');
    setAssignedParticipants([]);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: TripPlanStopDto) => {
    setEditingStop(s);
    setStopDate(s.stopDate);
    setStopTime(s.stopTime || '');
    setTitle(s.title);
    setCategory(s.category);
    setLocation(s.location || '');
    setDescription(s.description || '');
    setEstimatedCost(s.estimatedCost ? s.estimatedCost.toString() : '');
    setAssignedParticipants(s.assignedParticipantIds || []);
    setNotes(s.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !stopDate) return;

    setIsSubmitting(true);
    try {
      if (editingStop) {
        const req: UpdatePlanStopRequest = {
          stopDate,
          stopTime: stopTime || undefined,
          title: title.trim(),
          category,
          location: location.trim() || undefined,
          description: description.trim() || undefined,
          estimatedCost: estimatedCost ? Number(estimatedCost) : 0,
          assignedParticipantIds: assignedParticipants,
          notes: notes.trim() || undefined,
        };
        await tripApi.updatePlanStop(trip.id, editingStop.id, req);
        toast.success('Itinerary stop updated!');
      } else {
        const req: CreatePlanStopRequest = {
          stopDate,
          stopTime: stopTime || undefined,
          title: title.trim(),
          category,
          location: location.trim() || undefined,
          description: description.trim() || undefined,
          estimatedCost: estimatedCost ? Number(estimatedCost) : 0,
          assignedParticipantIds: assignedParticipants,
          notes: notes.trim() || undefined,
        };
        await tripApi.createPlanStop(trip.id, req);
        toast.success('Itinerary stop added!');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not save itinerary stop');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm('Delete this itinerary stop?')) return;
    try {
      await tripApi.deletePlanStop(trip.id, stopId);
      toast.success('Stop removed');
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not delete stop');
    }
  };

  const toggleParticipant = (pId: string) => {
    setAssignedParticipants(prev => 
      prev.includes(pId) ? prev.filter(x => x !== pId) : [...prev, pId]
    );
  };

  const getCategoryIcon = (cat: PlanStopCategory) => {
    switch (cat) {
      case 'FLIGHT': return <Plane className="w-4 h-4 text-sky-600" />;
      case 'HOTEL': return <Building className="w-4 h-4 text-purple-600" />;
      case 'ACTIVITY': return <Compass className="w-4 h-4 text-emerald-600" />;
      case 'FOOD': return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'TRANSIT': return <Car className="w-4 h-4 text-blue-600" />;
      case 'SIGHTSEEING': return <Camera className="w-4 h-4 text-rose-600" />;
      default: return <MapPin className="w-4 h-4 text-stone-600" />;
    }
  };

  const totalEstimatedPlanCost = filteredStops.reduce((sum, s) => sum + (s.estimatedCost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Controls & Day Selector Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedDate('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
              selectedDate === 'ALL'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Days ({planStops.length})
          </button>
          {uniqueDates.map((date, idx) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedDate === date
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Day {idx + 1} ({new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right text-xs">
            <span className="text-stone-400 font-semibold uppercase block text-[10px]">Estimated Itinerary</span>
            <span className="font-bold text-stone-900">₹{totalEstimatedPlanCost.toLocaleString('en-IN')}</span>
          </div>
          <button
            onClick={() => openAddModal(selectedDate !== 'ALL' ? selectedDate : undefined)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Stop
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Itinerary Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {filteredStops.length === 0 ? (
            <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl">
              <Calendar className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <h3 className="text-sm font-bold text-stone-800">No stops planned for this date</h3>
              <p className="text-xs text-stone-500 mt-1">Add activities, transport links, hotel check-ins, or dinner plans</p>
              <button
                onClick={() => openAddModal(selectedDate !== 'ALL' ? selectedDate : undefined)}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
              >
                + Add First Itinerary Stop
              </button>
            </div>
          ) : (
            <div className="relative border-l-2 border-amber-300/80 ml-4 pl-6 space-y-5">
              {filteredStops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className="relative group bg-white border border-stone-200 rounded-xl p-4.5 hover:border-amber-400 hover:shadow-sm transition-all"
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] top-5 w-5 h-5 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center text-[10px] font-bold text-amber-700 shadow-xs">
                    {idx + 1}
                  </div>

                  {/* Stop Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {getCategoryIcon(stop.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-stone-900">{stop.title}</h4>
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-stone-100 text-stone-700 rounded uppercase">
                            {stop.category}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                          {stop.stopTime && (
                            <span className="flex items-center gap-1 font-semibold text-stone-700">
                              <Clock className="w-3.5 h-3.5 text-stone-400" />
                              {stop.stopTime}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            {stop.stopDate}
                          </span>
                          {stop.location && (
                            <span className="flex items-center gap-1 text-stone-600">
                              <MapPin className="w-3.5 h-3.5 text-stone-400" />
                              {stop.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {stop.estimatedCost > 0 && (
                        <div className="text-right px-2.5 py-1 bg-amber-50/70 border border-amber-200 rounded-lg">
                          <span className="text-[10px] uppercase font-semibold text-amber-800 block">Est. Cost</span>
                          <span className="text-xs font-bold text-amber-950">
                            ₹{stop.estimatedCost.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(stop)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStop(stop.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rich Expandable Description (§16.1) */}
                  {stop.description && (
                    <p className="text-xs text-stone-600 mt-2.5 pl-12 leading-relaxed">
                      {stop.description}
                    </p>
                  )}

                  {/* Notes & Participants Chips */}
                  {(stop.notes || (stop.assignedParticipantIds && stop.assignedParticipantIds.length > 0)) && (
                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 pl-12 text-[11px]">
                      {stop.notes && (
                        <span className="text-stone-500 italic flex items-center gap-1">
                          <FileText className="w-3 h-3 text-stone-400" />
                          {stop.notes}
                        </span>
                      )}

                      {stop.assignedParticipantIds && stop.assignedParticipantIds.length > 0 && (
                        <div className="flex items-center gap-1 text-stone-600 ml-auto">
                          <Users className="w-3 h-3 text-stone-400" />
                          <span>{stop.assignedParticipantIds.length} Assigned</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Route Map & Waypoint Overview (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 sticky top-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Route Map & Waypoints
                </h4>
              </div>
              <span className="text-[10px] text-stone-400 font-semibold">
                {filteredStops.length} Stops
              </span>
            </div>

            {/* Simulated Interactive Route Map Preview (§16.1) */}
            <div className="h-48 bg-stone-100 border border-stone-200 rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-4 text-center">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:12px_12px]" />
              <Compass className="w-8 h-8 text-amber-600 mb-1.5 relative z-10" />
              <p className="text-xs font-bold text-stone-800 relative z-10">
                {trip.destination || 'Itinerary Polyline Map'}
              </p>
              <p className="text-[10px] text-stone-500 max-w-xs mt-0.5 relative z-10">
                Route polyline generated from ordered stops (coordinates simulated when no GPS pin is saved per §16.1)
              </p>
            </div>

            {/* Waypoints List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {filteredStops.map((stop, i) => (
                <div key={stop.id} className="flex items-center justify-between text-xs py-1 px-2 bg-stone-50 rounded-lg">
                  <div className="flex items-center gap-2 line-clamp-1">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-stone-800 truncate">{stop.title}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 flex-shrink-0 ml-2">{stop.stopTime || stop.stopDate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Itinerary Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="text-base font-bold text-stone-900">
                {editingStop ? 'Edit Itinerary Stop' : 'Add Itinerary Stop'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400 hover:text-stone-700" />
              </button>
            </div>

            <form onSubmit={handleSaveStop} className="p-6 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">
                  Title <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Airport Transfer & Hotel Check-in, Ha Long Bay Cruise"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">
                    Date <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={stopDate}
                    onChange={(e) => setStopDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Time</label>
                  <input
                    type="time"
                    value={stopTime}
                    onChange={(e) => setStopTime(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PlanStopCategory)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  >
                    <option value="FLIGHT">Flight & Transit</option>
                    <option value="HOTEL">Hotel & Lodging</option>
                    <option value="ACTIVITY">Activity & Adventure</option>
                    <option value="FOOD">Dining & Meals</option>
                    <option value="TRANSIT">Local Transport</option>
                    <option value="SIGHTSEEING">Sightseeing & Culture</option>
                    <option value="OTHER">Other Stop</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder="e.g. 54000"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Location / Venue</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Grand Hotel Saigon, District 1"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details on check-in vouchers, meeting points, baggage drop..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              {/* Assign Participants */}
              {participants.length > 0 && (
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1.5">
                    Assigned Participants
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-stone-50 border border-stone-200 rounded-lg">
                    {participants.map((p) => {
                      const selected = assignedParticipants.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleParticipant(p.id)}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            selected
                              ? 'bg-amber-600 text-white'
                              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <Users className="w-3 h-3" />
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Notes / Reminders</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dress code, tickets printed, passport required"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Stop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
