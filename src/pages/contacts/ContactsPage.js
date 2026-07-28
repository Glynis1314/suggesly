import { useMemo, useState } from 'react';
import StatCard from '../../components/StatCard';
import AddContactModal from '../../components/AddContactModal';
import BulkImportModal from '../../components/BulkImportModal';
import { contactStageOptions } from '../../constants/options';
import { useContacts } from '../../context/ContactsContext';
import { useAccounts } from '../../context/AccountsContext';

import { useTableColumns } from '../../utils/useTableColumns';
import { usePagination } from '../../utils/usePagination';
import ContactsFilterBar from './ContactsFilterBar';
import ContactsTable from './ContactsTable';

const contactSampleHeaders = [
  'Contact Name',
  'Associated Company Name',
  'Contact Email',
  'Contact Phone Number',
  'Contact Country',
  'Contact City',
  'Contact Owner',
  'Contact Job Title',
  'Contact LinkedIn',
  'Contact Stage',
  'Notes',
  'Next Task',
  'Persona/Department',
  'Last Contacted Date',
];

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

export default function ContactsPage() {
  const {
    contacts: rawContacts,
    loading: contactsLoading,
    error: contactsError,
    createContact,
    importContacts,
    updateContact,
  } = useContacts();

  const {
    accounts: rawCompanies,
    loading: accountsLoading,
    error: accountsError,
  } = useAccounts();

  const loading = contactsLoading || accountsLoading;
  const error = contactsError || accountsError;

  const [showAddContact, setShowAddContact] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Filters State
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedOwner, setSelectedOwner] = useState('Me');
  const [selectedCountry, setSelectedCountry] = useState('Any');

  // Sorting
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const contacts = useMemo(() => {
    return (rawContacts || []).map((c) => ({
      ...c,
      id: c._id || c.id,
      initials: String(c.name || '?')
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      created: c.createdAt ? formatDate(c.createdAt) : c.created || '',
      activity: c.updatedAt ? formatDate(c.updatedAt) : c.activity || '',
    }));
  }, [rawContacts]);

  const handleCreateContact = async (newContact) => {
    try {
      await createContact(newContact);
    } catch (err) {
      console.error('Failed to create contact:', err);
      const errMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to create contact: ${errMsg}`);
    }
  };

  const handleUpdateContact = async (id, updatedFields) => {
    try {
      await updateContact(id, updatedFields);
    } catch (err) {
      console.error('Failed to update contact:', err);
      const errMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to update contact: ${errMsg}`);
    }
  };

  const handleImportContacts = async (mapped) => {
    try {
      await importContacts(mapped);
    } catch (err) {
      console.error('Failed to import contacts:', err);
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

  const ownerOptions = useMemo(
    () => Array.from(new Set(['Me', ...contacts.map((row) => row.owner).filter(Boolean)])),
    [contacts]
  );

  const countryOptions = useMemo(
    () => Array.from(new Set(['Any', ...contacts.map((row) => row.country).filter(Boolean)])),
    [contacts]
  );

  const clearFilters = () => {
    setSelectedStage('All');
    setSelectedOwner('Me');
    setSelectedCountry('Any');
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedAndFiltered = useMemo(() => {
    const filtered = contacts.filter((row) => {
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
  }, [contacts, selectedStage, selectedOwner, selectedCountry, sortKey, sortDirection]);

  const { visibleCount, loadMore } = usePagination(sortedAndFiltered, [selectedStage, selectedOwner, selectedCountry, sortKey, sortDirection]);

  return (
    <section className="w-full space-y-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Accounts <span className="mx-2">&gt;</span> <span className="font-medium text-slate-800">Contacts</span>
          </p>
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
        companyOptions={rawCompanies.map((row) => row.company)}
        onCreate={(newContact) => {
          handleCreateContact(newContact);
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
            const displayDate = formatDate(new Date());
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
          handleImportContacts(mapped);
          setShowBulkImport(false);
        }}
      />

      {/* Stats Panel */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard title="Total Contacts" value={sortedAndFiltered.length} delta="" />
        <StatCard title="Active Leads" value={sortedAndFiltered.filter(c => c.stage === 'LEAD').length} delta="" />
        <StatCard title="Qualified Opportunities" value={sortedAndFiltered.filter(c => c.stage === 'QUALIFIED').length} delta="" subtle />
        <StatCard title="Customers" value={sortedAndFiltered.filter(c => c.stage === 'CUSTOMER').length} subtle />
      </div>

      {/* Filter Bar */}
      <ContactsFilterBar
        selectedStage={selectedStage}
        setSelectedStage={setSelectedStage}
        selectedOwner={selectedOwner}
        setSelectedOwner={setSelectedOwner}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        contactStageOptions={contactStageOptions}
        ownerOptions={ownerOptions}
        countryOptions={countryOptions}
        clearFilters={clearFilters}
      />

      {/* Contacts Table */}
      <ContactsTable
        contacts={sortedAndFiltered}
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
        updateContact={handleUpdateContact}
      />
    </section>
  );
}