import React, { useState, useEffect, useRef } from 'react';

export default function DealsFilterBar({
  globalSearch,
  setGlobalSearch,
  selectedView,
  setSelectedView,
  selectedStage,
  setSelectedStage,
  selectedOwner,
  setSelectedOwner,
  selectedCountries,
  setSelectedCountries,
  selectedCities,
  setSelectedCities,
  dealNameFilter,
  setDealNameFilter,
  dealSizeRange,
  setDealSizeRange,
  dealSizeSortDirection,
  setDealSizeSortDirection,
  setSortKey,
  setSortDirection,
  stageOptions,
  ownerOptions,
  countryOptions,
  cityOptions,
  activeChips,
  clearAllFilters,
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({
    country: false,
    city: false,
    dealName: false,
    dealSize: false,
  });

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

  const openDropdown = (name) => {
    setDropdownSearch('');
    setActiveDropdown((current) => (current === name ? null : name));
  };

  const filteredDropdownOptions = (options) => {
    return options.filter((option) =>
      option.toLowerCase().includes(dropdownSearch.trim().toLowerCase())
    );
  };

  const toggleSelection = (value, selected, setSelected) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const visibleFilters = {
    country: advancedFilters.country || selectedCountries.length > 0,
    city: advancedFilters.city || selectedCities.length > 0,
    dealName: advancedFilters.dealName || dealNameFilter.trim() !== '',
    dealSize: advancedFilters.dealSize || dealSizeRange.min !== '' || dealSizeRange.max !== '',
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search deals, companies, contacts..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-3 pl-12 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
          />
          <span className="absolute left-4 top-3.5 text-slate-400">🔍</span>
        </div>

        {/* View Switcher */}
        <div className="flex gap-2">
          {['All Deals', 'My Deals', 'Closing soon'].map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setSelectedView(view)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                selectedView === view
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* Stage Filter */}
        <div className="relative" ref={activeDropdown === 'Stage' ? dropdownRef : null}>
          <button
            type="button"
            onClick={() => openDropdown('Stage')}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${
              selectedStage !== 'All' ? 'border-sky-200 bg-sky-50 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <span>{selectedStage === 'All' ? 'Stage' : `Stage: ${selectedStage}`}</span>
            <span className="text-slate-400">▾</span>
          </button>
          {activeDropdown === 'Stage' && (
            <div className="absolute left-0 z-20 mt-2 w-64 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Stage</p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {stageOptions.map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => {
                      setSelectedStage(stage);
                      setActiveDropdown(null);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <span>{stage}</span>
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

        {/* Owner Filter */}
        <div className="relative" ref={activeDropdown === 'Owner' ? dropdownRef : null}>
          <button
            type="button"
            onClick={() => openDropdown('Owner')}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${
              selectedOwner !== 'All Owners' ? 'border-sky-200 bg-sky-50 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <span>{selectedOwner === 'All Owners' ? 'Owner' : `Owner: ${selectedOwner}`}</span>
            <span className="text-slate-400">▾</span>
          </button>
          {activeDropdown === 'Owner' && (
            <div className="absolute left-0 z-20 mt-2 w-64 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Owner</p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {ownerOptions.map((owner) => (
                  <button
                    key={owner}
                    type="button"
                    onClick={() => {
                      setSelectedOwner(owner);
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

        {/* More Filters Toggle */}
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
                    <span>
                      {filter === 'dealName'
                        ? 'Deal Name'
                        : filter === 'dealSize'
                        ? 'Deal Size'
                        : filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </span>
                    <span>{advancedFilters[filter] ? '✓' : ''}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters Drawer */}
      <div className="mt-4 flex flex-wrap gap-2">
        {visibleFilters.country && (
          <div className="relative" ref={activeDropdown === 'Country' ? dropdownRef : null}>
            <button
              type="button"
              onClick={() => openDropdown('Country')}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${
                selectedCountries.length ? 'border-sky-200 bg-sky-50 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
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
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${
                selectedCities.length ? 'border-sky-200 bg-sky-50 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
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
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${
                dealNameFilter ? 'border-sky-200 bg-sky-50 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
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
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${
                dealSizeRange.min || dealSizeRange.max ? 'border-sky-200 bg-sky-50 text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
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
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                        dealSizeSortDirection === option ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
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

      {/* Active Chips */}
      {activeChips.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          {activeChips.map((chip) => (
            <div
              key={chip.key}
              className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
            >
              <span>{chip.label}</span>
              <button type="button" onClick={chip.onRemove} className="text-slate-400 hover:text-slate-700">
                ×
              </button>
            </div>
          ))}
          {activeChips.length > 1 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
