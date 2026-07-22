import React, { useState, useEffect, useRef } from 'react';

function FilterIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ContactsFilterBar({
  selectedStage,
  setSelectedStage,
  selectedOwner,
  setSelectedOwner,
  selectedCountry,
  setSelectedCountry,
  contactStageOptions,
  ownerOptions,
  countryOptions,
  clearFilters,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    clearFilters();
    setOpenDropdown(null);
  };

  const isFiltered = selectedStage !== 'All' || selectedOwner !== 'Me' || selectedCountry !== 'Any';

  return (
    <div className="mb-6 rounded-2xl border border-slate-300 bg-white p-5">
      <div className="flex flex-wrap items-center gap-3" ref={dropdownRef}>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600">
            <FilterIcon className="h-4 w-4" />
          </span>
          Filters
        </div>

        {/* Stage Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown((current) => (current === 'Stage' ? null : 'Stage'))}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span>Stage: {selectedStage}</span>
            <span className="text-slate-400">▾</span>
          </button>
          {openDropdown === 'Stage' && (
            <div className="absolute z-20 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
              <div className="space-y-1">
                {['All', ...contactStageOptions].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedStage(option);
                      setOpenDropdown(null);
                    }}
                    className={`w-full rounded-2xl px-3 py-2 text-left text-sm ${
                      selectedStage === option ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Owner Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown((current) => (current === 'Owner' ? null : 'Owner'))}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span>Owner: {selectedOwner}</span>
            <span className="text-slate-400">▾</span>
          </button>
          {openDropdown === 'Owner' && (
            <div className="absolute z-20 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
              <div className="space-y-1">
                {ownerOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedOwner(option);
                      setOpenDropdown(null);
                    }}
                    className={`w-full rounded-2xl px-3 py-2 text-left text-sm ${
                      selectedOwner === option ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Country Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown((current) => (current === 'Country' ? null : 'Country'))}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span>Country: {selectedCountry}</span>
            <span className="text-slate-400">▾</span>
          </button>
          {openDropdown === 'Country' && (
            <div className="absolute z-20 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl max-h-64 overflow-y-auto">
              <div className="space-y-1">
                {countryOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(option);
                      setOpenDropdown(null);
                    }}
                    className={`w-full rounded-2xl px-3 py-2 text-left text-sm ${
                      selectedCountry === option ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters button */}
        {isFiltered && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-auto rounded-full text-sm font-semibold text-slate-500 hover:text-slate-900"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
