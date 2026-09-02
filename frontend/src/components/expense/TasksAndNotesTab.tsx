import React, { useState } from 'react';
import { ExpenseTask, MonthlyNote, TaskStatus } from '../../types/expense';
import { CheckSquare, Square, Clock, Plus, Trash2, Calendar, FileText, Send } from 'lucide-react';

interface TasksAndNotesTabProps {
  tasks: ExpenseTask[];
  notes: MonthlyNote[];
  budgetMonth: string;
  onAddTask: (task: { budgetMonth: string; task: string; status?: TaskStatus; dueDate?: string; notes?: string }) => Promise<void>;
  onUpdateTask: (id: string, task: Partial<ExpenseTask>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onAddNote: (budgetMonth: string, content: string) => Promise<void>;
}

export const TasksAndNotesTab: React.FC<TasksAndNotesTabProps> = ({
  tasks,
  notes,
  budgetMonth,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddNote,
}) => {
  // Task form state
  const [taskText, setTaskText] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);

  // Note form state
  const [noteContent, setNoteContent] = useState('');
  const [isNoteSubmitting, setIsNoteSubmitting] = useState(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    setIsTaskSubmitting(true);
    try {
      await onAddTask({
        budgetMonth,
        task: taskText.trim(),
        status: 'TODO',
        dueDate: taskDueDate || undefined,
        notes: taskNotes.trim() || undefined,
      });
      setTaskText('');
      setTaskDueDate('');
      setTaskNotes('');
    } finally {
      setIsTaskSubmitting(false);
    }
  };

  const handleToggleTaskStatus = async (task: ExpenseTask) => {
    const nextStatus: TaskStatus =
      task.status === 'TODO' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
    await onUpdateTask(task.id, { status: nextStatus });
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setIsNoteSubmitting(true);
    try {
      await onAddNote(budgetMonth, noteContent.trim());
      setNoteContent('');
    } finally {
      setIsNoteSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Monthly Checklist Tasks */}
      <div className="bg-white p-6 rounded-xl border border-[#E7E5E4] space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-[#B45309]" />
            <h3 className="text-sm font-bold text-[#1C1917]">
              Monthly Financial Tasks ({budgetMonth})
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#78716C] bg-[#FAFAF9] px-2 py-0.5 rounded border border-[#E7E5E4]">
            {tasks.filter((t) => t.status === 'DONE').length} / {tasks.length} Completed
          </span>
        </div>

        {/* Add Task Input Form */}
        <form onSubmit={handleCreateTask} className="space-y-2 p-3 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4]">
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Add a new task (e.g. File GST, Pay Rent, Review Subscriptions)..."
            className="w-full px-3 py-1.5 text-xs font-semibold rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
            required
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-md border border-[#E7E5E4] bg-white text-[#78716C]"
            />
            <input
              type="text"
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              placeholder="Optional notes..."
              className="flex-1 px-2.5 py-1 text-xs rounded-md border border-[#E7E5E4] bg-white text-[#1C1917]"
            />
            <button
              type="submit"
              disabled={isTaskSubmitting || !taskText.trim()}
              className="px-3 py-1 text-xs font-bold rounded-md bg-[#1C1917] hover:bg-[#342D27] text-white disabled:opacity-50 transition-colors flex items-center gap-1 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Task Items List */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#78716C]">
              No tasks scheduled for {budgetMonth}.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                  task.status === 'DONE'
                    ? 'bg-[#FEF3C7]/40 border-[#B45309]/30 text-[#78716C]'
                    : task.status === 'IN_PROGRESS'
                    ? 'bg-[#F1F5F9] border-[#334155]/30 text-[#1C1917]'
                    : 'bg-white border-[#E7E5E4] text-[#1C1917]'
                }`}
              >
                <div
                  className="flex items-start gap-2.5 flex-1 cursor-pointer select-none"
                  onClick={() => handleToggleTaskStatus(task)}
                >
                  <button type="button" className="mt-0.5 flex-shrink-0">
                    {task.status === 'DONE' ? (
                      <CheckSquare className="h-4 w-4 text-[#B45309]" />
                    ) : task.status === 'IN_PROGRESS' ? (
                      <Clock className="h-4 w-4 text-[#334155]" />
                    ) : (
                      <Square className="h-4 w-4 text-[#78716C]" />
                    )}
                  </button>
                  <div>
                    <span className={`text-xs font-semibold ${task.status === 'DONE' ? 'line-through opacity-70' : ''}`}>
                      {task.task}
                    </span>
                    {(task.dueDate || task.notes) && (
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-[#78716C]">
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            {task.dueDate}
                          </span>
                        )}
                        {task.notes && <span>· {task.notes}</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      task.status === 'DONE'
                        ? 'bg-[#FEF3C7] text-[#B45309]'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-[#E2E8F0] text-[#334155]'
                        : 'bg-[#FAFAF9] text-[#78716C]'
                    }`}
                  >
                    {task.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    className="text-[#78716C] hover:text-[#BE123C] p-1 rounded hover:bg-[#FFE4E6]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Freeform Timestamped Monthly Notes (Append-Only) */}
      <div className="bg-white p-6 rounded-xl border border-[#E7E5E4] space-y-4 shadow-xs flex flex-col">
        <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#B45309]" />
            <h3 className="text-sm font-bold text-[#1C1917]">
              Monthly Notes & Log ({budgetMonth})
            </h3>
          </div>
          <span className="text-[10px] text-[#78716C] font-semibold bg-[#FAFAF9] px-2 py-0.5 rounded border border-[#E7E5E4]">
            Append-Only
          </span>
        </div>

        {/* Notes List */}
        <div className="flex-1 space-y-3 max-h-72 overflow-y-auto pr-1">
          {notes.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#78716C]">
              No notes logged for {budgetMonth}. Document budget anomalies, salary adjustments, or unexpected expenses below.
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="p-3 bg-[#FBF8F3] rounded-lg border border-[#E7E5E4] space-y-1">
                <p className="text-xs text-[#1C1917] leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
                <div className="text-[10px] text-[#78716C] font-mono">
                  {new Date(note.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Append Note Input Form */}
        <form onSubmit={handleCreateNote} className="space-y-2 pt-3 border-t border-[#E7E5E4]">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Log an observation, refund note, or budget deviation..."
            rows={2}
            className="w-full px-3 py-2 text-xs font-semibold rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isNoteSubmitting || !noteContent.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#1C1917] hover:bg-[#342D27] text-white disabled:opacity-50 transition-colors shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Append Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TasksAndNotesTab;
