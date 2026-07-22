import { useEffect, useMemo, useState } from 'react';
import StatCard from '../../components/StatCard';
import AddDealModal from '../../components/AddDealModal';
import BulkImportModal from '../../components/BulkImportModal';
import { dealStageOptions } from '../../constants/options';
import { getDeals, createDeal as createDealApi } from '../../services/dealApi';
import { getCompanies } from '../../services/companyApi';
import { getContacts } from '../../services/contactApi';
import { usePagination } from '../../utils/usePagination';
import { useTableColumns } from '../../utils/useTableColumns';
import DealsFilterBar from './DealsFilterBar';
import DealsTable from './DealsTable';

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
  const [deals, setDeals] = useState([]);
  const [rawCompanies, setRawCompanies] = useState([]);
  const [rawContacts, setRawContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Advanced filters state for columns visibility
  const [advancedFilters, setAdvancedFilters] = useState({
    country: false,
    city: false,
    dealName: false,
    dealSize: false,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dealsRes, companiesRes, contactsRes] = await Promise.all([
          getDeals(),
          getCompanies(),
          getContacts(),
        ]);

        if (isMounted) {
          const mappedDeals = (dealsRes.data?.data || []).map((d) => ({
            ...d,
            id: d._id || d.id,
          }));
          setDeals(mappedDeals);
          setRawCompanies(companiesRes.data?.data || []);
          setRawContacts(contactsRes.data?.data || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch data from the server.');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const createDeal = async (newDeal) => {
    try {
      const res = await createDealApi(newDeal);
      const created = res.data?.data;
      if (created) {
        setDeals((prev) => [{ ...created, id: created._id || created.id }, ...prev]);
      }
    } catch (err) {
      console.error('Failed to create deal:', err);
      const errMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to create deal: ${errMsg}`);
    }
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

  const handleSort = (key) => {
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

      {/* Filter Bar */}
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
      />

      {/* Modals */}
      <AddDealModal
        open={showAddDeal}
        onClose={() => setShowAddDeal(false)}
        stageOptions={dealStageOptions}
        companyOptions={rawCompanies.map((row) => row.company)}
        contactOptions={rawContacts.map((row) => row.name)}
        onCreate={(newDeal) => {
          createDeal(newDeal);
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
          importedRows.forEach((row, index) => {
            const now = new Date().toISOString();
            createDeal({
              id: `${(row['Deal Name'] || 'deal').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}-${Date.now()}-${index}`,
              dealName: row['Deal Name'] || '',
              dealSize: Number(row['Deal Value']) || 0,
              dealOwner: row['Deal Owner'] || '',
              dealSourceOwner: '',
              dealSourceOwnerName: '',
              dealStage: row['Deal Stage'] || '',
              dealCreatedDate: now,
              lastActivityDate: now,
              remarks: row['Deal Notes'] || '',
              associatedCompany: row['Associated Company'] || '',
              primaryContact: (row['Associated Contacts'] || '').split(',')[0]?.trim() || '',
              associatedContacts: (row['Associated Contacts'] || '')
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
              expectedCloseDate: row['Expected Close Date'] || '',
              dealProbability: 0,
              lostReason: row['Lost Reason'] || '',
              wonReason: row['Won Reason'] || '',
              nextAction: row['Next Step'] || '',
              nextStepDueDate: row['Next Step Due Date'] || '',
              country: '',
              city: '',
              source: row['Deal Source'] || '',
            });
          });
          setShowBulkImport(false);
        }}
      />
    </section>
  );
}
