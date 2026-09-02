import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Users, 
  Check, 
  Trash2, 
  X, 
  Edit2
} from 'lucide-react';
import { 
  TripDto, 
  TripChecklistItemDto, 
  TripParticipantDto, 
  ChecklistPriority, 
  CreateChecklistItemRequest, 
  UpdateChecklistItemRequest 
} from '../../types/trip';
import { tripApi } from '../../services/tripApi';
import { useToast } from '../shared/ToastContext';

interface ChecklistTabProps {
  trip: TripDto;
  participants: TripParticipantDto[];
  onRefresh: () => void;
}

export const ChecklistTab: React.FC<ChecklistTabProps> = ({
  trip,
  participants,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TripChecklistItemDto[]>([]);
  const [_loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'COMPLETED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TripChecklistItemDto | null>(null);

  // Modal Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState<ChecklistPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [assignedParticipantId, setAssignedParticipantId] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await tripApi.getChecklistItems(trip.id);
      setTasks(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [trip.id]);

  const openAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setCategory('Pre-Trip Preparation');
    setPriority('MEDIUM');
    setDueDate(trip.startDate || '');
    setAssignedParticipantId('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: TripChecklistItemDto) => {
    setEditingTask(t);
    setTitle(t.title);
    setCategory(t.category);
    setPriority(t.priority);
    setDueDate(t.dueDate || '');
    setAssignedParticipantId(t.assignedParticipantId || '');
    setDescription(t.description || '');
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingTask) {
        const req: UpdateChecklistItemRequest = {
          title: title.trim(),
          category: category.trim() || 'General',
          priority,
          dueDate: dueDate || undefined,
          assignedParticipantId: assignedParticipantId || undefined,
          description: description.trim() || undefined,
        };
        await tripApi.updateChecklistItem(trip.id, editingTask.id, req);
        toast.success('Task updated!');
      } else {
        const req: CreateChecklistItemRequest = {
          title: title.trim(),
          category: category.trim() || 'General',
          priority,
          dueDate: dueDate || undefined,
          assignedParticipantId: assignedParticipantId || undefined,
          description: description.trim() || undefined,
        };
        await tripApi.createChecklistItem(trip.id, req);
        toast.success('Task added to checklist!');
      }
      setIsModalOpen(false);
      fetchTasks();
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleDone = async (task: TripChecklistItemDto) => {
    try {
      await tripApi.updateChecklistItem(trip.id, task.id, { done: !task.done });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !task.done } : t));
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not toggle task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tripApi.deleteChecklistItem(trip.id, taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Could not delete task');
    }
  };

  const allTravelers = participants.flatMap(p => [p, ...(p.dependents || [])]);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'OPEN') return !t.done;
    if (filter === 'COMPLETED') return t.done;
    return true;
  });

  const openCount = tasks.filter(t => !t.done).length;
  const completedCount = tasks.filter(t => t.done).length;

  const getPriorityBadge = (p: ChecklistPriority) => {
    switch (p) {
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">MED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-stone-100 text-stone-600 rounded">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter and Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filter === 'ALL'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('OPEN')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'OPEN'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Open ({openCount})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'COMPLETED'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        <button
          onClick={openAddModal}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 self-end sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Task
        </button>
      </div>

      {/* Tasks List */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <CheckSquare className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <h4 className="text-sm font-bold text-stone-800">Checklist all clear!</h4>
            <p className="text-xs text-stone-500 mt-1">
              Add visa reminders, insurance checks, currency exchange, or reservations
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
            >
              + Create First Task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  task.done
                    ? 'bg-stone-50/70 border-stone-200 opacity-60'
                    : 'bg-white border-stone-200 hover:border-amber-300 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleDone(task)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors flex-shrink-0 ${
                      task.done
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-stone-300 bg-white hover:border-amber-500'
                    }`}
                  >
                    {task.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${task.done ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                        {task.title}
                      </span>
                      {getPriorityBadge(task.priority)}
                      <span className="text-[10px] text-stone-400 font-semibold uppercase">
                        {task.category}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-stone-500 mt-1">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-400 mt-1.5">
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-stone-600 font-medium">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          Due: {task.dueDate}
                        </span>
                      )}
                      {task.assignedParticipantName && (
                        <span className="flex items-center gap-1 text-stone-600 font-medium">
                          <Users className="w-3 h-3 text-stone-400" />
                          Assigned: {task.assignedParticipantName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-auto">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="text-base font-bold text-stone-900">
                {editingTask ? 'Edit Checklist Task' : 'Add Checklist Task'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400 hover:text-stone-700" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">
                  Task Title <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Apply for Vietnam eVisa, Purchase eSIMs"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Documents, Tech, Money"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ChecklistPriority)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 uppercase mb-1">Assignee</label>
                  <select
                    value={assignedParticipantId}
                    onChange={(e) => setAssignedParticipantId(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  >
                    <option value="">-- Unassigned --</option>
                    {allTravelers.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task guidance, links, reference codes..."
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
                  {isSubmitting ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
