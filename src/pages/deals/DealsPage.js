import { useMemo, useState } from 'react';
import StatCard from '../../components/StatCard';
import AddDealModal from '../../components/AddDealModal';
import BulkImportModal from '../../components/BulkImportModal';
import { dealStageOptions } from '../../constants/options';
import { useDeals } from '../../context/DealsContext';
import { useAccounts } from '../../context/AccountsContext';
import { useContacts } from '../../context/ContactsContext';
import { usePagination } from '../../utils/usePagination';
import { useTableColumns } from '../../utils/useTableColumns';
import DealsFilterBar from './DealsFilterBar';
import DealsTable from './DealsTable';
import BulkActionBar from '../../components/BulkActionBar';
import BulkEditModal from '../../components/BulkEditModal';

const dealFields = [
  { id: 'dealOwner', label: 'Owner', group: 'Deal Details', type: 'owner' },
  { id: 'dealStage', label: 'Stage', group: 'Deal Details', type: 'stage', options: dealStageOptions },
  { id: 'source', label: 'Source', group: 'Deal Details', type: 'text' },
  { id: 'notes', label: 'Notes', group: 'Notes & Follow-up', type: 'textarea' },
];

const teamOwnerOptions = ['Alex Rivera', 'Jane Smith', 'Sarah Jenkins', 'Kevin Malone', 'Michael Chen', 'Olivia Lee'];

const dealSampleHeaders = [
  'Deal Name',
  'Associated Company',
  'Associated Contacts',
  'Deal Value',
  'Deal Owner',
  'Deal Stage',
  'Expected Close Date',
  'Lost Reason',
  'Won Reason',
  'Next Step',
  'Next Step Due Date',
  'Deal Source',
];

const sortDeals = (dealsList, key, direction) => {
  if (!key) return dealsList;
  const sorted = [...dealsList];
  sorted.sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];

    if (key === 'dealCreatedDate' || key === 'lastActivityDate') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }

    if (typeof aVal === 'string') {
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return direction === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0);
  });
  return sorted;
};

export default function DealsPage() {
  const {
    deals: rawDeals,
    loading: dealsLoading,
    error: dealsError,
    createDeal,
    importDeals,
    updateDeal,
    bulkUpdateDeals,
    bulkDeleteDeals,
  } = useDeals();

  const {
    accounts: rawCompanies,
    loading: accountsLoading,
    error: accountsError,
  } = useAccounts();

  const {
    contacts: rawContacts,
    loading: contactsLoading,
    error: contactsError,
  } = useContacts();

  const loading = dealsLoading || accountsLoading || contactsLoading;
  const error = dealsError || accountsError || contactsError;

  // Filter States
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedView, setSelectedView] = useState('All Deals');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedOwner, setSelectedOwner] = useState('All Owners');
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [dealNameFilter, setDealNameFilter] = useState('');
  const [dealSizeRange, setDealSizeRange] = useState({ min: '', max: '' });

  // Sorting
  const [sortKey, setSortKey] = useState('dealCreatedDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [dealSizeSortDirection, setDealSizeSortDirection] = useState('desc');

  // Modals
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [lockedProperty, setLockedProperty] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const deals = useMemo(() => {
    return (rawDeals || []).map((d) => ({
      ...d,
      id: d._id || d.id,
    }));
  }, [rawDeals]);

  const handleCreateDeal = async (newDeal) => {
    try {
      await createDeal(newDeal);
    } catch (err) {
      console.error('Failed to create deal:', err);
      const errMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to create deal: ${errMsg}`);
    }
  };

  const handleImportDeals = async (mapped) => {
    try {
      const result = await importDeals(mapped);
      if (result) {
        const { insertedCount, skippedCount, errors } = result;
        let msg = `Import complete!\n- Successfully imported: ${insertedCount} deals`;
        if (skippedCount > 0) {
          msg += `\n- Skipped: ${skippedCount} deals`;
        }
        if (errors && errors.length > 0) {
          const errorDetails = errors.map(e => `Row ${e.row}: ${e.reason}`).slice(0, 5).join('\n');
          msg += `\n\nTop Errors:\n${errorDetails}${errors.length > 5 ? `\n...and ${errors.length - 5} more.` : ''}`;
        }
        alert(msg);
      }
    } catch (err) {
      console.error('Failed to import deals:', err);
      const errMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Bulk import failed: ${errMsg}`);
    }
  };

  const handleBulkUpdate = async (ids, updates) => {
    await bulkUpdateDeals(ids, updates);
    setSelectedRows([]);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedRows.length} deals? This cannot be undone.`)) {
      await bulkDeleteDeals(selectedRows);
      setSelectedRows([]);
    }
  };

  const openAssignModal = () => {
    setLockedProperty('dealOwner');
    setShowBulkEdit(true);
  };

  const openBulkEditModal = () => {
    setLockedProperty(null);
    setShowBulkEdit(true);
  };

  const {
    columns,
    dragOverColIndex,
    handleResizeStart,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = useTableColumns([
    { id: 'dealName', label: 'Deal Name', width: 300 },
    { id: 'dealSize', label: 'Deal Size', width: 130, sortable: true, sortKey: 'dealSize', align: 'right' },
    { id: 'dealOwner', label: 'Owner', width: 180 },
    { id: 'source', label: 'Source', width: 140 },
    { id: 'dealStage', label: 'Stage', width: 160 },
    { id: 'dealCreatedDate', label: 'Create Date', width: 160, sortable: true, sortKey: 'dealCreatedDate' },
    { id: 'lastActivityDate', label: 'Last Activity', width: 240, sortable: true, sortKey: 'lastActivityDate' },
    { id: 'notes', label: 'Notes', width: 220 },
    { id: 'upcomingTask', label: 'Upcoming Task', width: 200 },
  ]);

  const ownerOptions = useMemo(
    () => ['All Owners', ...Array.from(new Set(deals.map((deal) => deal.dealOwner))).sort()],
    [deals],
  );

  const countryOptions = useMemo(
    () => Array.from(new Set(deals.map((deal) => deal.country || ''))).filter(Boolean).sort(),
    [deals],
  );

  const cityOptions = useMemo(
    () => Array.from(new Set(deals.map((deal) => deal.city || ''))).filter(Boolean).sort(),
    [deals],
  );

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

  const filteredDeals = useMemo(() => {
    const searchValue = globalSearch.trim().toLowerCase();
    const filtered = deals.filter((deal) => {
      const associatedCompanyStr = deal.associatedCompany?.company || deal.associatedCompany || '';
      const primaryContactStr = deal.primaryContact?.name || deal.primaryContact || '';
      const globalMatch = [deal.dealName, associatedCompanyStr, primaryContactStr, deal.dealOwner, deal.source]
        .some((value) => value?.toLowerCase().includes(searchValue));

      const viewMatch =
        selectedView === 'All Deals'
          ? true
          : selectedView === 'My Deals'
          ? deal.dealOwner === 'Jane Smith'
          : new Date(deal.expectedCloseDate) <= new Date(Date.now() + 30 * 86400000);

      const stageMatch = selectedStage === 'All' || deal.dealStage === selectedStage;
      const ownerMatch = selectedOwner === 'All Owners' || deal.dealOwner === selectedOwner;
      const countryMatch = selectedCountries.length === 0 || selectedCountries.includes(deal.country);
      const cityMatch = selectedCities.length === 0 || selectedCities.includes(deal.city);
      const nameMatch = dealNameFilter.trim() === '' || deal.dealName.toLowerCase().includes(dealNameFilter.toLowerCase());
      const minValue = dealSizeRange.min ? Number(dealSizeRange.min) : null;
      const maxValue = dealSizeRange.max ? Number(dealSizeRange.max) : null;
      const sizeMatch =
        (minValue === null || deal.dealSize >= minValue) &&
        (maxValue === null || deal.dealSize <= maxValue);

      return globalMatch && viewMatch && stageMatch && ownerMatch && countryMatch && cityMatch && nameMatch && sizeMatch;
    });

    return sortDeals(filtered, sortKey, sortDirection);
  }, [deals, globalSearch, selectedView, selectedStage, selectedOwner, selectedCountries, selectedCities, dealNameFilter, dealSizeRange, sortKey, sortDirection]);

  const { visibleCount, loadMore } = usePagination(filteredDeals, [
    globalSearch,
    selectedView,
    selectedStage,
    selectedOwner,
    selectedCountries,
    selectedCities,
    dealNameFilter,
    dealSizeRange,
    sortKey,
    sortDirection,
  ]);

  const activeChips = [];
  if (selectedStage !== 'All') {
    activeChips.push({
      key: 'stage-selected',
      label: `Stage: ${selectedStage}`,
      onRemove: () => setSelectedStage('All'),
    });
  }
  if (selectedOwner !== 'All Owners') {
    activeChips.push({
      key: 'owner-selected',
      label: `Owner: ${selectedOwner}`,
      onRemove: () => setSelectedOwner('All Owners'),
    });
  }
  if (selectedView !== 'All Deals') {
    activeChips.push({
      key: 'view-selected',
      label: `View: ${selectedView}`,
      onRemove: () => setSelectedView('All Deals'),
    });
  }
  selectedCountries.forEach((country) => {
    activeChips.push({
      key: `country-${country}`,
      label: `Country: ${country}`,
      onRemove: () => setSelectedCountries(selectedCountries.filter((item) => item !== country)),
    });
  });
  selectedCities.forEach((city) => {
    activeChips.push({
      key: `city-${city}`,
      label: `City: ${city}`,
      onRemove: () => setSelectedCities(selectedCities.filter((item) => item !== city)),
    });
  });
  if (dealNameFilter.trim()) {
    activeChips.push({
      key: 'dealName',
      label: `Deal Name: ${dealNameFilter}`,
      onRemove: () => setDealNameFilter(''),
    });
  }
  if (dealSizeRange.min) {
    activeChips.push({
      key: 'dealSize-min',
      label: `Min: $${dealSizeRange.min}`,
      onRemove: () => setDealSizeRange((current) => ({ ...current, min: '' })),
    });
  }
  if (dealSizeRange.max) {
    activeChips.push({
      key: 'dealSize-max',
      label: `Max: $${dealSizeRange.max}`,
      onRemove: () => setDealSizeRange((current) => ({ ...current, max: '' })),
    });
  }

  const clearAllFilters = () => {
    setSelectedStage('All');
    setSelectedOwner('All Owners');
    setSelectedView('All Deals');
    setSelectedCountries([]);
    setSelectedCities([]);
    setDealNameFilter('');
    setDealSizeRange({ min: '', max: '' });
  };

  // Stat Card Metrics
  const stats = useMemo(() => {
    const totalDeals = filteredDeals.length;
    const totalValue = filteredDeals.reduce((sum, d) => sum + (d.dealSize || 0), 0);
    const avgValue = totalDeals > 0 ? Math.round(totalValue / totalDeals) : 0;
    const closedWonCount = filteredDeals.filter((d) => d.dealStage === 'Closed Won').length;
    const winRate = totalDeals > 0 ? Math.round((closedWonCount / totalDeals) * 100) : 0;

    return [
      { label: 'Active Deals', value: totalDeals, change: '+12% from last month', isTrendingUp: true },
      { label: 'Pipeline Value', value: `$${(totalValue / 1000).toFixed(1)}k`, change: '+8% from last month', isTrendingUp: true },
      { label: 'Avg Deal Size', value: `$${(avgValue / 1000).toFixed(1)}k`, change: '-3% from last month', isTrendingUp: false },
      { label: 'Win Rate', value: `${winRate}%`, change: '+4% from last month', isTrendingUp: true },
    ];
  }, [filteredDeals]);

  return (
    <section className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Deals Pipeline</h1>
          <p className="mt-1.5 text-sm text-slate-500">Track and manage sales opportunities, values, and stages.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xl font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            onClick={() => setShowBulkImport(true)}
          >
            Bulk Import
          </button>
          <button
            type="button"
            className="rounded-xl bg-emerald-700 px-5 py-3 text-xl font-medium text-white transition hover:bg-emerald-800"
            onClick={() => setShowAddDeal(true)}
          >
            + New Deal
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

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
        <DealsFilterBar
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          selectedStage={selectedStage}
          setSelectedStage={setSelectedStage}
          selectedOwner={selectedOwner}
          setSelectedOwner={setSelectedOwner}
          selectedCountries={selectedCountries}
          setSelectedCountries={setSelectedCountries}
          selectedCities={selectedCities}
          setSelectedCities={setSelectedCities}
          dealNameFilter={dealNameFilter}
          setDealNameFilter={setDealNameFilter}
          dealSizeRange={dealSizeRange}
          setDealSizeRange={setDealSizeRange}
          dealSizeSortDirection={dealSizeSortDirection}
          setDealSizeSortDirection={setDealSizeSortDirection}
          setSortKey={setSortKey}
          setSortDirection={setSortDirection}
          stageOptions={dealStageOptions}
          ownerOptions={ownerOptions}
          countryOptions={countryOptions}
          cityOptions={cityOptions}
          activeChips={activeChips}
          clearAllFilters={clearAllFilters}
        />
      )}

      <BulkEditModal
        open={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        ids={selectedRows}
        fields={dealFields}
        entityLabel="deals"
        ownerOptions={teamOwnerOptions}
        onUpdate={handleBulkUpdate}
        lockedProperty={lockedProperty}
      />

      {/* Main Table */}
      <DealsTable
        deals={filteredDeals}
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
        visibleCount={visibleCount}
        loadMore={loadMore}
        ownerOptions={teamOwnerOptions}
        dealStageOptions={dealStageOptions}
        updateDeal={updateDeal}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
      />

      {/* Modals */}
      <AddDealModal
        open={showAddDeal}
        onClose={() => setShowAddDeal(false)}
        stageOptions={dealStageOptions}
        companyOptions={rawCompanies.map((row) => row.company)}
        contactOptions={rawContacts.map((row) => row.name)}
        onCreate={(newDeal) => {
          handleCreateDeal(newDeal);
          setShowAddDeal(false);
        }}
      />

      <BulkImportModal
        open={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        entityLabel="deal"
        entityLabelPlural="deals"
        sampleHeaders={dealSampleHeaders}
        requiredFields={['Deal Name', 'Associated Company', 'Deal Value', 'Deal Owner', 'Deal Stage']}
        onImport={(importedRows) => {
          const mapped = importedRows.map((row) => ({
            'Deal Name': row['Deal Name'] || '',
            'Associated Company': row['Associated Company'] || '',
            'Deal Value': row['Deal Value'] || '',
            'Deal Owner': row['Deal Owner'] || '',
            'Deal Stage': row['Deal Stage'] || '',
            'Expected Close Date': row['Expected Close Date'] || '',
            'Lost Reason': row['Lost Reason'] || '',
            'Won Reason': row['Won Reason'] || '',
            'Next Step': row['Next Step'] || '',
            'Next Step Due Date': row['Next Step Due Date'] || '',
            'Deal Source': row['Deal Source'] || '',
            'Deal Notes': row['Deal Notes'] || '',
            'Associated Contacts': row['Associated Contacts'] || '',
          }));
          handleImportDeals(mapped);
          setShowBulkImport(false);
        }}
      />
    </section>
  );
}
