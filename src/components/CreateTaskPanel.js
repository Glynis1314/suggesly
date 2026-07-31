import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import SlidePanel from './SlidePanel';
import { useDeals } from '../context/DealsContext';
import { useContacts } from '../context/ContactsContext';
import { useAccounts } from '../context/AccountsContext';

const inputClass =
  'mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-150';
const labelClass = 'text-xs font-semibold text-slate-500 uppercase tracking-wider';
const errorClass = 'mt-1.5 text-xs text-rose-600 font-medium';

const ownerOptions = ['Alex Rivera', 'Jane Smith', 'Sarah Jenkins', 'Kevin Malone', 'Michael Chen', 'Olivia Lee'];
const typeOptions = ['To-do', 'Call', 'Email', 'Meeting'];
const priorityOptions = ['None', 'Low', 'Medium', 'High'];
const reminderOptions = [
  'No reminder',
  'At time of due date',
  '15 minutes before',
  '1 hour before',
  '1 day before',
];
const relativeDateOptions = ['Today', 'Tomorrow', 'In 3 business days', 'Next week', 'Custom date'];

const computeRelativeDate = (relVal) => {
  const now = new Date();
  if (relVal === 'Today') {
    return now.toISOString().slice(0, 10);
  }
  if (relVal === 'Tomorrow') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  }
  if (relVal === 'In 3 business days') {
    const date = new Date(now);
    let count = 0;
    while (count < 3) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
    }
    return date.toISOString().slice(0, 10);
  }
  if (relVal === 'Next week') {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().slice(0, 10);
  }
  return '';
};

const getCombinedDateTimeISO = (dateStr, timeStr) => {
  if (!dateStr) return null;
  const t = timeStr || '08:00';
  const combined = new Date(`${dateStr}T${t}:00`);
  return isNaN(combined.getTime()) ? null : combined.toISOString();
};

const unpackDueDate = (isoStr) => {
  if (!isoStr) return { relative: 'Today', customDate: '', time: '08:00' };
  const d = new Date(isoStr);
  const dateStr = d.toISOString().slice(0, 10);
  const timeStr = d.toTimeString().slice(0, 5);

  const todayStr = computeRelativeDate('Today');
  const tomorrowStr = computeRelativeDate('Tomorrow');
  const in3BizStr = computeRelativeDate('In 3 business days');
  const nextWeekStr = computeRelativeDate('Next week');

  let relative = 'Custom date';
  if (dateStr === todayStr) relative = 'Today';
  else if (dateStr === tomorrowStr) relative = 'Tomorrow';
  else if (dateStr === in3BizStr) relative = 'In 3 business days';
  else if (dateStr === nextWeekStr) relative = 'Next week';

  return {
    relative,
    customDate: dateStr,
    time: timeStr,
  };
};

export default function CreateTaskPanel({
  open,
  onClose,
  onSubmit,
  taskToEdit = null,
  preFilledAssociations = {},
}) {
  const { deals } = useDeals();
  const { contacts } = useContacts();
  const { accounts } = useAccounts();

  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState('To-do');
  const [priority, setPriority] = useState('None');
  const [assignedTo, setAssignedTo] = useState('');
  const [queue, setQueue] = useState('');
  const [repeat, setRepeat] = useState(false);
  const [reminder, setReminder] = useState('No reminder');
  const [notes, setNotes] = useState('');

  // Due Date states
  const [relativeDate, setRelativeDate] = useState('Today');
  const [customDate, setCustomDate] = useState('');
  const [dueTime, setDueTime] = useState('08:00');

  // Associations combobox states
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [assocSearch, setAssocSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [errors, setErrors] = useState({});

  // Reset form when panel opens/closes or when taskToEdit changes
  useEffect(() => {
    if (open) {
      if (taskToEdit) {
        setTitle(taskToEdit.title || '');
        setTaskType(taskToEdit.taskType || 'To-do');
        setPriority(taskToEdit.priority || 'None');
        setAssignedTo(taskToEdit.assignedTo || '');
        setQueue(taskToEdit.queue || '');
        setRepeat(taskToEdit.repeat || false);
        setReminder(taskToEdit.reminder || 'No reminder');
        setNotes(taskToEdit.notes || '');

        const unpacked = unpackDueDate(taskToEdit.dueDate);
        setRelativeDate(unpacked.relative);
        setCustomDate(unpacked.customDate);
        setDueTime(unpacked.time);

        setSelectedDeals((taskToEdit.associatedDeals || []).map((d) => d.id || d._id || d));
        setSelectedContacts((taskToEdit.associatedContacts || []).map((c) => c.id || c._id || c));
        setSelectedCompanies((taskToEdit.associatedCompanies || []).map((co) => co.id || co._id || co));
      } else {
        // Reset to empty
        setTitle('');
        setTaskType('To-do');
        setPriority('None');
        setAssignedTo(preFilledAssociations.assignedTo || '');
        setQueue('');
        setRepeat(false);
        setReminder('No reminder');
        setNotes('');

        setRelativeDate('Today');
        setCustomDate('');
        setDueTime('08:00');

        setSelectedDeals(preFilledAssociations.associatedDeals || []);
        setSelectedContacts(preFilledAssociations.associatedContacts || []);
        setSelectedCompanies(preFilledAssociations.associatedCompanies || []);
      }
      setErrors({});
      setAssocSearch('');
      setShowDropdown(false);
    }
  }, [open, taskToEdit, preFilledAssociations]);

  // Combined options list for the association combobox
  const associationOptions = useMemo(() => {
    const list = [];
    deals.forEach((d) => {
      list.push({ id: d._id || d.id, name: d.dealName || 'Untitled Deal', type: 'Deals' });
    });
    contacts.forEach((c) => {
      const cName = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Untitled Contact';
      list.push({ id: c._id || c.id, name: cName, type: 'Contacts' });
    });
    accounts.forEach((a) => {
      list.push({ id: a._id || a.id, name: a.company || 'Untitled Company', type: 'Companies' });
    });
    return list;
  }, [deals, contacts, accounts]);

  const filteredOptions = useMemo(() => {
    const searchVal = assocSearch.toLowerCase().trim();
    if (!searchVal) return associationOptions;
    return associationOptions.filter((opt) => opt.name.toLowerCase().includes(searchVal));
  }, [associationOptions, assocSearch]);

  const groupedOptions = useMemo(() => {
    const groups = { Deals: [], Contacts: [], Companies: [] };
    filteredOptions.forEach((opt) => {
      if (groups[opt.type]) groups[opt.type].push(opt);
    });
    return groups;
  }, [filteredOptions]);

  const totalSelectedCount = selectedDeals.length + selectedContacts.length + selectedCompanies.length;

  const toggleAssociation = (opt) => {
    if (opt.type === 'Deals') {
      setSelectedDeals((curr) =>
        curr.includes(opt.id) ? curr.filter((id) => id !== opt.id) : [...curr, opt.id]
      );
    } else if (opt.type === 'Contacts') {
      setSelectedContacts((curr) =>
        curr.includes(opt.id) ? curr.filter((id) => id !== opt.id) : [...curr, opt.id]
      );
    } else if (opt.type === 'Companies') {
      setSelectedCompanies((curr) =>
        curr.includes(opt.id) ? curr.filter((id) => id !== opt.id) : [...curr, opt.id]
      );
    }
  };

  const getAssociationName = (id, type) => {
    const found = associationOptions.find((o) => o.id === id && o.type === type);
    return found ? found.name : 'Unknown';
  };

  const validate = () => {
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'Task title is required.';
    if (!taskType) nextErrors.taskType = 'Task type is required.';
    if (!priority) nextErrors.priority = 'Priority is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = () => {
    const dateStr = relativeDate === 'Custom date' ? customDate : computeRelativeDate(relativeDate);
    const combinedISO = getCombinedDateTimeISO(dateStr, dueTime);

    return {
      title: title.trim(),
      taskType,
      priority,
      assignedTo: assignedTo || undefined,
      queue,
      dueDate: combinedISO || undefined,
      reminder,
      repeat,
      notes,
      associatedDeals: selectedDeals,
      associatedContacts: selectedContacts,
      associatedCompanies: selectedCompanies,
    };
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit(buildPayload(), false);
  };

  const handleSaveAndAddAnother = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit(buildPayload(), true);
    // Reset core inputs for the next entry
    setTitle('');
    setNotes('');
    setErrors({});
  };

  // Close dropdown on click outside
  useEffect(() => {
    if (!showDropdown) return;
    const clickHandler = () => setShowDropdown(false);
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [showDropdown]);

  return (
    <SlidePanel
      open={open}
      title={taskToEdit ? 'Edit Task' : 'New Task'}
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          {!taskToEdit && (
            <button
              type="button"
              className="rounded-xl border border-emerald-600 bg-emerald-50 px-5 py-3 text-base font-semibold text-emerald-700 hover:bg-emerald-100 transition"
              onClick={handleSaveAndAddAnother}
            >
              Create and add another
            </button>
          )}
          <button
            type="button"
            className="rounded-xl bg-emerald-700 px-5 py-3 text-base font-semibold text-white shadow-xs hover:bg-emerald-800 transition"
            onClick={handleSave}
          >
            {taskToEdit ? 'Save Changes' : 'Create'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSave} className="space-y-5 max-h-[68vh] overflow-y-auto pr-2 pb-6">
        <div>
          <label className="block">
            <span className={labelClass}>
              Task Title <span className="text-rose-500">*</span>
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Follow up on pricing feedback"
              className={inputClass}
            />
            {errors.title && <p className={errorClass}>{errors.title}</p>}
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block">
              <span className={labelClass}>
                Task Type <span className="text-rose-500">*</span>
              </span>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className={inputClass}
              >
                {typeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label className="block">
              <span className={labelClass}>
                Priority <span className="text-rose-500">*</span>
              </span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={inputClass}
              >
                {priorityOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Association Combobox */}
        <div className="relative">
          <span className={labelClass}>Associate with records</span>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(true);
            }}
            className="mt-1.5 w-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
          >
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedDeals.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  📁 {getAssociationName(id, 'Deals')}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDeals((curr) => curr.filter((i) => i !== id));
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedContacts.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  👤 {getAssociationName(id, 'Contacts')}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedContacts((curr) => curr.filter((i) => i !== id));
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedCompanies.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  🏢 {getAssociationName(id, 'Companies')}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCompanies((curr) => curr.filter((i) => i !== id));
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <input
                type="text"
                value={assocSearch}
                onChange={(e) => {
                  setAssocSearch(e.target.value);
                  setShowDropdown(true);
                }}
                placeholder="Search deals, contacts, or companies..."
                className="w-full bg-transparent text-sm text-slate-800 outline-hidden placeholder-slate-400"
              />
              <span className="text-xs font-semibold text-brand-600 whitespace-nowrap bg-brand-50 px-2.5 py-1 rounded-full">
                Associated with {totalSelectedCount} records
              </span>
            </div>
          </div>

          {showDropdown && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 right-0 z-30 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl"
            >
              {Object.keys(groupedOptions).every((k) => groupedOptions[k].length === 0) ? (
                <p className="p-3 text-center text-sm text-slate-400">No records found.</p>
              ) : (
                Object.keys(groupedOptions).map((groupName) => {
                  const items = groupedOptions[groupName];
                  if (items.length === 0) return null;
                  return (
                    <div key={groupName} className="mb-3 last:mb-0">
                      <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 rounded-lg">
                        {groupName}
                      </p>
                      <div className="mt-1 space-y-0.5">
                        {items.map((opt) => {
                          let isSelected = false;
                          if (opt.type === 'Deals') isSelected = selectedDeals.includes(opt.id);
                          else if (opt.type === 'Contacts') isSelected = selectedContacts.includes(opt.id);
                          else if (opt.type === 'Companies') isSelected = selectedCompanies.includes(opt.id);

                          return (
                            <button
                              type="button"
                              key={opt.id}
                              onClick={() => toggleAssociation(opt)}
                              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-sm transition ${
                                isSelected ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>{opt.name}</span>
                              {isSelected && <span className="text-emerald-600 font-semibold">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block">
              <span className={labelClass}>Assigned To</span>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className={inputClass}
              >
                <option value="">Select assignee</option>
                {ownerOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label className="block">
              <span className={labelClass}>Queue</span>
              <input
                type="text"
                value={queue}
                onChange={(e) => setQueue(e.target.value)}
                placeholder="e.g. Q3 Outreach"
                className={inputClass}
              />
            </label>
          </div>
        </div>

        {/* Due Date & Time Picker */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block">
              <span className={labelClass}>Due Date</span>
              <select
                value={relativeDate}
                onChange={(e) => setRelativeDate(e.target.value)}
                className={inputClass}
              >
                {relativeDateOptions.map((opt) => {
                  let suffix = '';
                  if (opt !== 'Custom date') {
                    const comp = computeRelativeDate(opt);
                    const dayName = new Date(comp).toLocaleDateString('en-US', { weekday: 'long' });
                    suffix = ` (${dayName})`;
                  }
                  return (
                    <option key={opt} value={opt}>
                      {opt === 'Custom date' ? opt : `${opt}${suffix}`}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>

          <div>
            <label className="block">
              <span className={labelClass}>Time</span>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          {relativeDate === 'Custom date' && (
            <div className="sm:col-span-3">
              <label className="block">
                <span className={labelClass}>Pick custom date</span>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 py-1 border-y border-slate-100">
          <input
            type="checkbox"
            id="repeat-task-check"
            checked={repeat}
            onChange={(e) => setRepeat(e.target.checked)}
            className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="repeat-task-check" className="text-sm font-semibold text-slate-700 cursor-pointer">
            Set to repeat (recurring task)
          </label>
        </div>

        <div>
          <label className="block">
            <span className={labelClass}>Reminder</span>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className={inputClass}
            >
              {reminderOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Notes with Cosmetic Formatting Toolbar */}
        <div>
          <span className={labelClass}>Notes</span>
          <div className="mt-1.5 overflow-hidden rounded-2xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
            <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50 px-3 py-1.5">
              <button
                type="button"
                className="rounded-lg p-1.5 text-sm font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                className="rounded-lg p-1.5 text-sm italic text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                className="rounded-lg p-1.5 text-sm underline text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                title="Underline"
              >
                U
              </button>
              <div className="mx-2 h-4 w-px bg-slate-200" />
              <span className="text-[10px] text-slate-400 font-medium">Text mode</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add additional task details or description..."
              rows="4"
              className="w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-800 outline-hidden placeholder-slate-400"
            />
          </div>
        </div>
      </form>
    </SlidePanel>
  );
}

CreateTaskPanel.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  taskToEdit: PropTypes.object,
  preFilledAssociations: PropTypes.object,
};
