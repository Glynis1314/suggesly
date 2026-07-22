import React, { useRef, useEffect } from 'react';
import FilterPill from '../../components/FilterPill';

function ChevronDownIcon({ className = 'h-3 w-3' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getPropertyLabel(key, propertyOptions) {
  return propertyOptions.find((option) => option.key === key)?.label || key;
}

export default function AccountsFilterBar({
  selectedView,
  setSelectedView,
  showViewDropdown,
  setShowViewDropdown,
  activeFilterChips,
  clearAllFilters,
  showFilterBuilder,
  setShowFilterBuilder,
  filterProperty,
  setFilterProperty,
  filterCondition,
  setFilterCondition,
  filterValue,
  setFilterValue,
  filterValueExtra,
  setFilterValueExtra,
  filters,
  setFilters,
  optionsByProperty,
  propertyOptions,
  conditionOptions,
  filterPropertyType,
}) {
  const viewRef = useRef(null);
  const builderRef = useRef(null);

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
  }, [setShowViewDropdown, setShowFilterBuilder]);

  const addFilter = () => {
    const filterId = `${filterProperty}-${filterCondition}-${Date.now()}`;
    const newFilter = {
      id: filterId,
      property: filterProperty,
      condition: filterCondition,
      value: filterValue,
      valueExtra: filterValueExtra,
    };
    setFilters([...filters, newFilter]);
    setFilterValue('');
    setFilterValueExtra('');
    setShowFilterBuilder(false);
  };

  const removeFilter = (id) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  return (
    <div className="mb-6 rounded-2xl border border-slate-300 bg-white p-5">
      <div className="flex flex-wrap items-center gap-3" ref={viewRef}>
        {/* View Selection */}
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
                {['All Companies', 'My Companies', 'Recently Updated'].map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => {
                      setSelectedView(view);
                      setShowViewDropdown(false);
                    }}
                    className={`w-full rounded-2xl px-4 py-3 text-left text-sm ${
                      selectedView === view ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Chips */}
        <div className="flex flex-wrap gap-2">
          {activeFilterChips.map((chip) => (
            <FilterPill key={chip.key} label={chip.label} onRemove={chip.onRemove} />
          ))}
        </div>

        {/* Filter Actions */}
        <div className="ml-auto flex items-center gap-3">
          {activeFilterChips.length > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="rounded-full text-sm font-semibold text-slate-500 hover:text-slate-900"
            >
              Clear all filters
            </button>
          )}

          {/* Filter Builder Dropdown */}
          <div className="relative" ref={builderRef}>
            <button
              type="button"
              onClick={() => setShowFilterBuilder((current) => !current)}
              className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              More Filters
            </button>
            {showFilterBuilder && (
              <div className="absolute right-0 top-full z-20 mt-3 w-[360px] rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
                <div className="space-y-4">
                  {/* Property */}
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
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400">Condition</label>
                    <select
                      value={filterCondition}
                      onChange={(event) => setFilterCondition(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    >
                      {conditionOptions[filterPropertyType]?.map((cond) => (
                        <option key={cond} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Values */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400">Value</label>
                    {filterPropertyType === 'text' && (
                      <input
                        value={filterValue}
                        onChange={(event) => setFilterValue(event.target.value)}
                        placeholder="Type value..."
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                      />
                    )}

                    {filterPropertyType === 'select' && (
                      <select
                        value={filterValue}
                        onChange={(event) => setFilterValue(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                      >
                        <option value="">Select option...</option>
                        {optionsByProperty[filterProperty]?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {filterPropertyType === 'multiselect' && (
                      <select
                        multiple
                        value={Array.isArray(filterValue) ? filterValue : []}
                        onChange={(event) => {
                          const options = event.target.options;
                          const values = [];
                          for (let i = 0, l = options.length; i < l; i++) {
                            if (options[i].selected) {
                              values.push(options[i].value);
                            }
                          }
                          setFilterValue(values);
                        }}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none h-24"
                      >
                        {optionsByProperty[filterProperty]?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {filterPropertyType === 'date' && (
                      <div className="mt-2 space-y-2">
                        <input
                          type="date"
                          value={filterValue}
                          onChange={(event) => setFilterValue(event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                        />
                        {filterCondition === 'is within' && (
                          <input
                            type="date"
                            value={filterValueExtra}
                            onChange={(event) => setFilterValueExtra(event.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Add Filter Button */}
                  <button
                    type="button"
                    onClick={addFilter}
                    disabled={!filterValue && filterPropertyType !== 'multiselect'}
                    className="w-full rounded-2xl bg-emerald-700 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    Add filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
