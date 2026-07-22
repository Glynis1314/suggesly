import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTableColumns } from '../../utils/useTableColumns';
import { usePagination } from '../../utils/usePagination';
import StageBadge from '../../components/StageBadge';
import OwnerAvatar from '../../components/OwnerAvatar';
import CurrencyCell from '../../components/CurrencyCell';
import DateCell from '../../components/DateCell';
import TaskListCell from '../../components/TaskListCell';
import AddDealModal from '../../components/AddDealModal';
import BulkImportModal from '../../components/BulkImportModal';
import { dealStageOptions } from '../../data/dealsData';
import { getDeals, createDeal as createDealApi } from '../../services/dealApi';
import { getCompanies } from '../../services/companyApi';
import { getContacts } from '../../services/contactApi';

const dealSampleHeaders = [
  'Deal Name',
  'Associated Company',
  'Associated Contacts',
  'Deal Value',
  'Deal Owner',
  'Deal Stage',
  'Deal Source',
  'Expected Close Date',
  'Next Step',
  'Next Step Due Date',
  'Lost Reason',
  'Won Reason',
  'Deal Notes',
];

const viewOptions = ['All Deals', 'My Deals', 'Closing Soon'];
const stageOptions = ['All', 'Deal Created', 'POC', 'Proposal', 'Nurture', 'Closed Won', 'Closed Lost'];
const cellBaseClasses = 'px-6 py-4';
const headerCellClasses = 'px-6 py-4 text-xs font-medium uppercase tracking-wide text-gray-500';
const primaryTextClasses = 'text-sm font-medium text-gray-900';
const secondaryTextClasses = 'text-xs text-gray-500';
const avatarPalette = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
];

function getDealDisplayName(dealName) {
  return dealName.replace(/\s*-\s*\$[0-9,.]+/g, '').trim();
}

function getAvatarClasses(seed) {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarPalette[hash % avatarPalette.length];
}

function ChevronDownIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const sortDeals = (deals, key, direction) => {
  return [...deals].sort((a, b) => {
    if (key === 'dealSize') {
      return direction === 'asc' ? a.dealSize - b.dealSize : b.dealSize - a.dealSize;
    }
    const dateA = new Date(a[key]).getTime();
    const dateB = new Date(b[key]).getTime();
    return direction === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

export default function DealsPage() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawCompanies, setRawCompanies] = useState([]);
  const [rawContacts, setRawContacts] = useState([]);
  
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const globalSearch = '';
  const [selectedView, setSelectedView] = useState('All Deals');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedOwner, setSelectedOwner] = useState('All Owners');
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [dealNameFilter, setDealNameFilter] = useState('');
  const [dealSizeRange, setDealSizeRange] = useState({ min: '', max: '' });
  const [sortKey, setSortKey] = useState('dealCreatedDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [dealSizeSortDirection, setDealSizeSortDirection] = useState('desc');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({ country: false, city: false, dealName: false, dealSize: false });
  const dropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dealsRes, compsRes, contactsRes] = await Promise.all([
          getDeals(),
          getCompanies(),
          getContacts()
        ]);
        if (isMounted) {
          const mappedDeals = (dealsRes.data?.data || []).map(d => ({
            ...d,
            id: d._id || d.id
          }));
          setDeals(mappedDeals);
          setRawCompanies(compsRes.data?.data || []);
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
    return () => { isMounted = false; };
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

  const tableWidth = useMemo(() => {
    return columns.reduce((sum, col) => sum + (col.width || 0), 0);
  }, [columns]);



  const ownerOptions = useMemo(
    () => ['All Owners', ...Array.from(new Set(deals.map((deal) => deal.dealOwner))).sort()],
    [deals],
  );

  const countryOptions = useMemo(
    () => Array.from(new Set(deals.map((deal) => deal.country))).sort(),
    [deals],
  );

  const cityOptions = useMemo(
    () => Array.from(new Set(deals.map((deal) => deal.city))).sort(),
    [deals],
  );

  useEffect(() => {
    const onClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    const onEscape = (event) => {
      if (event.key === 'Escape') {
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

  const toggleSelection = (value, selected, setSelected) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const setSingleFilter = (type, value) => {
    if (type === 'stage') {
      setSelectedStage(value);
    }
    if (type === 'owner') {
      setSelectedOwner(value);
    }
    if (type === 'view') {
      setSelectedView(value);
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection('asc');
  };

  const visibleFilters = {
    country: advancedFilters.country || selectedCountries.length > 0,
    city: advancedFilters.city || selectedCities.length > 0,
    dealName: advancedFilters.dealName || dealNameFilter.trim() !== '',
    dealSize: advancedFilters.dealSize || dealSizeRange.min !== '' || dealSizeRange.max !== '',
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

  const { visibleCount, handleScroll, loadMore } = usePagination(filteredDeals, [
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

  const openDropdown = (name) => {
    setDropdownSearch('');
    setActiveDropdown((current) => (current === name ? null : name));
  };

  const filteredDropdownOptions = (options) => {
    return options.filter((option) =>
      option.toLowerCase().includes(dropdownSearch.trim().toLowerCase()),
    );
  };

  const renderCellContent = (deal, colId) => {
    switch (colId) {
      case 'dealName':
        return (
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${getAvatarClasses(deal.id)}`}>
              {getDealDisplayName(deal.dealName).charAt(0).toUpperCase()}
            </div>
            <div className="flex min-w-0 flex-col">
              <button
                type="button"
                onClick={() => navigate(`/deals/${deal.id}`)}
                className={`${primaryTextClasses} text-left underline-offset-4 transition hover:underline truncate`}
              >
                {getDealDisplayName(deal.dealName)}
              </button>
              <p className={`${secondaryTextClasses} mt-1 block truncate`}>{deal.associatedCompany?.company || deal.associatedCompany || '—'}</p>
            </div>
          </div>
        );
      case 'dealSize':
        return (
          <div className="flex items-center justify-end w-full">
            <CurrencyCell value={deal.dealSize} />
          </div>
        );
      case 'dealOwner':
        return (
          <div className="flex items-center">
            <OwnerAvatar owner={deal.dealOwner} />
          </div>
        );
      case 'source':
        return (
          <div className="flex items-center">
            <span className="text-sm text-gray-900">{deal.source || deal.dealSourceOwnerName || '—'}</span>
          </div>
        );
      case 'dealStage':
        return (
          <div className="flex items-center">
            <StageBadge stage={deal.dealStage} />
          </div>
        );
      case 'dealCreatedDate':
        return (
          <div className="flex items-center">
            <DateCell date={deal.dealCreatedDate} />
          </div>
        );
      case 'lastActivityDate':
        return (
          <div className="flex items-center">
            <DateCell date={deal.lastActivityDate} />
          </div>
        );
      case 'upcomingTask':
        return (
          <div className="flex items-center">
            <TaskListCell tasks={deal.tasks} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="w-full space-y-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Accounts <span className="mx-2">&gt;</span>
            <span className="font-medium text-slate-800">Deals</span>
          </p>
          <h1 className="mt-2 text-5xl font-semibold">Deals</h1>
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
            className="rounded-xl bg-emerald-700 px-5 py-3 text-xl font-medium text-white transition hover:bg-emerald-800"
            onClick={() => setShowAddDeal(true)}
          >
            + New Deal
          </button>
        </div>
      </div>

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

      <div className="mb-6 rounded-2xl border border-slate-300 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative" ref={activeDropdown === 'View' ? dropdownRef : null}>
            <button
              type="button"
              onClick={() => openDropdown('View')}
              className="inline-flex min-w-[140px] flex-col items-start rounded-full border border-gray-200 bg-slate-50 px-4 py-1.5 shadow-sm"
            >
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">VIEW</span>
              <span className="flex items-center gap-1 text-sm font-medium text-gray-900">
                <span>{selectedView}</span>
                <ChevronDownIcon className="h-3 w-3 text-gray-400" />
              </span>
            </button>
            {activeDropdown === 'View' && (
              <div className="absolute left-0 z-20 mt-2 w-72 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
                {viewOptions.map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => {
                      setSingleFilter('view', view);
                      setActiveDropdown(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm ${selectedView === view ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span>{view}</span>
                    {selectedView === view ? <span className="text-emerald-600">✓</span> : null}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={activeDropdown === 'Stage' ? dropdownRef : null}>
            <button
              type="button"
              onClick={() => openDropdown('Stage')}
              className="inline-flex min-w-[140px] flex-col items-start rounded-full border border-gray-200 bg-slate-50 px-4 py-1.5 shadow-sm"
            >
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">STAGE</span>
              <span className="flex items-center gap-1 text-sm font-medium text-gray-900">
                <span>{selectedStage}</span>
                <ChevronDownIcon className="h-3 w-3 text-gray-400" />
              </span>
            </button>
            {activeDropdown === 'Stage' && (
              <div className="absolute left-0 z-20 mt-2 w-80 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {filteredDropdownOptions(stageOptions).map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => {
                        setSingleFilter('stage', stage);
                        setActiveDropdown(null);
                      }}
                      className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-3">
                        <span>{stage === 'All' ? 'All stages' : stage}</span>
                      </span>
                      {selectedStage === stage ? <span className="text-emerald-600">✓</span> : null}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStage('All')}
                  className="mt-4 text-sm font-semibold text-slate-500 hover:text-slate-900"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="relative" ref={activeDropdown === 'Owner' ? dropdownRef : null}>
            <button
              type="button"
              onClick={() => openDropdown('Owner')}
              className="inline-flex min-w-[140px] flex-col items-start rounded-full border border-gray-200 bg-slate-50 px-4 py-1.5 shadow-sm"
            >
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">OWNER</span>
              <span className="flex items-center gap-1 text-sm font-medium text-gray-900">
                <span>{selectedOwner}</span>
                <ChevronDownIcon className="h-3 w-3 text-gray-400" />
              </span>
            </button>
            {activeDropdown === 'Owner' && (
              <div className="absolute left-0 z-20 mt-2 w-80 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {filteredDropdownOptions(ownerOptions).map((owner) => (
                    <button
                      key={owner}
                      type="button"
                      onClick={() => {
                        setSingleFilter('owner', owner);
                        setActiveDropdown(null);
                      }}
                      className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span>{owner}</span>
                      {selectedOwner === owner ? <span className="text-emerald-600">✓</span> : null}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOwner('All Owners')}
                  className="mt-4 text-sm font-semibold text-slate-500 hover:text-slate-900"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="ml-auto relative" ref={activeDropdown === 'More Filters' ? dropdownRef : null}>
            <button
              type="button"
              onClick={() => openDropdown('More Filters')}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              More Filters
              <span className="text-slate-200">▾</span>
            </button>
            {activeDropdown === 'More Filters' && (
              <div className="absolute right-0 z-20 mt-2 w-72 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Add filters</p>
                <div className="space-y-2">
                  {['country', 'city', 'dealName', 'dealSize'].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() =>
                        setAdvancedFilters((prev) => ({ ...prev, [filter]: !prev[filter] }))
                      }
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span>{filter === 'dealName' ? 'Deal Name' : filter === 'dealSize' ? 'Deal Size' : filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
                      <span>{advancedFilters[filter] ? '✓' : ''}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {visibleFilters.country && (
            <div className="relative" ref={activeDropdown === 'Country' ? dropdownRef : null}>
              <button
                type="button"
                onClick={() => openDropdown('Country')}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${selectedCountries.length ? 'border-sky-200 bg-sky-50 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
              >
                <span>{selectedCountries.length ? `Country: ${selectedCountries.length} selected` : 'Country'}</span>
                <span className="text-slate-400">▾</span>
              </button>
              {activeDropdown === 'Country' && (
                <div className="absolute left-0 z-20 mt-2 w-80 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
                  <input
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                    placeholder="Search country..."
                    className="mb-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {filteredDropdownOptions(countryOptions).map((country) => (
                      <button
                        key={country}
                        type="button"
                        onClick={() => toggleSelection(country, selectedCountries, setSelectedCountries)}
                        className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedCountries.includes(country)}
                            readOnly
                            className="h-4 w-4 rounded border-slate-300 text-sky-600"
                          />
                          <span>{country}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCountries([])}
                    className="mt-4 text-sm font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {visibleFilters.city && (
            <div className="relative" ref={activeDropdown === 'City' ? dropdownRef : null}>
              <button
                type="button"
                onClick={() => openDropdown('City')}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${selectedCities.length ? 'border-sky-200 bg-sky-50 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
              >
                <span>{selectedCities.length ? `City: ${selectedCities.length} selected` : 'City'}</span>
                <span className="text-slate-400">▾</span>
              </button>
              {activeDropdown === 'City' && (
                <div className="absolute left-0 z-20 mt-2 w-80 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
                  <input
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                    placeholder="Search city..."
                    className="mb-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {filteredDropdownOptions(cityOptions).map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => toggleSelection(city, selectedCities, setSelectedCities)}
                        className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedCities.includes(city)}
                            readOnly
                            className="h-4 w-4 rounded border-slate-300 text-sky-600"
                          />
                          <span>{city}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCities([])}
                    className="mt-4 text-sm font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {visibleFilters.dealName && (
            <div className="relative" ref={activeDropdown === 'Deal Name' ? dropdownRef : null}>
              <button
                type="button"
                onClick={() => openDropdown('Deal Name')}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${dealNameFilter ? 'border-sky-200 bg-sky-50 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
              >
                <span>{dealNameFilter ? `Deal Name: ${dealNameFilter}` : 'Deal Name'}</span>
                <span className="text-slate-400">▾</span>
              </button>
              {activeDropdown === 'Deal Name' && (
                <div className="absolute left-0 z-20 mt-2 w-80 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
                  <label className="block text-sm text-slate-500">Search deal name</label>
                  <input
                    value={dealNameFilter}
                    onChange={(e) => setDealNameFilter(e.target.value)}
                    placeholder="Type a deal name"
                    className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setDealNameFilter('')}
                    className="mt-4 text-sm font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {visibleFilters.dealSize && (
            <div className="relative" ref={activeDropdown === 'Deal Size' ? dropdownRef : null}>
              <button
                type="button"
                onClick={() => openDropdown('Deal Size')}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${dealSizeRange.min || dealSizeRange.max ? 'border-sky-200 bg-sky-50 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
              >
                <span>Deal Size</span>
                <span className="text-slate-400">▾</span>
              </button>
              {activeDropdown === 'Deal Size' && (
                <div className="absolute left-0 z-20 mt-2 w-80 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
                  <p className="text-sm text-slate-500">Sort</p>
                  <div className="mt-3 flex gap-2">
                    {['desc', 'asc'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setDealSizeSortDirection(option);
                          setSortKey('dealSize');
                          setSortDirection(option);
                        }}
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold ${dealSizeSortDirection === option ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        {option === 'asc' ? 'Ascending' : 'Descending'}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3">
                    <label className="text-sm text-slate-500">Minimum size</label>
                    <input
                      type="number"
                      value={dealSizeRange.min}
                      onChange={(e) => setDealSizeRange((prev) => ({ ...prev, min: e.target.value }))}
                      placeholder="0"
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    />
                    <label className="text-sm text-slate-500">Maximum size</label>
                    <input
                      type="number"
                      value={dealSizeRange.max}
                      onChange={(e) => setDealSizeRange((prev) => ({ ...prev, max: e.target.value }))}
                      placeholder="999999"
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setDealSizeRange({ min: '', max: '' })}
                    className="mt-4 text-sm font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          {activeChips.map((chip) => (
            <div key={chip.key} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
              <span>{chip.label}</span>
              <button type="button" onClick={chip.onRemove} className="text-slate-400 hover:text-slate-700">
                ×
              </button>
            </div>
          ))}
          {activeChips.length > 1 && (
            <button type="button" onClick={clearAllFilters} className="ml-auto text-sm font-semibold text-slate-700 hover:text-slate-900">
              Clear all
            </button>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white w-full">
        <div
          className="max-h-[calc(100vh-26rem)] overflow-y-auto overflow-x-auto w-full"
          onScroll={handleScroll}
        >
          <table className="w-full table-fixed" style={{ width: `${tableWidth}px` }}>
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr className="border-b border-gray-100">
                {columns.map((col, index) => (
                  <th
                    key={col.id}
                    style={{ width: `${col.width}px` }}
                    className={`${headerCellClasses} relative select-none group border-r border-slate-100 last:border-0 ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    } ${
                      col.sortable ? 'cursor-pointer' : ''
                    } ${
                      dragOverColIndex === index ? 'bg-slate-100 border-l-2 border-l-emerald-500' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(index, e)}
                    onDragOver={(e) => handleDragOver(index, e)}
                    onDrop={(e) => handleDrop(index, e)}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        onClick={() => col.sortable && handleSort(col.sortKey)}
                        className={`truncate cursor-grab active:cursor-grabbing font-semibold flex-grow flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : 'justify-start'
                          }`}
                      >
                        {col.label}
                        {col.sortable && sortKey === col.sortKey && (
                          <span className="text-[10px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </span>
                      <div
                        onMouseDown={(e) => handleResizeStart(index, e)}
                        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100 hover:opacity-100 bg-slate-300 active:bg-emerald-500 transition-opacity"
                        style={{ zIndex: 2 }}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Loading deals...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-rose-500 font-medium">
                    {error}
                  </td>
                </tr>
              ) : filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No deals found.
                  </td>
                </tr>
              ) : (
                filteredDeals.slice(0, visibleCount).map((deal) => (
                  <tr key={deal.id} className="border-b border-gray-100 hover:bg-slate-50">
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        style={{ width: `${col.width}px` }}
                        className={`${cellBaseClasses} ${col.align === 'right' ? 'text-right' : 'text-left'} align-middle overflow-hidden`}
                      >
                        <div className="flex h-full items-center min-w-0">
                          {renderCellContent(deal, col.id)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500 flex items-center justify-between">
          <div>
            Showing {Math.min(filteredDeals.length, visibleCount)} of {filteredDeals.length} deals
            {filteredDeals.length > visibleCount && (
              <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                Scroll down to load more
              </span>
            )}
          </div>
          <div>
            {filteredDeals.length > visibleCount && (
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
    </section>
  );
}
