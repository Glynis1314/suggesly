import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useTasks } from '../../context/TasksContext';
import { useAccounts } from '../../context/AccountsContext';
import CreateTaskPanel from '../../components/CreateTaskPanel';
import PriorityBadge from '../../components/PriorityBadge';
import OwnerAvatar from '../../components/OwnerAvatar';
import DataTable from '../../components/DataTable';
import { useTableColumns } from '../../utils/useTableColumns';
import { usePagination } from '../../utils/usePagination';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

const tabs = ['Due Today', 'Overdue', 'Due Tomorrow', 'Upcoming', 'Completed'];

const cellBaseClasses = 'px-6 py-4 border-r border-slate-100 last:border-0 h-16 min-w-0';
const secondaryTextClasses = 'text-xs text-slate-400 font-medium';

const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
};

const getAvatarColor = (name) => {
  const colors = [
    'bg-emerald-50 text-emerald-700 border-emerald-100',
    'bg-sky-50 text-sky-700 border-sky-100',
    'bg-indigo-50 text-indigo-700 border-indigo-100',
    'bg-amber-50 text-amber-700 border-amber-100',
    'bg-rose-50 text-rose-700 border-rose-100',
  ];
  if (!name) return colors[0];
  const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charCodeSum % colors.length];
};

const formatTaskDueDate = (isoStr) => {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  if (d.toDateString() === today.toDateString()) {
    return `Today, ${timeStr}`;
  } else if (d.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${timeStr}`;
  } else if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${timeStr}`;
  } else {
    return `${dateStr}, ${timeStr}`;
  }
};

const isOverdueAndOpen = (task) => {
  if (task.status === 'Completed' || !task.dueDate) return false;
  return new Date(task.dueDate) < new Date();
};

export default function TasksPage() {
  const {
    tasks: rawTasks,
    loading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  } = useTasks();

  const { accounts: rawCompanies } = useAccounts();

  const [activeTab, setActiveTab] = useState('Due Today');
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('All Owners');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All Companies');
  const [selectedRows, setSelectedRows] = useState([]);

  // Sorting state
  const [sortKey, setSortKey] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');

  // Control Create/Edit panel
  const [panelOpen, setPanelOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Dropdown UI refs
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    const onEscape = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  const tasks = useMemo(() => {
    return (rawTasks || []).map((t) => ({
      ...t,
      id: t._id || t.id,
    }));
  }, [rawTasks]);

  // Extract filter dropdown options
  const ownerOptions = useMemo(() => {
    const owners = tasks.map((t) => t.assignedTo).filter(Boolean);
    return ['All Owners', ...Array.from(new Set(owners)).sort()];
  }, [tasks]);

  const companyOptions = useMemo(() => {
    const comps = rawCompanies.map((c) => c.company).filter(Boolean);
    return ['All Companies', ...Array.from(new Set(comps)).sort()];
  }, [rawCompanies]);

  const dateFilterOptions = ['All', 'Today', 'Next 7 Days', 'This Month'];

  // Table Columns
  const {
    columns,
    dragOverColIndex,
    handleResizeStart,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = useTableColumns([
    { id: 'status', label: 'Status', width: 90 },
    { id: 'title', label: 'Task Title', width: 340 },
    { id: 'associatedCompanies', label: 'Related Company', width: 220 },
    { id: 'assignedTo', label: 'Owner', width: 180 },
    { id: 'dueDate', label: 'Due Date', width: 200, sortable: true, sortKey: 'dueDate' },
    { id: 'priority', label: 'Priority', width: 130, sortable: true, sortKey: 'priority' },
  ]);

  // Checkbox toggle helpers
  const toggleRow = (id) => {
    setSelectedRows((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const handleToggleSelectAll = useCallback((filteredList) => {
    const allSelected = filteredList.length > 0 && filteredList.every((row) => selectedRows.includes(row.id));
    if (allSelected) {
      const currentIds = filteredList.map((row) => row.id);
      setSelectedRows((current) => current.filter((id) => !currentIds.includes(id)));
    } else {
      const currentIds = filteredList.map((row) => row.id);
      setSelectedRows((current) => {
        const next = [...current];
        currentIds.forEach((id) => {
          if (!next.includes(id)) {
            next.push(id);
          }
        });
        return next;
      });
    }
  }, [selectedRows]);

  // Filter and Sort Tasks
  const filteredTasks = useMemo(() => {
    // 1. Tab filtering (Today, Overdue, Tomorrow, Upcoming, Completed)
    const todayStr = new Date().toISOString().slice(0, 10);
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().slice(0, 10);

    let tabList = tasks.filter((task) => {
      const isCompleted = task.status === 'Completed';
      if (activeTab === 'Completed') return isCompleted;
      if (isCompleted) return false;

      if (!task.dueDate) {
        return activeTab === 'Upcoming';
      }

      const taskDateStr = task.dueDate.slice(0, 10);
      if (activeTab === 'Due Today') return taskDateStr === todayStr;
      if (activeTab === 'Due Tomorrow') return taskDateStr === tomorrowStr;
      if (activeTab === 'Overdue') return taskDateStr < todayStr;
      if (activeTab === 'Upcoming') return taskDateStr > tomorrowStr;
      return false;
    });

    // 2. Toolbar & Search filters
    const searchVal = globalSearch.toLowerCase().trim();
    tabList = tabList.filter((task) => {
      // Search matches
      const compMatchStr = (task.associatedCompanies || []).map((c) => c.name).join(' ');
      const dealMatchStr = (task.associatedDeals || []).map((d) => d.name).join(' ');
      const contactMatchStr = (task.associatedContacts || []).map((c) => c.name).join(' ');
      const globalMatch =
        !searchVal ||
        [task.title, task.assignedTo, task.notes, compMatchStr, dealMatchStr, contactMatchStr]
          .some((v) => v?.toLowerCase().includes(searchVal));

      // Owner match
      const ownerMatch = selectedOwner === 'All Owners' || task.assignedTo === selectedOwner;

      // Company match
      const taskCompanies = (task.associatedCompanies || []).map((c) => c.name);
      const companyMatch =
        selectedCompany === 'All Companies' || taskCompanies.includes(selectedCompany);

      // Date range match
      let dateMatch = true;
      if (selectedDateFilter !== 'All' && task.dueDate) {
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskMidnight = new Date(taskDate);
        taskMidnight.setHours(0, 0, 0, 0);

        if (selectedDateFilter === 'Today') {
          dateMatch = taskMidnight.getTime() === today.getTime();
        } else if (selectedDateFilter === 'Next 7 Days') {
          const next7 = new Date(today);
          next7.setDate(today.getDate() + 7);
          dateMatch = taskMidnight >= today && taskMidnight <= next7;
        } else if (selectedDateFilter === 'This Month') {
          dateMatch = taskDate.getMonth() === today.getMonth() && taskDate.getFullYear() === today.getFullYear();
        }
      } else if (selectedDateFilter !== 'All' && !task.dueDate) {
        dateMatch = false;
      }

      return globalMatch && ownerMatch && companyMatch && dateMatch;
    });

    // 3. Sorting
    if (sortKey) {
      tabList.sort((a, b) => {
        let aVal = a[sortKey];
        let bVal = b[sortKey];

        if (sortKey === 'dueDate') {
          aVal = aVal ? new Date(aVal).getTime() : Infinity;
          bVal = bVal ? new Date(bVal).getTime() : Infinity;
        }

        if (typeof aVal === 'string') {
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDirection === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0);
      });
    }

    return tabList;
  }, [tasks, activeTab, globalSearch, selectedOwner, selectedCompany, selectedDateFilter, sortKey, sortDirection]);

  // Pagination
  const { visibleCount, loadMore } = usePagination(filteredTasks, [
    activeTab,
    globalSearch,
    selectedOwner,
    selectedCompany,
    selectedDateFilter,
    sortKey,
    sortDirection,
  ]);

  // Form Submission
  const handlePanelSubmit = async (payload, addAnother) => {
    try {
      if (taskToEdit) {
        await updateTask({ ...taskToEdit, ...payload });
      } else {
        await createTask(payload);
      }
      if (!addAnother) {
        setPanelOpen(false);
        setTaskToEdit(null);
      }
    } catch (err) {
      console.error('Failed to save task:', err);
      alert(`Failed to save task: ${err.message || 'Unknown error'}`);
    }
  };

  const handleEditClick = (task) => {
    setTaskToEdit(task);
    setPanelOpen(true);
  };

  const handleCheckboxClick = async (e, task) => {
    e.stopPropagation();
    try {
      await toggleTaskStatus(task.id);
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleSort = (key, direction) => {
    if (direction) {
      setSortKey(key);
      setSortDirection(direction);
      return;
    }
    if (sortKey === key) {
      setSortDirection((curr) => (curr === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection('asc');
  };

  const clearAllFilters = () => {
    setGlobalSearch('');
    setSelectedOwner('All Owners');
    setSelectedCompany('All Companies');
    setSelectedDateFilter('All');
  };

  // Recharts Progress & Team overview metrics
  const completedThisWeek = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const distance = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distance);
    monday.setHours(0, 0, 0, 0);

    return tasks.filter((t) => {
      if (t.status !== 'Completed' || !t.updatedAt) return false;
      const uDate = new Date(t.updatedAt);
      return uDate >= monday;
    }).length;
  }, [tasks]);

  const weeklyProgressData = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const distance = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distance);
    monday.setHours(0, 0, 0, 0);

    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };

    tasks.forEach((t) => {
      if (t.status === 'Completed' && t.updatedAt) {
        const uDate = new Date(t.updatedAt);
        if (uDate >= monday) {
          const dayIndex = uDate.getDay();
          if (dayIndex >= 1 && dayIndex <= 5) {
            counts[weekdays[dayIndex - 1]]++;
          }
        }
      }
    });

    return weekdays.map((day) => ({
      name: day,
      Completed: counts[day],
    }));
  }, [tasks]);

  const teamOwners = useMemo(() => {
    const list = tasks.map((t) => t.assignedTo).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [tasks]);

  const selectAll = filteredTasks.length > 0 && filteredTasks.every((row) => selectedRows.includes(row.id));

  const modifiedColumns = useMemo(() => {
    return [
      {
        id: 'checkbox',
        label: (
          <input
            type="checkbox"
            checked={selectAll}
            onChange={() => handleToggleSelectAll(filteredTasks)}
            className="h-5 w-5 rounded border-slate-300 shrink-0"
          />
        ),
        width: 52,
        sortable: false,
      },
      ...columns,
      { id: 'actions', label: 'Actions', width: 80, sortable: false },
    ];
  }, [columns, selectAll, filteredTasks, handleToggleSelectAll]);

  const renderCellContent = (task, colId) => {
    switch (colId) {
      case 'status':
        return (
          <button
            type="button"
            onClick={(e) => handleCheckboxClick(e, task)}
            className="rounded-full p-1 transition hover:bg-slate-100"
          >
            {task.status === 'Completed' ? (
              <CheckCircle2 size={20} className="text-emerald-600 fill-emerald-50" />
            ) : (
              <Circle size={20} className="text-slate-400" />
            )}
          </button>
        );
      case 'title':
        return (
          <div className="flex min-w-0 flex-col">
            <button
              type="button"
              onClick={() => handleEditClick(task)}
              className={`text-left font-semibold hover:underline truncate transition-all duration-150 ${
                task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-emerald-700'
              }`}
            >
              {task.title || 'Untitled Task'}
            </button>
            <p className="mt-0.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {task.taskType || 'To-do'}
            </p>
          </div>
        );
      case 'associatedCompanies':
        const coList = task.associatedCompanies || [];
        if (coList.length === 0) return <span className="text-slate-300">—</span>;
        return (
          <div className="flex items-center gap-2 truncate">
            <span className="text-slate-400 shrink-0">🏢</span>
            <span className={`${secondaryTextClasses} truncate text-slate-700 font-semibold`}>
              {coList.map((c) => c.name).join(', ')}
            </span>
          </div>
        );
      case 'assignedTo':
        return task.assignedTo ? (
          <OwnerAvatar owner={task.assignedTo} />
        ) : (
          <span className="text-slate-300">—</span>
        );
      case 'dueDate':
        const overdue = isOverdueAndOpen(task);
        return (
          <div className="flex items-center gap-1.5">
            {overdue && <AlertCircle size={14} className="text-rose-600 shrink-0" />}
            <span
              className={`text-xs font-semibold ${
                overdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
              }`}
            >
              {formatTaskDueDate(task.dueDate)}
            </span>
          </div>
        );
      case 'priority':
        return <PriorityBadge priority={task.priority} />;
      default:
        return null;
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedRows.length} tasks?`)) {
      try {
        for (const id of selectedRows) {
          await deleteTask(id);
        }
        setSelectedRows([]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <section className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Task Management</h1>
          <p className="mt-1.5 text-sm text-slate-500">Track and organize CRM follow-ups, calls, and meetings.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedRows.length > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 shadow-xs hover:bg-rose-100 transition"
            >
              Delete Selected ({selectedRows.length})
            </button>
          )}
          <button
            type="button"
            className="rounded-xl bg-emerald-700 px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-800"
            onClick={() => {
              setTaskToEdit(null);
              setPanelOpen(true);
            }}
          >
            + Create Task
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => {
          const tabTasks = tasks.filter((t) => {
            const todayStr = new Date().toISOString().slice(0, 10);
            const tomorrowDate = new Date();
            tomorrowDate.setDate(tomorrowDate.getDate() + 1);
            const tomorrowStr = tomorrowDate.toISOString().slice(0, 10);

            const isCompleted = t.status === 'Completed';
            if (tab === 'Completed') return isCompleted;
            if (isCompleted) return false;

            if (!t.dueDate) return tab === 'Upcoming';

            const taskDateStr = t.dueDate.slice(0, 10);
            if (tab === 'Due Today') return taskDateStr === todayStr;
            if (tab === 'Due Tomorrow') return taskDateStr === tomorrowStr;
            if (tab === 'Overdue') return taskDateStr < todayStr;
            if (tab === 'Upcoming') return taskDateStr > tomorrowStr;
            return false;
          });

          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setSelectedRows([]);
              }}
              className={`relative px-6 py-4 text-sm font-bold transition duration-150 ${
                activeTab === tab
                  ? 'border-b-2 border-emerald-700 text-emerald-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
              {tabTasks.length > 0 && (
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-semibold">
                  {tabTasks.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-3 pl-12 text-sm text-slate-900 outline-hidden placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
          />
          <span className="absolute left-4 top-3.5 text-slate-400">🔍</span>
        </div>

        {/* Owner Dropdown */}
        <div className="relative" ref={activeDropdown === 'Owner' ? dropdownRef : null}>
          <button
            type="button"
            onClick={() => setActiveDropdown((c) => (c === 'Owner' ? null : 'Owner'))}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-xs ${
              selectedOwner !== 'All Owners' ? 'border-sky-200 bg-sky-50 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <span>{selectedOwner === 'All Owners' ? 'Owner' : `Owner: ${selectedOwner}`}</span>
            <span className="text-slate-400">▾</span>
          </button>
          {activeDropdown === 'Owner' && (
            <div className="absolute left-0 z-20 mt-2 w-64 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Owner</p>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {ownerOptions.map((owner) => (
                  <button
                    key={owner}
                    type="button"
                    onClick={() => {
                      setSelectedOwner(owner);
                      setActiveDropdown(null);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <span>{owner}</span>
                    {selectedOwner === owner ? <span className="text-emerald-600">✓</span> : null}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date Dropdown */}
        <div className="relative" ref={activeDropdown === 'Date' ? dropdownRef : null}>
          <button
            type="button"
            onClick={() => setActiveDropdown((c) => (c === 'Date' ? null : 'Date'))}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-xs ${
              selectedDateFilter !== 'All' ? 'border-sky-200 bg-sky-50 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <span>{selectedDateFilter === 'All' ? 'Date' : `Date: ${selectedDateFilter}`}</span>
            <span className="text-slate-400">▾</span>
          </button>
          {activeDropdown === 'Date' && (
            <div className="absolute left-0 z-20 mt-2 w-64 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Date Range</p>
              <div className="space-y-1">
                {dateFilterOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedDateFilter(opt);
                      setActiveDropdown(null);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <span>{opt}</span>
                    {selectedDateFilter === opt ? <span className="text-emerald-600">✓</span> : null}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Company Dropdown */}
        <div className="relative" ref={activeDropdown === 'Company' ? dropdownRef : null}>
          <button
            type="button"
            onClick={() => setActiveDropdown((c) => (c === 'Company' ? null : 'Company'))}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-xs ${
              selectedCompany !== 'All Companies' ? 'border-sky-200 bg-sky-50 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <span>{selectedCompany === 'All Companies' ? 'Company' : `Company: ${selectedCompany}`}</span>
            <span className="text-slate-400">▾</span>
          </button>
          {activeDropdown === 'Company' && (
            <div className="absolute left-0 z-20 mt-2 w-64 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Company</p>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {companyOptions.map((company) => (
                  <button
                    key={company}
                    type="button"
                    onClick={() => {
                      setSelectedCompany(company);
                      setActiveDropdown(null);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <span>{company}</span>
                    {selectedCompany === company ? <span className="text-emerald-600">✓</span> : null}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {(globalSearch || selectedOwner !== 'All Owners' || selectedDateFilter !== 'All' || selectedCompany !== 'All Companies') && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="w-full">
        <DataTable
          columns={modifiedColumns}
          loading={tasksLoading}
          error={tasksError}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          dragOverColIndex={dragOverColIndex === null ? null : dragOverColIndex + 1}
          handleResizeStart={(idx, e) => {
            if (idx > 0 && idx < modifiedColumns.length - 1) handleResizeStart(idx - 1, e);
          }}
          handleDragStart={(idx, e) => {
            if (idx > 0 && idx < modifiedColumns.length - 1) handleDragStart(idx - 1, e);
          }}
          handleDragOver={(idx, e) => {
            if (idx > 0 && idx < modifiedColumns.length - 1) handleDragOver(idx - 1, e);
          }}
          handleDrop={(idx, e) => {
            if (idx > 0 && idx < modifiedColumns.length - 1) handleDrop(idx - 1, e);
          }}
          emptyMessage="No tasks found."
          loadingMessage="Loading tasks..."
        >
          {filteredTasks.slice(0, visibleCount).map((task) => (
            <tr key={task.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
              <td className="px-5 py-4 align-middle w-[52px]">
                <div className="flex h-full items-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(task.id)}
                    onChange={() => toggleRow(task.id)}
                    className="h-5 w-5 rounded border-slate-300"
                  />
                </div>
              </td>
              {columns.map((col) => (
                <td
                  key={col.id}
                  style={{ width: `${col.width}px` }}
                  className={`${cellBaseClasses} ${col.align === 'right' ? 'text-right' : 'text-left'} align-middle overflow-hidden`}
                >
                  <div className="flex h-full items-center min-w-0">
                    {renderCellContent(task, col.id)}
                  </div>
                </td>
              ))}
              <td className="px-5 py-4 align-middle text-slate-400 w-[80px]">
                <button
                  type="button"
                  onClick={() => handleEditClick(task)}
                  className="text-xs font-semibold text-slate-400 hover:text-emerald-700"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </DataTable>

        {/* Footer */}
        <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500 flex items-center justify-between mt-4">
          <div>
            Showing {Math.min(filteredTasks.length, visibleCount)} of {filteredTasks.length} tasks
            {filteredTasks.length > visibleCount && (
              <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                Scroll down to load more
              </span>
            )}
          </div>
          <div>
            {filteredTasks.length > visibleCount && (
              <button
                onClick={loadMore}
                className="rounded-full bg-slate-100 hover:bg-slate-200 px-4 py-1 text-slate-700 font-medium text-xs transition"
              >
                Load More
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Progress & Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Weekly Task Progress */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Weekly Task Progress</h3>
          <p className="mt-1 text-sm text-slate-500">
            You have completed <span className="font-semibold text-slate-900">{completedThisWeek}</span> tasks this week.
          </p>

          <div className="mt-6 w-full h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgressData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="Completed" fill="#047857" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Overview */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Team Overview</h3>
            <p className="mt-1 text-sm text-slate-500">Active deals requiring task updates.</p>

            <div className="mt-6 flex -space-x-2.5 overflow-hidden">
              {teamOwners.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No active assignees with open tasks.</p>
              ) : (
                <>
                  {teamOwners.slice(0, 5).map((ownerName) => (
                    <div
                      key={ownerName}
                      title={ownerName}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-2 ring-white border ${getAvatarColor(
                        ownerName
                      )}`}
                    >
                      {getInitials(ownerName)}
                    </div>
                  ))}
                  {teamOwners.length > 5 && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 ring-2 ring-white border border-slate-200">
                      +{teamOwners.length - 5}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Assignees: {teamOwners.length}</span>
            <a
              href="/dashboard"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
            >
              View Team Capacity →
            </a>
          </div>
        </div>
      </div>

      {/* Task Slider Panel */}
      <CreateTaskPanel
        open={panelOpen}
        onClose={() => {
          setPanelOpen(false);
          setTaskToEdit(null);
        }}
        onSubmit={handlePanelSubmit}
        taskToEdit={taskToEdit}
      />
    </section>
  );
}
