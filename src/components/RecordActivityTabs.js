import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronRight } from 'lucide-react';
import { getNotes, createNote } from '../services/noteApi';
import { readStoredUser } from '../utils/auth';

const tabs = ['All Activities', 'Notes', 'Tasks'];

export default function RecordActivityTabs({ activities = [], entityType, entityId, initialTasks = [] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [tasks, setTasks] = useState(initialTasks);
  const [noteDraft, setNoteDraft] = useState('');
  const [taskDraft, setTaskDraft] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());

  useEffect(() => {
    if (!entityType || !entityId) return;
    let cancelled = false;
    setNotesLoading(true);
    getNotes(entityType, entityId)
      .then((data) => {
        if (!cancelled) setNotes(data);
      })
      .catch((err) => console.error('Failed to load notes:', err))
      .finally(() => {
        if (!cancelled) setNotesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entityType, entityId]);

  const addNote = async () => {
    if (!noteDraft.trim() || !entityType || !entityId) return;
    const currentUser = readStoredUser();
    try {
      const created = await createNote({
        entityType,
        entityId,
        text: noteDraft.trim(),
        author: currentUser?.name || currentUser?.email,
      });
      setNotes((current) => [created, ...current]);
      setNoteDraft('');
    } catch (err) {
      console.error('Failed to save note:', err);
      alert('Failed to save note. Please try again.');
    }
  };

  const addTask = () => {
    if (!taskDraft.trim()) return;
    setTasks((current) => [
      { id: `task-${Date.now()}`, label: taskDraft.trim(), dueDate: taskDueDate, done: false },
      ...current,
    ]);
    setTaskDraft('');
    setTaskDueDate('');
  };

  const toggleTask = (id) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  const toggleExpanded = (id) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const combinedFeed = [
    ...activities,
    ...notes.map((note) => ({
      id: note.id,
      title: `Note added by ${note.author}`,
      description: note.text,
      timestamp: note.timestamp,
      isNote: true,
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white">
      <div className="flex border-b border-slate-200 px-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-4 text-sm font-semibold transition ${
              activeTab === tab
                ? 'border-b-2 border-emerald-700 text-emerald-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'All Activities' && (
          <div className="space-y-4">
            {combinedFeed.length === 0 ? (
              <p className="text-sm text-slate-400">No activity logged yet.</p>
            ) : (
              combinedFeed.map((item) => {
                const isExpanded = expandedIds.has(item.id);
                return (
                  <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.id)}
                      className="flex w-full items-center justify-between text-left focus:outline-none"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          size={16}
                          className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      </div>
                      <p className="text-xs text-slate-400">
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : '—'}
                      </p>
                    </button>
                    {isExpanded && (
                      <p className="mt-2 pl-6 text-sm text-slate-600 whitespace-pre-wrap">{item.description}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'Notes' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Add a note…"
                rows="3"
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={addNote}
                  className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                  Add Note
                </button>
              </div>
            </div>

            {notesLoading ? (
              <p className="text-sm text-slate-400">Loading notes…</p>
            ) : notes.length === 0 ? (
              <p className="text-sm text-slate-400">No notes yet.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{note.author}</p>
                    <p className="text-xs text-slate-400">
                      {note.timestamp ? new Date(note.timestamp).toLocaleString() : '—'}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{note.text}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'Tasks' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={taskDraft}
                onChange={(event) => setTaskDraft(event.target.value)}
                placeholder="Add a task…"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
              <input
                type="date"
                value={taskDueDate}
                onChange={(event) => setTaskDueDate(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={addTask}
                className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                + Add Task
              </button>
            </div>

            {tasks.length === 0 ? (
              <p className="text-sm text-slate-400">No tasks yet.</p>
            ) : (
              tasks.map((task) => (
                <label
                  key={task.id}
                  className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className={`text-sm ${task.done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {task.label}
                    </span>
                  </span>
                  {task.dueDate && <span className="text-xs text-slate-400">Due {task.dueDate}</span>}
                </label>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

RecordActivityTabs.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      timestamp: PropTypes.string.isRequired,
    })
  ),
  entityType: PropTypes.string.isRequired,
  entityId: PropTypes.string.isRequired,
  initialTasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      dueDate: PropTypes.string,
      done: PropTypes.bool,
    })
  ),
};