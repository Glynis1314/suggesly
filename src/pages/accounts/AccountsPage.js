import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FilterPill from '../../components/FilterPill';
import EditableCell from '../../components/EditableCell';
import OwnerAvatar from '../../components/OwnerAvatar';
import StageBadge from '../../components/StageBadge';
import AddCompanyModal from '../../components/AddCompanyModal';
import BulkImportModal from '../../components/BulkImportModal';
import { useAccounts } from '../../context/AccountsContext';
import { getAccountId } from '../../utils/recordIds';
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

const priorityStyles = {
  P0: 'bg-emerald-100 text-emerald-700',
  P1: 'bg-sky-100 text-sky-700',
  P2: 'bg-amber-100 text-amber-700',
  Drop: 'bg-slate-100 text-slate-700',
};

function ChevronDownIcon({ className = 'h-3 w-3' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M15 7h3a5 5 0 0 1 0 10h-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 17H6a5 5 0 0 1 0-10h3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12h8" strokeLinecap="round" strokeLinejoin="round" />
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
  const [selectedView, setSelectedView] = useState('All Companies');
  const [globalSearch, setGlobalSearch] = useState('');
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
        const compare = (target) => target?.toString().toLowerCase?.();

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

  const getFilterValueLabel = () => {
    if (filterPropertyType === 'date' && filterCondition === 'is within') {
      return `${filterValue} → ${filterValueExtra}`;
    }
    return filterValue;
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

      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white">
        <div className="max-h-[calc(100vh-26rem)] overflow-y-auto">
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
                <th className="w-[220px] px-5 py-4">Company</th>
                <th className="w-[140px] px-5 py-4">Owner</th>
                <th className="w-[140px] px-5 py-4">Source</th>
                <th className="w-[90px] px-5 py-4">Priority</th>
                <th className="w-[120px] px-5 py-4">Stage</th>
                <th className="w-[180px] px-5 py-4">Notes</th>
                <th className="w-[160px] px-5 py-4">Next Steps</th>
                <th className="w-[110px] px-5 py-4">Next Action</th>
                <th className="w-[110px] px-5 py-4">Last Activity</th>
                <th className="w-[110px] px-5 py-4">Created</th>
                <th className="w-[100px] px-5 py-4">Country</th>
                <th className="w-[100px] px-5 py-4">Custom</th>
                <th className="w-[100px] px-5 py-4">City</th>
                <th className="w-[110px] px-5 py-4">Employee Size</th>
                <th className="w-[90px] px-5 py-4">LinkedIn</th>
                <th className="w-[72px] px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={getAccountId(row)} className="border-b border-slate-200 bg-white hover:bg-slate-50">
                  <td className="px-5 py-4 align-middle">
                    <div className="flex h-full items-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(getAccountId(row))}
                        onChange={() => toggleRow(getAccountId(row))}
                        className="h-5 w-5 rounded border-slate-300"
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="flex h-full items-center gap-3 min-w-0">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-md text-xl font-semibold ${row.color}`}>
                        {row.init}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/accounts/${getAccountId(row)}`}
                          className="text-sm font-semibold text-slate-900 hover:text-emerald-700 hover:underline"
                        >
                          {row.company}
                        </Link>
                        <a href={`https://${row.site}`} target="_blank" rel="noreferrer" className="mt-1 block truncate text-sm text-slate-500 hover:text-slate-700">
                          {row.site}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="flex h-full items-center">
                      <EditableCell
                        type="owner"
                        value={row.owner}
                        options={ownerOptions}
                        onSave={(value) => handleSave(getAccountId(row), 'owner', value)}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="flex h-full items-center">
                      <EditableCell
                        type="multiselect"
                        value={row.source}
                        options={accountSourceOptions}
                        onSave={(value) => handleSave(getAccountId(row), 'source', value)}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="flex h-full items-center">
                      <EditableCell
                        type="select"
                        value={row.priority}
                        options={accountPriorityOptions}
                        onSave={(value) => handleSave(getAccountId(row), 'priority', value)}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="flex h-full items-center">
                      <EditableCell
                        type="stage"
                        value={row.stage}
                        options={accountStageOptions}
                        onSave={(value) => handleSave(getAccountId(row), 'stage', value)}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle text-sm text-slate-700">
                    <div className="flex h-full items-center">
                      <EditableCell type="textarea" value={row.notes} onSave={(value) => handleSave(getAccountId(row), 'notes', value)} />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle text-sm text-slate-700">
                    <div className="flex h-full items-center">
                      <EditableCell type="text" value={row.nextSteps} onSave={(value) => handleSave(getAccountId(row), 'nextSteps', value)} />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle text-sm text-slate-600">
                    <div className="flex h-full items-center">
                      <EditableCell type="date" value={row.nextActionDate} onSave={(value) => handleSave(getAccountId(row), 'nextActionDate', value)} />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle text-sm text-slate-600">
                    <div className="flex h-full items-center">
                      <EditableCell type="date" value={row.lastActivityDate} onSave={(value) => handleSave(getAccountId(row), 'lastActivityDate', value)} />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle text-sm text-slate-600">
                    <div className="flex h-full items-center">
                      <EditableCell type="date" value={row.createdDate} onSave={(value) => handleSave(getAccountId(row), 'createdDate', value)} />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle text-sm text-slate-900">
                    <div className="flex h-full items-center">
                      <EditableCell type="text" value={row.country} onSave={(value) => handleSave(getAccountId(row), 'country', value)} />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle text-sm text-slate-900">
                    <div className="flex h-full items-center">
                      <EditableCell type="text" value={row.custom} onSave={(value) => handleSave(getAccountId(row), 'custom', value)} />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle text-sm text-slate-900">
                    <div className="flex h-full items-center">
                      <EditableCell type="text" value={row.city} onSave={(value) => handleSave(getAccountId(row), 'city', value)} />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="flex h-full items-center">
                      <EditableCell
                        type="select"
                        value={row.employeeSize}
                        options={accountEmployeeSizeOptions}
                        onSave={(value) => handleSave(getAccountId(row), 'employeeSize', value)}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="flex h-full items-center">
                      <EditableCell type="linkedin" value={row.linkedin} onSave={(value) => handleSave(getAccountId(row), 'linkedin', value)} />
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle text-slate-400">
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
        <div>Showing 1 to {Math.min(filteredRows.length, 10)} of {filteredRows.length} results</div>
        <div className="flex items-center gap-2">
          <button className="rounded-full px-3 py-1 text-slate-500 hover:bg-slate-100">&lt;</button>
          <button className="rounded-full bg-emerald-700 px-3 py-1 text-white">1</button>
          <button className="rounded-full px-3 py-1 text-slate-900">2</button>
          <button className="rounded-full px-3 py-1 text-slate-900">3</button>
          <span className="px-2 py-1 text-slate-500">...</span>
          <button className="rounded-full px-3 py-1 text-slate-900">10</button>
          <button className="rounded-full px-3 py-1 text-slate-500 hover:bg-slate-100">&gt;</button>
        </div>
      </div>
    </section>
  );
}