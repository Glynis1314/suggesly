import { useMemo, useState } from 'react';
import AddCompanyModal from '../../components/AddCompanyModal';
import BulkImportModal from '../../components/BulkImportModal';
import ColumnPickerModal from '../../components/ColumnPickerModal';

import { useTableColumns } from '../../utils/useTableColumns';
import { usePagination } from '../../utils/usePagination';
import {
  accountStageOptions,
  accountPriorityOptions,
  accountSourceOptions,
  accountEmployeeSizeOptions,
} from '../../constants/options';
import { useAccounts } from '../../context/AccountsContext';
import AccountsFilterBar from './AccountsFilterBar';
import AccountsTable from './AccountsTable';
import BulkActionBar from '../../components/BulkActionBar';
import BulkEditModal from '../../components/BulkEditModal';

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

const companySampleData = [
  {
    'Company name': 'CloudSphere AI',
    'Owner': 'Ritik Rathod',
    'Source': 'Linkedin',
    'Priority': 'P0',
    'Stage': 'Assigned',
    'Country': 'India',
    'City': 'Mumbai',
    'Employee Size': '01-Oct',
    'Linkedin URL': 'https://www.linkedin.com/company/cloudsphere?originalSubdomain=in'
  },
  {
    'Company name': 'FinEdge Technologies',
    'Owner': 'Ankit Sharma',
    'Source': 'Reference',
    'Priority': 'P1',
    'Stage': 'Reached Out',
    'Country': 'Pakistan',
    'City': 'Lahore',
    'Employee Size': 'Nov-50',
    'Linkedin URL': 'https://www.linkedin.com/company/finedge-official?originalSubdomain=in'
  },
];

const companyFields = [
  { id: 'owner', label: 'Owner', group: 'Company Details', type: 'owner' },
  { id: 'source', label: 'Source', group: 'Company Details', type: 'multiselect', options: accountSourceOptions },
  { id: 'priority', label: 'Priority', group: 'Company Details', type: 'select', options: accountPriorityOptions },
  { id: 'stage', label: 'Stage', group: 'Company Details', type: 'stage', options: accountStageOptions },
  { id: 'notes', label: 'Notes', group: 'Notes & Follow-up', type: 'textarea' },
  { id: 'nextSteps', label: 'Next Steps', group: 'Notes & Follow-up', type: 'text' },
  { id: 'nextActionDate', label: 'Next Action Date', group: 'Notes & Follow-up', type: 'date' },
  { id: 'country', label: 'Country', group: 'Additional Information', type: 'text' },
  { id: 'city', label: 'City', group: 'Additional Information', type: 'text' },
  { id: 'employeeSize', label: 'Employee Size', group: 'Additional Information', type: 'select', options: accountEmployeeSizeOptions },
  { id: 'linkedin', label: 'LinkedIn URL', group: 'Additional Information', type: 'linkedin' },
];

const ALL_COMPANY_COLUMNS = [
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
];


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
  multiselect: ['is any of'],
};

function getPropertyLabel(key) {
  return propertyOptions.find((option) => option.key === key)?.label || key;
}

function parseDate(value) {
  return value ? new Date(value).getTime() : null;
}

export default function AccountsPage() {
  const {
    accounts: rawAccounts,
    loading,
    error,
    createAccount,
    importAccounts,
    updateAccount,
    bulkUpdateAccounts,
    bulkDeleteAccounts,
  } = useAccounts();

  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [lockedProperty, setLockedProperty] = useState(null);

  // Filter Bar States
  const [selectedView, setSelectedView] = useState('All Companies');
  const [filters, setFilters] = useState([]);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showFilterBuilder, setShowFilterBuilder] = useState(false);
  const [filterProperty, setFilterProperty] = useState('company');
  const [filterCondition, setFilterCondition] = useState('contains');
  const [filterValue, setFilterValue] = useState('');
  const [filterValueExtra, setFilterValueExtra] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  // Sorting
  const [sortKey, setSortKey] = useState('createdDate');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleBulkUpdate = async (ids, updates) => {
    await bulkUpdateAccounts(ids, updates);
    setSelectedRows([]);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedRows.length} companies? This cannot be undone.`)) {
      await bulkDeleteAccounts(selectedRows);
      setSelectedRows([]);
    }
  };

  const openAssignModal = () => {
    setLockedProperty('owner');
    setShowBulkEdit(true);
  };

  const openBulkEditModal = () => {
    setLockedProperty(null);
    setShowBulkEdit(true);
  };

  const companies = useMemo(() => {
    return (rawAccounts || []).map((c) => ({
      ...c,
      id: c._id || c.id,
      createdDate: c.createdAt
        ? new Date(c.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          })
        : c.createdDate || '',
    }));
  }, [rawAccounts]);

  const handleCreateAccount = async (newCompany) => {
    try {
      await createAccount(newCompany);
    } catch (err) {
      console.error('Failed to create company:', err);
      const errMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to create company: ${errMsg}`);
    }
  };

  const handleUpdateAccount = async (id, updatedFields) => {
    try {
      await updateAccount(id, updatedFields);
    } catch (err) {
      console.error('Failed to update company:', err);
      const errMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to update company: ${errMsg}`);
    }
  };

  const handleImportAccounts = async (mapped) => {
    try {
      const result = await importAccounts(mapped);
      if (result) {
        const { insertedCount, skippedCount, errors } = result;
        let msg = `Import complete!\n- Successfully imported: ${insertedCount} companies`;
        if (skippedCount > 0) {
          msg += `\n- Skipped: ${skippedCount} companies`;
        }
        if (errors && errors.length > 0) {
          const errorDetails = errors.map(e => `Row ${e.row}: ${e.reason}`).slice(0, 5).join('\n');
          msg += `\n\nTop Errors:\n${errorDetails}${errors.length > 5 ? `\n...and ${errors.length - 5} more.` : ''}`;
        }
        alert(msg);
      }
    } catch (err) {
      console.error('Failed to import companies:', err);
      const errMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Bulk import failed: ${errMsg}`);
    }
  };

  const {
    columns,
    dragOverColIndex,
    handleResizeStart,
    handleDragStart,
    handleDragOver,
    handleDrop,
    setColumns,
  } = useTableColumns(ALL_COMPANY_COLUMNS);

  const ownerOptions = useMemo(
    () => Array.from(new Set(companies.map((row) => row.owner).filter(Boolean))).sort(),
    [companies]
  );

  const optionsByProperty = {
    owner: ownerOptions,
    source: accountSourceOptions,
    priority: accountPriorityOptions,
    stage: accountStageOptions,
    employeeSize: accountEmployeeSizeOptions,
  };

  const filterPropertyType = propertyOptions.find((option) => option.key === filterProperty)?.type || 'text';
  const currentUser = 'Alex Rivera';

  const handleSort = (key, direction) => {
    if (direction) {
      setSortKey(key);
      setSortDirection(direction);
      return;
    }
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection('asc');
  };

  const sortedAndFilteredRows = useMemo(() => {
    const filtered = companies.filter((row) => {
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
          const arr = Array.isArray(rowValue) ? rowValue : [rowValue].filter(Boolean);
          const allowed = Array.isArray(filter.value) ? filter.value : [filter.value];
          return arr.some((val) => allowed.includes(val));
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

    if (!sortKey) return filtered;
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (sortKey === 'createdDate' || sortKey === 'lastActivityDate' || sortKey === 'nextActionDate') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0);
    });

    return sorted;
  }, [companies, selectedView, filters, sortKey, sortDirection]);

  const { visibleCount, loadMore } = usePagination(sortedAndFilteredRows, [filters, selectedView, sortKey, sortDirection]);

  const activeFilterChips = filters.map((filter, index) => {
    const valueLabel =
      Array.isArray(filter.value) && filter.value.length > 0 ? filter.value.join(', ') : filter.value;
    return {
      key: `${filter.property}-${index}`,
      label: `${getPropertyLabel(filter.property)}: ${valueLabel}`,
      onRemove: () => setFilters((current) => current.filter((_, idx) => idx !== index)),
    };
  });

  const clearAllFilters = () => setFilters([]);

  return (
    <section className="w-full space-y-6">
      {/* Page Header */}
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
            onClick={() => setShowColumnPicker(true)}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xl font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Add Columns
          </button>
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

      <ColumnPickerModal
        open={showColumnPicker}
        onClose={() => setShowColumnPicker(false)}
        allColumns={ALL_COMPANY_COLUMNS}
        visibleColumns={columns}
        onApply={setColumns}
      />

      <AddCompanyModal
        open={showAddCompany}
        onClose={() => setShowAddCompany(false)}
        stageOptions={accountStageOptions}
        priorityOptions={accountPriorityOptions}
        sourceOptions={accountSourceOptions}
        employeeSizeOptions={accountEmployeeSizeOptions}
        onCreate={(newCompany) => {
          handleCreateAccount(newCompany);
          setShowAddCompany(false);
        }}
      />

      <BulkImportModal
        open={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        entityLabel="company"
        entityLabelPlural="companies"
        sampleHeaders={companySampleHeaders}
        customSampleData={companySampleData}
        requiredFields={['Company Name', 'Owner', 'Stage']}
        onImport={(importedRows) => {
          const mapped = importedRows.map((row) => ({
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
            country: row['Country'] || '',
            city: row['City'] || '',
            employeeSize: row['Employee Size'] || '',
            linkedin: row['LinkedIn URL'] || '',
          }));
          handleImportAccounts(mapped);
          setShowBulkImport(false);
        }}
      />

      {/* Filter / Bulk Actions Bar */}
      {selectedRows.length > 0 ? (
        <BulkActionBar
          selectedCount={selectedRows.length}
          onClear={() => setSelectedRows([])}
          onAssign={openAssignModal}
          onBulkEdit={openBulkEditModal}
          onDelete={handleBulkDelete}
        />
      ) : (
        <AccountsFilterBar
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          showViewDropdown={showViewDropdown}
          setShowViewDropdown={setShowViewDropdown}
          activeFilterChips={activeFilterChips}
          clearAllFilters={clearAllFilters}
          showFilterBuilder={showFilterBuilder}
          setShowFilterBuilder={setShowFilterBuilder}
          filterProperty={filterProperty}
          setFilterProperty={setFilterProperty}
          filterCondition={filterCondition}
          setFilterCondition={setFilterCondition}
          filterValue={filterValue}
          setFilterValue={setFilterValue}
          filterValueExtra={filterValueExtra}
          setFilterValueExtra={setFilterValueExtra}
          filters={filters}
          setFilters={setFilters}
          optionsByProperty={optionsByProperty}
          propertyOptions={propertyOptions}
          conditionOptions={conditionOptions}
          filterPropertyType={filterPropertyType}
        />
      )}

      <BulkEditModal
        open={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        ids={selectedRows}
        fields={companyFields}
        entityLabel="companies"
        ownerOptions={ownerOptions}
        onUpdate={handleBulkUpdate}
        lockedProperty={lockedProperty}
      />

      {/* Accounts Table */}
      <AccountsTable
        companies={sortedAndFilteredRows}
        columns={columns}
        loading={loading}
        error={error}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        dragOverColIndex={dragOverColIndex}
        handleResizeStart={handleResizeStart}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        visibleCount={visibleCount}
        loadMore={loadMore}
        ownerOptions={ownerOptions}
        updateAccount={handleUpdateAccount}
      />
    </section>
  );
}