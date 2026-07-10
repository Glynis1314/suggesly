import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FilterPill from '../../components/FilterPill';
import EditableCell from '../../components/EditableCell';
import AddCompanyModal from '../../components/AddCompanyModal';
import BulkImportModal from '../../components/BulkImportModal';
import { useAccounts } from '../../context/AccountsContext';
import { getAccountId } from '../../utils/recordIds';
import { useTableColumns } from '../../utils/useTableColumns';
import { usePagination } from '../../utils/usePagination';
import {
  accountStageOptions,
  accountPriorityOptions,
  accountSourceOptions,
  accountEmployeeSizeOptions,
} from '../../data/accountsData';

const companySampleHeaders = [
  'Company Name',
  'Owner',
  'Source',
  'Priority',
  'Stage',
  'Notes',
  'Next Step',
  'Next Action Date',
  'Last Activity Date',
  'Created Date',
  'Country',
  'City',
  'Employee Size',
  'LinkedIn URL',
];

const viewOptions = ['All Companies', 'My Companies', 'Recently Updated'];
const propertyOptions = [
  { key: 'company', label: 'Company Name', type: 'text' },
  { key: 'owner', label: 'Owner', type: 'select' },
  { key: 'source', label: 'Company Source', type: 'multiselect' },
  { key: 'priority', label: 'Priority', type: 'select' },
  { key: 'stage', label: 'Stage', type: 'select' },
  { key: 'notes', label: 'Notes', type: 'text' },
  { key: 'nextSteps', label: 'Next Steps', type: 'text' },
  { key: 'nextActionDate', label: 'Next Action Date', type: 'date' },
  { key: 'lastActivityDate', label: 'Last Activity Date', type: 'date' },
  { key: 'createdDate', label: 'Created Date', type: 'date' },
  { key: 'country', label: 'Country', type: 'text' },
  { key: 'custom', label: 'Custom', type: 'text' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'employeeSize', label: 'Employee Size', type: 'select' },
  { key: 'linkedin', label: 'LinkedIn URL', type: 'text' },
];

const conditionOptions = {
  select: ['is', 'is not', 'is any of'],
  text: ['contains', 'is', 'is not'],
  date: ['is before', 'is after', 'is on', 'is within'],
};

function ChevronDownIcon({ className = 'h-3 w-3' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getPropertyLabel(key) {
  return propertyOptions.find((option) => option.key === key)?.label || key;
}

function parseDate(value) {
  return value ? new Date(value).getTime() : null;
}

export default function AccountsPage() {
  const { accounts: rows, createAccount, importAccounts, updateAccount } = useAccounts();
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const globalSearch = '';
  const [filters, setFilters] = useState([]);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showFilterBuilder, setShowFilterBuilder] = useState(false);
  const [filterProperty, setFilterProperty] = useState('company');
  const [filterCondition, setFilterCondition] = useState('contains');
  const [filterValue, setFilterValue] = useState('');
  const [filterValueExtra, setFilterValueExtra] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const viewRef = useRef(null);
  const builderRef = useRef(null);

  const {
    columns,
    dragOverColIndex,
    handleResizeStart,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = useTableColumns([
    { id: 'company', label: 'Company Name', width: 220 },
    { id: 'owner', label: 'Owner', width: 140 },
    { id: 'source', label: 'Source', width: 140 },
    { id: 'priority', label: 'Priority', width: 90 },
    { id: 'stage', label: 'Stage', width: 120 },
    { id: 'notes', label: 'Notes', width: 180 },
    { id: 'nextSteps', label: 'Next Steps', width: 160 },
    { id: 'nextActionDate', label: 'Next Action', width: 110 },
    { id: 'lastActivityDate', label: 'Last Activity', width: 110 },
    { id: 'createdDate', label: 'Created', width: 110 },
    { id: 'country', label: 'Country', width: 100 },
    { id: 'custom', label: 'Custom', width: 100 },
    { id: 'city', label: 'City', width: 100 },
    { id: 'employeeSize', label: 'Employee Size', width: 110 },
    { id: 'linkedin', label: 'LinkedIn URL', width: 100 },
  ]);

  const [selectedView, setSelectedView] = useState('All Companies');

  const ownerOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.owner))).sort(),
    [rows],
  );

  const optionsByProperty = {
    owner: ownerOptions,
    source: accountSourceOptions,
    priority: accountPriorityOptions,
    stage: accountStageOptions,
    employeeSize: accountEmployeeSizeOptions,
  };

  const filterPropertyType = propertyOptions.find((option) => option.key === filterProperty)?.type || 'text';

  useEffect(() => {
    function closeMenus(event) {
      if (viewRef.current && !viewRef.current.contains(event.target)) {
        setShowViewDropdown(false);
      }
      if (builderRef.current && !builderRef.current.contains(event.target)) {
        setShowFilterBuilder(false);
      }
    }

    document.addEventListener('mousedown', closeMenus);
    return () => document.removeEventListener('mousedown', closeMenus);
  }, []);

  const currentUser = 'Alex Rivera';

  const filteredRows = useMemo(() => {
    const searchTerm = globalSearch.trim().toLowerCase();

    return rows.filter((row) => {
      const globalMatch = [row.company, row.site, row.owner, row.notes, row.nextSteps, row.country, row.city, row.custom]
        .concat(row.source || [])
        .some((value) => value?.toString().toLowerCase().includes(searchTerm));

      if (!globalMatch) {
        return false;
      }

      const viewMatch =
        selectedView === 'All Companies'
          ? true
          : selectedView === 'My Companies'
            ? row.owner === currentUser
            : parseDate(row.lastActivityDate) >= Date.now() - 14 * 86_400_000;

      if (!viewMatch) {
        return false;
      }

      return filters.every((filter) => {
        const rowValue = row[filter.property];
        const type = propertyOptions.find((option) => option.key === filter.property)?.type || 'text';

        if (type === 'text') {
          const needle = filter.value.toString().toLowerCase();
          const haystack = rowValue?.toString().toLowerCase() || '';
          if (filter.condition === 'contains') return haystack.includes(needle);
          if (filter.condition === 'is') return haystack === needle;
          if (filter.condition === 'is not') return haystack !== needle;
          return true;
        }

        if (type === 'select') {
          const candidate = rowValue?.toString();
          if (filter.condition === 'is') return candidate === filter.value;
          if (filter.condition === 'is not') return candidate !== filter.value;
          if (filter.condition === 'is any of') {
            const allowed = Array.isArray(filter.value) ? filter.value : [filter.value];
            return allowed.includes(candidate);
          }
          return true;
        }

        if (type === 'multiselect') {
          const values = Array.isArray(rowValue) ? rowValue : [];
          if (filter.condition === 'is') return values.includes(filter.value);
          if (filter.condition === 'is not') return !values.includes(filter.value);
          if (filter.condition === 'is any of') {
            const allowed = Array.isArray(filter.value) ? filter.value : [filter.value];
            return values.some((item) => allowed.includes(item));
          }
          return true;
        }

        if (type === 'date') {
          const rowTime = parseDate(rowValue);
          const filterTime = parseDate(filter.value);
          const filterTimeExtra = parseDate(filter.valueExtra);
          if (!rowTime) return false;
          if (filter.condition === 'is before') return rowTime < filterTime;
          if (filter.condition === 'is after') return rowTime > filterTime;
          if (filter.condition === 'is on') return rowTime === filterTime;
          if (filter.condition === 'is within' && filterTime && filterTimeExtra)
            return rowTime >= filterTime && rowTime <= filterTimeExtra;
          return true;
        }

        return true;
      });
    });
  }, [rows, globalSearch, selectedView, filters]);

  const activeFilterChips = filters.map((filter, index) => {
    const valueLabel =
      Array.isArray(filter.value) && filter.value.length > 0
        ? filter.value.join(', ')
        : filter.value;
    return {
      key: `${filter.property}-${index}`,
      label: `${getPropertyLabel(filter.property)}: ${valueLabel}`,
      onRemove: () => setFilters((current) => current.filter((_, idx) => idx !== index)),
    };
  });

  const addFilter = () => {
    const value = filterPropertyType === 'date' && filterCondition === 'is within'
      ? { value: filterValue, valueExtra: filterValueExtra }
      : filterPropertyType === 'multiselect' && filterCondition === 'is any of'
        ? filterValue.split(',').map((item) => item.trim()).filter(Boolean)
        : filterValue;

    if (!filterValue) {
      return;
    }

    setFilters((current) => [
      ...current,
      {
        property: filterProperty,
        label: getPropertyLabel(filterProperty),
        condition: filterCondition,
        value,
      },
    ]);
    setFilterValue('');
    setFilterValueExtra('');
    setShowFilterBuilder(false);
  };

  const handleSave = (id, field, value) => {
    updateAccount(id, { [field]: value });
  };

  const toggleRow = (id) => {
    setSelectedRows((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredRows.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredRows.map((row) => getAccountId(row)));
    }
  };

  const { visibleCount, handleScroll, loadMore } = usePagination(filteredRows, [globalSearch, filters, selectedView]);

  const renderCellContent = (row, colId) => {
    switch (colId) {
      case 'company':
        return (
          <div className="flex h-full items-center gap-3 min-w-0">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-xl font-semibold ${row.color}`}>
              {row.init}
            </div>
            <div className="min-w-0">
              <Link
                to={`/accounts/${getAccountId(row)}`}
                className="text-sm font-semibold text-slate-900 hover:text-emerald-700 hover:underline block truncate"
              >
                {row.company}
              </Link>
              <a href={`https://${row.site}`} target="_blank" rel="noreferrer" className="mt-1 block truncate text-sm text-slate-500 hover:text-slate-700">
                {row.site}
              </a>
            </div>
          </div>
        );
      case 'owner':
        return (
          <EditableCell
            type="owner"
            value={row.owner}
            options={ownerOptions}
            onSave={(value) => handleSave(getAccountId(row), 'owner', value)}
          />
        );
      case 'source':
        return (
          <EditableCell
            type="multiselect"
            value={row.source}
            options={accountSourceOptions}
            onSave={(value) => handleSave(getAccountId(row), 'source', value)}
          />
        );
      case 'priority':
        return (
          <EditableCell
            type="select"
            value={row.priority}
            options={accountPriorityOptions}
            onSave={(value) => handleSave(getAccountId(row), 'priority', value)}
          />
        );
      case 'stage':
        return (
          <EditableCell
            type="stage"
            value={row.stage}
            options={accountStageOptions}
            onSave={(value) => handleSave(getAccountId(row), 'stage', value)}
          />
        );
      case 'notes':
        return (
          <EditableCell type="textarea" value={row.notes} onSave={(value) => handleSave(getAccountId(row), 'notes', value)} />
        );
      case 'nextSteps':
        return (
          <EditableCell type="text" value={row.nextSteps} onSave={(value) => handleSave(getAccountId(row), 'nextSteps', value)} />
        );
      case 'nextActionDate':
        return (
          <EditableCell type="date" value={row.nextActionDate} onSave={(value) => handleSave(getAccountId(row), 'nextActionDate', value)} />
        );
      case 'lastActivityDate':
        return (
          <EditableCell type="date" value={row.lastActivityDate} onSave={(value) => handleSave(getAccountId(row), 'lastActivityDate', value)} />
        );
      case 'createdDate':
        return (
          <EditableCell type="date" value={row.createdDate} onSave={(value) => handleSave(getAccountId(row), 'createdDate', value)} />
        );
      case 'country':
        return (
          <EditableCell type="text" value={row.country} onSave={(value) => handleSave(getAccountId(row), 'country', value)} />
        );
      case 'custom':
        return (
          <EditableCell type="text" value={row.custom} onSave={(value) => handleSave(getAccountId(row), 'custom', value)} />
        );
      case 'city':
        return (
          <EditableCell type="text" value={row.city} onSave={(value) => handleSave(getAccountId(row), 'city', value)} />
        );
      case 'employeeSize':
        return (
          <EditableCell
            type="select"
            value={row.employeeSize}
            options={accountEmployeeSizeOptions}
            onSave={(value) => handleSave(getAccountId(row), 'employeeSize', value)}
          />
        );
      case 'linkedin':
        return (
          <EditableCell type="linkedin" value={row.linkedin} onSave={(value) => handleSave(getAccountId(row), 'linkedin', value)} />
        );
      default:
        return null;
    }
  };

  return (
    <section className="p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Accounts <span className="mx-2">&gt;</span>
            <span className="font-medium text-slate-800">Companies</span>
          </p>
          <h1 className="mt-2 text-5xl font-semibold">Companies</h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowBulkImport(true)}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xl font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Bulk Import
          </button>
          <button
            type="button"
            onClick={() => setShowAddCompany(true)}
            className="rounded-xl bg-emerald-700 px-5 py-3 text-xl font-medium text-white transition hover:bg-emerald-800"
          >
            + New Company
          </button>
        </div>
      </div>

      <AddCompanyModal
        open={showAddCompany}
        onClose={() => setShowAddCompany(false)}
        stageOptions={accountStageOptions}
        priorityOptions={accountPriorityOptions}
        sourceOptions={accountSourceOptions}
        employeeSizeOptions={accountEmployeeSizeOptions}
        onCreate={(newCompany) => {
          createAccount(newCompany);
          setShowAddCompany(false);
        }}
      />

      <BulkImportModal
        open={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        entityLabel="company"
        entityLabelPlural="companies"
        sampleHeaders={companySampleHeaders}
        requiredFields={['Company Name', 'Owner', 'Stage']}
        onImport={(importedRows) => {
          const mapped = importedRows.map((row, index) => ({
            company: row['Company Name'] || '',
            site: '',
            owner: row['Owner'] || '',
            source: row['Source'] ? [row['Source']] : [],
            priority: row['Priority'] || '',
            stage: row['Stage'] || '',
            notes: row['Notes'] || '',
            nextSteps: row['Next Step'] || '',
            nextActionDate: row['Next Action Date'] || '',
            lastActivityDate: row['Last Activity Date'] || '',
            createdDate: row['Created Date'] || new Date().toISOString().slice(0, 10),
            country: row['Country'] || '',
            city: row['City'] || '',
            employeeSize: row['Employee Size'] || '',
            linkedin: row['LinkedIn URL'] || '',
            companyId: `acc-import-${Date.now()}-${index}`,
            color: 'bg-slate-100 text-slate-700',
            init: (row['Company Name'] || '?').charAt(0).toUpperCase(),
          }));
          importAccounts(mapped);
          setShowBulkImport(false);
        }}
      />

      <div className="mb-4 rounded-2xl border border-slate-300 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3" ref={viewRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowViewDropdown((current) => !current)}
              className="inline-flex min-w-[160px] flex-col items-start rounded-full border border-slate-200 bg-slate-50 px-4 py-2 shadow-sm"
            >
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">VIEW</span>
              <span className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
                <span>{selectedView}</span>
                <ChevronDownIcon className="text-gray-400" />
              </span>
            </button>
            {showViewDropdown && (
              <div className="absolute left-0 z-20 mt-2 w-64 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="space-y-2">
                  {viewOptions.map((view) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => {
                        setSelectedView(view);
                        setShowViewDropdown(false);
                      }}
                      className={`w-full rounded-2xl px-4 py-3 text-left text-sm ${selectedView === view ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">{activeFilterChips.map((chip) => (
            <FilterPill key={chip.key} label={chip.label} onRemove={chip.onRemove} />
          ))}</div>

          <div className="ml-auto flex items-center gap-3">
            {activeFilterChips.length > 0 && (
              <button
                type="button"
                onClick={() => setFilters([])}
                className="rounded-full text-sm font-semibold text-slate-500 hover:text-slate-900"
              >
                Clear all filters
              </button>
            )}
            <div className="relative" ref={builderRef}>
              <button
                type="button"
                onClick={() => setShowFilterBuilder((current) => !current)}
                className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
              >
                More Filters
              </button>
              {showFilterBuilder && (
                <div className="absolute right-0 top-full z-20 mt-3 w-[360px] rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400">Property</label>
                      <select
                        value={filterProperty}
                        onChange={(event) => {
                          const nextProperty = event.target.value;
                          setFilterProperty(nextProperty);
                          const nextType = propertyOptions.find((option) => option.key === nextProperty)?.type || 'text';
                          setFilterCondition(conditionOptions[nextType][0]);
                          setFilterValue('');
                          setFilterValueExtra('');
                        }}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                      >
                        {propertyOptions.map((option) => (
                          <option key={option.key} value={option.key}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400">Condition</label>
                      <select
                        value={filterCondition}
                        onChange={(event) => setFilterCondition(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                      >
                        {conditionOptions[filterPropertyType].map((condition) => (
                          <option key={condition} value={condition}>{condition}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400">Value</label>
                      {filterPropertyType === 'date' ? (
                        filterCondition === 'is within' ? (
                          <div className="mt-2 grid gap-3 sm:grid-cols-2">
                            <input
                              type="date"
                              value={filterValue}
                              onChange={(e) => setFilterValue(e.target.value)}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                            />
                            <input
                              type="date"
                              value={filterValueExtra}
                              onChange={(e) => setFilterValueExtra(e.target.value)}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                            />
                          </div>
                        ) : (
                          <input
                            type="date"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                          />
                        )
                      ) : filterPropertyType === 'select' || filterPropertyType === 'multiselect' ? (
                        <div className="mt-2 space-y-2">
                          <select
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                          >
                            <option value="">Select a value</option>
                            {optionsByProperty[filterProperty]?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            placeholder={`Or type a new ${getPropertyLabel(filterProperty).toLowerCase()}`}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={filterValue}
                          onChange={(e) => setFilterValue(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                          placeholder="Filter value"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowFilterBuilder(false)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addFilter}
                        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Add filter
                      </button>
                    </div>
                    <div className="text-xs text-slate-400">Filters apply instantly to the table.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white w-full">
        <div
          className="max-h-[calc(100vh-26rem)] overflow-y-auto overflow-x-hidden w-full"
          onScroll={handleScroll}
        >
          <table className="w-full table-fixed">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="w-[52px] px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredRows.length && filteredRows.length > 0}
                    onChange={toggleSelectAll}
                    className="h-5 w-5 rounded border-slate-300"
                  />
                </th>
                {columns.map((col, index) => (
                  <th
                    key={col.id}
                    style={{ width: `${col.width}px` }}
                    className={`relative px-5 py-4 select-none group border-r border-slate-100 last:border-0 ${dragOverColIndex === index ? 'bg-slate-100 border-l-2 border-l-emerald-500' : ''
                      }`}
                    draggable
                    onDragStart={(e) => handleDragStart(index, e)}
                    onDragOver={(e) => handleDragOver(index, e)}
                    onDrop={(e) => handleDrop(index, e)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate cursor-grab active:cursor-grabbing font-semibold">
                        {col.label}
                      </span>
                      <div
                        onMouseDown={(e) => handleResizeStart(index, e)}
                        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100 hover:opacity-100 bg-slate-300 active:bg-emerald-500 transition-opacity"
                        style={{ zIndex: 2 }}
                      />
                    </div>
                  </th>
                ))}
                <th className="w-[72px] px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.slice(0, visibleCount).map((row) => (
                <tr key={getAccountId(row)} className="border-b border-slate-200 bg-white hover:bg-slate-50">
                  <td className="px-5 py-4 align-middle w-[52px]">
                    <div className="flex h-full items-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(getAccountId(row))}
                        onChange={() => toggleRow(getAccountId(row))}
                        className="h-5 w-5 rounded border-slate-300"
                      />
                    </div>
                  </td>
                  {columns.map((col) => (
                    <td key={col.id} style={{ width: `${col.width}px` }} className="px-5 py-4 align-middle overflow-hidden">
                      <div className="flex h-full items-center min-w-0 truncate">
                        {renderCellContent(row, col.id)}
                      </div>
                    </td>
                  ))}
                  <td className="px-5 py-4 align-middle text-slate-400 w-[72px]">
                    <div className="flex h-full items-center">...
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500 flex items-center justify-between">
        <div>
          Showing {Math.min(filteredRows.length, visibleCount)} of {filteredRows.length} results
          {filteredRows.length > visibleCount && (
            <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Scroll down to load more
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {filteredRows.length > visibleCount && (
            <button
              onClick={loadMore}
              className="rounded-full bg-slate-100 hover:bg-slate-200 px-4 py-1 text-slate-700 font-medium text-xs transition"
            >
              Load More
            </button>
          )}
        </div>
      </div>
    </section>
  );
}