import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAccounts } from '../../context/AccountsContext';
import { useContacts } from '../../context/ContactsContext';
import { useDeals } from '../../context/DealsContext';
import { getAccountId, getContactId } from '../../utils/recordIds';
import { formatDateLocal, formatCurrency } from '../../utils/format';
import EditableCell from '../../components/EditableCell';
import RecordActivityTabs from '../../components/RecordActivityTabs';
import AssociationList from '../../components/AssociationList';
import AISummaryCard from '../../components/AISummaryCard';
import {
  accountStageOptions,
  accountPriorityOptions,
  accountSourceOptions,
  accountEmployeeSizeOptions,
} from '../../data/accountsData';

const ownerOptions = ['Alex Rivera', 'Jane Smith', 'Sarah Jenkins', 'Kevin Malone', 'Michael Chen', 'Olivia Lee'];



export default function CompanyDetailPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { accounts, updateAccount } = useAccounts();
  const { contacts } = useContacts();
  const { deals } = useDeals();

  const account = accounts.find((item) => getAccountId(item) === companyId);

  if (!account) {
    return (
      <section className="p-4 md:p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-2xl font-semibold text-slate-900">Company not found</p>
          <p className="mt-3 text-slate-500">The company you are looking for does not exist.</p>
          <Link to="/accounts" className="mt-6 inline-flex rounded-xl bg-emerald-700 px-6 py-3 text-xl font-semibold text-white">
            Back to companies
          </Link>
        </div>
      </section>
    );
  }

  const accountId = getAccountId(account);
  const save = (field) => (value) => updateAccount(accountId, { [field]: value });

  const associatedContacts = contacts.filter((contact) => contact.company === account.company);
  const associatedDeals = deals.filter((deal) => deal.associatedCompany === account.company);

  const activities = [
    {
      id: 'created',
      title: 'Company Created',
      description: `This company was created${account.owner ? ` and assigned to ${account.owner}` : ''}.`,
      timestamp: account.createdDate,
    },
    {
      id: 'stage',
      title: 'Stage Updated',
      description: `Company is currently in the "${account.stage}" stage.`,
      timestamp: account.lastActivityDate,
    },
  ];

  return (
    <section className="p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/accounts')}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            &larr; Companies
          </button>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">{account.company}</h1>
          {account.site && (
            <a
              href={account.site.startsWith('http') ? account.site : `https://${account.site}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-lg text-teal-600 hover:underline"
            >
              {account.site}
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr_1fr]">
        {/* LEFT: editable details */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Company Details</p>
            <div className="space-y-4">
              <Field label="Company Name">
                <EditableCell value={account.company} onSave={save('company')} />
              </Field>
              <Field label="Owner">
                <EditableCell type="owner" value={account.owner} options={ownerOptions} onSave={save('owner')} />
              </Field>
              <Field label="Source">
                <EditableCell
                  type="multiselect"
                  value={account.source}
                  options={accountSourceOptions}
                  onSave={save('source')}
                />
              </Field>
              <Field label="Priority">
                <EditableCell type="select" value={account.priority} options={accountPriorityOptions} onSave={save('priority')} />
              </Field>
              <Field label="Stage">
                <EditableCell type="stage" value={account.stage} options={accountStageOptions} onSave={save('stage')} />
              </Field>
              <Field label="Next Step">
                <EditableCell value={account.nextSteps} onSave={save('nextSteps')} />
              </Field>
              <Field label="Next Action Date">
                <EditableCell type="date" value={account.nextActionDate} onSave={save('nextActionDate')} />
                <p className="mt-1 text-xs text-slate-400">{formatDateLocal(account.nextActionDate)}</p>
              </Field>
              <Field label="Last Activity Date">
                <EditableCell type="date" value={account.lastActivityDate} onSave={save('lastActivityDate')} />
                <p className="mt-1 text-xs text-slate-400">{formatDateLocal(account.lastActivityDate)}</p>
              </Field>
              <Field label="Country">
                <EditableCell value={account.country} onSave={save('country')} />
              </Field>
              <Field label="City">
                <EditableCell value={account.city} onSave={save('city')} />
              </Field>
              <Field label="Employee Size">
                <EditableCell type="select" value={account.employeeSize} options={accountEmployeeSizeOptions} onSave={save('employeeSize')} />
              </Field>
              <Field label="LinkedIn URL">
                <EditableCell type="linkedin" value={account.linkedin} onSave={save('linkedin')} />
              </Field>
              <Field label="Notes">
                <EditableCell type="textarea" value={account.notes} onSave={save('notes')} />
              </Field>
            </div>
          </div>
        </div>

        {/* MIDDLE: tabs */}
        <div>
          <RecordActivityTabs
            activities={activities}
            initialNotes={
              account.notes
                ? [{ id: 'seed-note', text: account.notes, author: account.owner || 'Unknown', timestamp: account.createdDate }]
                : []
            }
            initialTasks={
              account.nextSteps
                ? [{ id: 'seed-task', label: account.nextSteps, dueDate: account.nextActionDate, done: false }]
                : []
            }
          />
        </div>

        {/* RIGHT: associations + AI summary */}
        <div className="space-y-6">
          <AssociationList
            title="Contacts"
            items={associatedContacts.map((contact) => ({
              href: `/contacts/${getContactId(contact)}`,
              title: contact.name,
              subtitle: contact.email,
            }))}
            emptyLabel="No contacts associated."
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
            summary={`${account.company} is currently in the "${account.stage}" stage${
              account.nextSteps ? `. Next step: ${account.nextSteps}.` : '.'
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
