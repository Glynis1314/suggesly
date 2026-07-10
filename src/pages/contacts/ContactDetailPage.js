import { Link, useNavigate, useParams } from 'react-router-dom';
import { useContacts } from '../../context/ContactsContext';
import { useAccounts } from '../../context/AccountsContext';
import { useDeals } from '../../context/DealsContext';
import { getAccountId, getContactId } from '../../utils/recordIds';
import { formatDateLocal, formatCurrency } from '../../utils/format';
import EditableCell from '../../components/EditableCell';
import RecordActivityTabs from '../../components/RecordActivityTabs';
import AssociationList from '../../components/AssociationList';
import AISummaryCard from '../../components/AISummaryCard';
import { contactStageOptions } from '../../data/contactsData';

const ownerOptions = ['Alex Rivera', 'Jane Smith', 'Sarah Jenkins', 'Kevin Malone', 'Michael Chen', 'Olivia Lee'];
const personaOptions = ['Engineering', 'Marketing', 'Sales'];



export default function ContactDetailPage() {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const { contacts, updateContact } = useContacts();
  const { accounts } = useAccounts();
  const { deals } = useDeals();

  const contact = contacts.find((item) => getContactId(item) === contactId);

  if (!contact) {
    return (
      <section className="p-4 md:p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-2xl font-semibold text-slate-900">Contact not found</p>
          <p className="mt-3 text-slate-500">The contact you are looking for does not exist.</p>
          <Link to="/contacts" className="mt-6 inline-flex rounded-xl bg-emerald-700 px-6 py-3 text-xl font-semibold text-white">
            Back to contacts
          </Link>
        </div>
      </section>
    );
  }

  const currentId = getContactId(contact);
  const save = (field) => (value) => updateContact(currentId, { [field]: value });

  const associatedCompany = accounts.find((account) => account.company === contact.company);
  const associatedDeals = deals.filter((deal) => (deal.associatedContacts || []).includes(contact.name));

  const activities = [
    {
      id: 'created',
      title: 'Contact Created',
      description: `This contact was created${contact.owner ? ` and assigned to ${contact.owner}` : ''}.`,
      timestamp: contact.createdDateSystem || contact.created,
    },
    {
      id: 'stage',
      title: 'Stage Updated',
      description: `Contact is currently in the "${contact.stage}" stage.`,
      timestamp: contact.activity,
    },
  ];

  return (
    <section className="p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/contacts')}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            &larr; Contacts
          </button>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">{contact.name}</h1>
          <p className="mt-2 text-lg text-slate-500">
            {contact.jobTitle ? `${contact.jobTitle} at ${contact.company}` : contact.company}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr_1fr]">
        {/* LEFT: editable details */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Contact Details</p>
            <div className="space-y-4">
              <Field label="Contact Name">
                <EditableCell value={contact.name} onSave={save('name')} />
              </Field>
              <Field label="Contact Owner">
                <EditableCell type="owner" value={contact.owner} options={ownerOptions} onSave={save('owner')} />
              </Field>
              <Field label="Associated Company Name">
                <EditableCell value={contact.company} onSave={save('company')} />
              </Field>
              <Field label="Contact Job Title">
                <EditableCell value={contact.jobTitle} onSave={save('jobTitle')} />
              </Field>
              <Field label="Contact Email">
                <EditableCell type="email" value={contact.email} onSave={save('email')} />
              </Field>
              <Field label="Contact Phone Number">
                <EditableCell value={contact.phone} onSave={save('phone')} />
              </Field>
              <Field label="Contact LinkedIn">
                <EditableCell type="linkedin" value={contact.linkedin} onSave={save('linkedin')} />
              </Field>
              <Field label="Contact Stage">
                <EditableCell type="stage" value={contact.stage} options={contactStageOptions} onSave={save('stage')} />
              </Field>
              <Field label="Contact Country">
                <EditableCell value={contact.country} onSave={save('country')} />
              </Field>
              <Field label="Contact City">
                <EditableCell value={contact.city} onSave={save('city')} />
              </Field>
              <Field label="Persona / Department">
                <EditableCell type="select" value={contact.persona} options={personaOptions} onSave={save('persona')} />
              </Field>
              <Field label="Last Contacted Date">
                <EditableCell type="date" value={contact.lastContactedDate} onSave={save('lastContactedDate')} />
                <p className="mt-1 text-xs text-slate-400">{formatDateLocal(contact.lastContactedDate)}</p>
              </Field>
              <Field label="Next Task">
                <EditableCell value={contact.nextTask} onSave={save('nextTask')} />
              </Field>
              <Field label="Notes">
                <EditableCell type="textarea" value={contact.notes} onSave={save('notes')} />
              </Field>
            </div>
          </div>
        </div>

        {/* MIDDLE: tabs */}
        <div>
          <RecordActivityTabs
            activities={activities}
            initialNotes={
              contact.notes
                ? [{ id: 'seed-note', text: contact.notes, author: contact.owner || 'Unknown', timestamp: contact.createdDateSystem || contact.created }]
                : []
            }
            initialTasks={
              contact.nextTask
                ? [{ id: 'seed-task', label: contact.nextTask, dueDate: '', done: false }]
                : []
            }
          />
        </div>

        {/* RIGHT: associations + AI summary */}
        <div className="space-y-6">
          <AssociationList
            title="Company"
            items={
              associatedCompany
                ? [{ href: `/accounts/${getAccountId(associatedCompany)}`, title: associatedCompany.company, subtitle: associatedCompany.site }]
                : []
            }
            emptyLabel="No company associated."
          />
          <AssociationList
            title="Deals"
            items={associatedDeals.map((deal) => ({
              href: `/deals/${deal.id}`,
              title: deal.dealName,
              subtitle: formatCurrency(deal.dealSize || 0),
            }))}
            emptyLabel="No deals associated."
          />
          <AISummaryCard
            summary={`${contact.name} is currently in the "${contact.stage}" stage${
              contact.nextTask ? `. Next task: ${contact.nextTask}.` : '.'
            }`}
          />
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
