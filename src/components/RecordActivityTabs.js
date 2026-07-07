import { useState } from 'react';

const tabs = ['All Activities', 'Notes', 'Tasks'];

export default function RecordActivityTabs({ activities = [], initialNotes = [], initialTasks = [] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [notes, setNotes] = useState(initialNotes);
  const [tasks, setTasks] = useState(initialTasks);
  const [noteDraft, setNoteDraft] = useState('');
  const [taskDraft, setTaskDraft] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  const addNote = () => {
    if (!noteDraft.trim()) return;
    setNotes((current) => [
      { id: `note-${Date.now()}`, text: noteDraft.trim(), author: 'Alex Rivera', timestamp: new Date().toISOString() },
      ...current,
    ]);
    setNoteDraft('');
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
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400">No activity logged yet.</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-400">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{activity.description}</p>
                </div>
              ))
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

            {notes.length === 0 ? (
              <p className="text-sm text-slate-400">No notes yet.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{note.author}</p>
                    <p className="text-xs text-slate-400">{new Date(note.timestamp).toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{note.text}</p>
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