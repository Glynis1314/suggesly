import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { contactStageOptions } from '../../data/contactsData';
import { accountsRows } from '../../data/accountsData';
import StatCard from '../../components/StatCard';
import EditableCell from '../../components/EditableCell';
import AddContactModal from '../../components/AddContactModal';
import BulkImportModal from '../../components/BulkImportModal';
import { useContacts } from '../../context/ContactsContext';
import { getContactId } from '../../utils/recordIds';
import { useTableColumns } from '../../utils/useTableColumns';

const contactSampleHeaders = [
  'Contact Name',
  'Contact Owner',
  'Associated Company Name',
  'Contact Job Title',
  'Contact Email',
  'Contact Phone Number',
  'Contact LinkedIn',
  'Contact Stage',
  'Contact Country',
  'Contact City',
  'Notes',
  'Next Task',
  'Persona/Department',
  'Last Contacted Date',
];

function FilterIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 4h16l-6 8v6l-4 3V12L4 4z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M15 7h3a5 5 0 0 1 0 10h-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 17H6a5 5 0 0 1 0-10h3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const totalCount = 12482;
const pageSize = 5;

export default function ContactsPage() {
  const { contacts: rows, createContact, importContacts, updateContact } = useContacts();
  const [showAddContact, setShowAddContact] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedOwner, setSelectedOwner] = useState('Me');
  const [selectedCountry, setSelectedCountry] = useState('Any');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const [visibleCount, setVisibleCount] = useState(30);

  const {
    columns,
    dragOverColIndex,
    handleResizeStart,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = useTableColumns([
    { id: 'name', label: 'Contact Name', width: 220 },
    { id: 'company', label: 'Company', width: 140, sortable: true, sortKey: 'company' },
    { id: 'email', label: 'Email', width: 180, sortable: true, sortKey: 'email' },
    { id: 'phone', label: 'Phone Number', width: 140 },
    { id: 'linkedin', label: 'LinkedIn', width: 80 },
    { id: 'location', label: 'Location', width: 140 },
    { id: 'stage', label: 'Stage', width: 120 },
    { id: 'activity', label: 'Last Activity', width: 110, sortable: true, sortKey: 'activity' },
    { id: 'created', label: 'Created Date', width: 110, sortable: true, sortKey: 'created' },
    { id: 'notes', label: 'Notes', width: 240 },
  ]);

  useEffect(() => {
    setVisibleCount(30);
  }, [selectedStage, selectedOwner, selectedCountry, sortKey, sortDirection]);

  const ownerOptions = useMemo(
    () => Array.from(new Set(['Me', ...rows.map((row) => row.owner)])),
    [rows],
  );

  const countryOptions = useMemo(
    () => Array.from(new Set(['Any', ...rows.map((row) => row.country)])),
    [rows],
  );

  const handleSave = (email, field, value) => {
    updateContact(email, { [field]: value });
  };

  const clearFilters = () => {
    setSelectedStage('All');
    setSelectedOwner('Me');
    setSelectedCountry('Any');
    setOpenDropdown(null);
  };

  const renderCellContent = (row, colId) => {
    switch (colId) {
      case 'name':
        return (
          <div className="flex items-center gap-3">
            <Link
              to={`/contacts/${getContactId(row)}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-700 transition hover:bg-emerald-200"
            >
              {row.initials}
            </Link>
            <div className="min-w-0">
              <EditableCell value={row.name} onSave={(v) => handleSave(getContactId(row), 'name', v)} />
            </div>
          </div>
        );
      case 'company':
        return (
          <div className="min-w-0 truncate">
            <EditableCell value={row.company} onSave={(v) => handleSave(getContactId(row), 'company', v)} />
          </div>
        );
      case 'email':
        return (
          <div className="min-w-0 truncate text-teal-600">
            <EditableCell type="email" value={row.email} onSave={(v) => handleSave(getContactId(row), 'email', v)} />
          </div>
        );
      case 'phone':
        return (
          <div className="min-w-0 truncate">
            <EditableCell value={row.phone} onSave={(v) => handleSave(getContactId(row), 'phone', v)} />
          </div>
        );
      case 'linkedin':
        return (
          <a href={`https://www.linkedin.com/in/${row.name.replace(/\s+/g, '-').toLowerCase()}`} target="_blank" rel="noreferrer" className="text-teal-600 hover:text-teal-700">
            <LinkIcon className="h-5 w-5" />
          </a>
        );
      case 'location':
        return (
          <div className="min-w-0 truncate">
            <EditableCell value={row.location} onSave={(v) => handleSave(getContactId(row), 'location', v)} />
          </div>
        );
      case 'stage':
        return (
          <EditableCell type="stage" value={row.stage} options={contactStageOptions} onSave={(v) => handleSave(getContactId(row), 'stage', v)} />
        );
      case 'activity':
        return (
          <div className="text-slate-600">
            <EditableCell type="date" value={row.activity} onSave={(v) => handleSave(getContactId(row), 'activity', v)} />
          </div>
        );
      case 'created':
        return (
          <div className="text-slate-600">
            <EditableCell type="date" value={row.created} onSave={(v) => handleSave(getContactId(row), 'created', v)} />
          </div>
        );
      case 'notes':
        return (
          <div className="min-w-0 truncate italic text-slate-700">
            <EditableCell type="textarea" value={row.notes} onSave={(v) => handleSave(getContactId(row), 'notes', v)} />
          </div>
        );
      default:
        return null;
    }
  };

  const sortedAndFiltered = useMemo(() => {
    const filtered = rows.filter((row) => {
      const stageMatch = selectedStage === 'All' || row.stage === selectedStage;
      const ownerMatch = selectedOwner === 'Me' || row.owner === selectedOwner;
      const countryMatch = selectedCountry === 'Any' || row.country === selectedCountry;
      return stageMatch && ownerMatch && countryMatch;
    });

    if (!sortKey) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const A = (a[sortKey] || '').toString().toLowerCase();
      const B = (b[sortKey] || '').toString().toLowerCase();
      if (A < B) return sortDirection === 'asc' ? -1 : 1;
      if (A > B) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, selectedStage, selectedOwner, selectedCountry, sortKey, sortDirection]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <section className="relative p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Accounts <span className="mx-2">&gt;</span> <span className="font-medium text-slate-800">Contacts</span></p>
          <h1 className="mt-2 text-5xl font-semibold">Contacts</h1>
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
            onClick={() => setShowAddContact(true)}
            className="rounded-xl bg-emerald-700 px-5 py-3 text-xl font-medium text-white transition hover:bg-emerald-800"
          >
            + New Contact
          </button>
        </div>
      </div>

      <AddContactModal
        open={showAddContact}
        onClose={() => setShowAddContact(false)}
        stageOptions={contactStageOptions}
        companyOptions={accountsRows.map((row) => row.company)}
        onCreate={(newContact) => {
          createContact(newContact);
          setShowAddContact(false);
        }}
      />

      <BulkImportModal
        open={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        entityLabel="contact"
        entityLabelPlural="contacts"
        sampleHeaders={contactSampleHeaders}
        requiredFields={['Contact Name', 'Contact Owner', 'Contact Email', 'Contact Stage']}
        onImport={(importedRows) => {
          const mapped = importedRows.map((row) => {
            const name = row['Contact Name'] || '';
            const initials = name
              .trim()
              .split(/\s+/)
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();
            const today = new Date().toISOString().slice(0, 10);
            const displayDate = new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            });
            return {
              name,
              initials: initials || '?',
              company: row['Associated Company Name'] || '',
              email: row['Contact Email'] || '',
              phone: row['Contact Phone Number'] || '',
              location: [row['Contact City'], row['Contact Country']].filter(Boolean).join(', '),
              country: row['Contact Country'] || '',
              city: row['Contact City'] || '',
              owner: row['Contact Owner'] || '',
              jobTitle: row['Contact Job Title'] || '',
              linkedin: row['Contact LinkedIn'] || '',
              stage: row['Contact Stage'] || '',
              activity: displayDate,
              created: displayDate,
              notes: row['Notes'] || '',
              nextTask: row['Next Task'] || '',
              persona: row['Persona/Department'] || '',
              lastContactedDate: row['Last Contacted Date'] || '',
              contactId: `con-import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              createdBy: 'Alex Rivera',
              updatedBy: 'Alex Rivera',
              createdDateSystem: today,
              modifiedDate: today,
            };
          });
          importContacts(mapped);
          setShowBulkImport(false);
        }}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard title="Total Contacts" value="12,482" delta="+4.2%" />
        <StatCard title="Active Leads" value="843" delta="↗" />
        <StatCard title="Qualified Opportunities" value="215" delta="18% Conv." subtle />
        <StatCard title="Revenue Potential" value="$4.2M" subtle />
      </div>

      <div className="mb-6 rounded-2xl border border-slate-300 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600">
              <FilterIcon className="h-4 w-4" />
            </span>
            Filters
          </div>

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
                      className={`w-full rounded-2xl px-3 py-2 text-left text-sm ${selectedStage === option ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

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
                      className={`w-full rounded-2xl px-3 py-2 text-left text-sm ${selectedOwner === option ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

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
              <div className="absolute z-20 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                <div className="space-y-1">
                  {countryOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(option);
                        setOpenDropdown(null);
                      }}
                      className={`w-full rounded-2xl px-3 py-2 text-left text-sm ${selectedCountry === option ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={clearFilters} className="ml-auto text-sm font-semibold text-slate-700 hover:text-slate-900">Clear all filters</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white w-full">
        <div
          className="max-h-[calc(100vh-26rem)] overflow-y-auto overflow-x-hidden w-full"
          onScroll={(e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
            if (scrollHeight - scrollTop - clientHeight < 150) {
              setVisibleCount((prev) => Math.min(prev + 30, sortedAndFiltered.length));
            }
          }}
        >
          <table className="w-full table-fixed">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-gray-100">
                {columns.map((col, index) => (
                  <th
                    key={col.id}
                    style={{ width: `${col.width}px` }}
                    className={`relative px-5 py-4 select-none group border-r border-slate-100 last:border-0 text-left text-xs font-medium uppercase tracking-wide text-gray-500 ${col.sortable ? 'cursor-pointer' : ''
                      } ${dragOverColIndex === index ? 'bg-slate-100 border-l-2 border-l-emerald-500' : ''
                      }`}
                    draggable
                    onDragStart={(e) => handleDragStart(index, e)}
                    onDragOver={(e) => handleDragOver(index, e)}
                    onDrop={(e) => handleDrop(index, e)}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        onClick={() => col.sortable && handleSort(col.sortKey)}
                        className="truncate cursor-grab active:cursor-grabbing font-semibold flex-grow flex items-center gap-1"
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
              {sortedAndFiltered.slice(0, visibleCount).map((row) => (
                <tr key={row.email} className="border-b border-gray-100 align-top hover:bg-slate-50">
                  {columns.map((col) => (
                    <td key={col.id} style={{ width: `${col.width}px` }} className="px-5 py-3 align-middle overflow-hidden">
                      <div className="flex h-full items-center min-w-0">
                        {renderCellContent(row, col.id)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500 flex items-center justify-between">
        <div>
          Showing {Math.min(sortedAndFiltered.length, visibleCount)} of {sortedAndFiltered.length} results
          {sortedAndFiltered.length > visibleCount && (
            <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Scroll down to load more
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {sortedAndFiltered.length > visibleCount && (
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + 50, sortedAndFiltered.length))}
              className="rounded-full bg-slate-100 hover:bg-slate-200 px-4 py-1 text-slate-700 font-medium text-xs transition"
            >
              Load More
            </button>
          )}
        </div>
      </div>

      <button className="fixed bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-700 text-5xl text-white shadow-lg">+</button>
    </section>
  );
}