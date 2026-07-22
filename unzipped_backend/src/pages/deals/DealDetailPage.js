import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDeals } from '../../context/DealsContext';
import { useAccounts } from '../../context/AccountsContext';
import { useContacts } from '../../context/ContactsContext';
import { getAccountId, getContactId } from '../../utils/recordIds';
import { formatDateLocal, formatCurrency } from '../../utils/format';
import EditableCell from '../../components/EditableCell';
import RecordActivityTabs from '../../components/RecordActivityTabs';
import AssociationList from '../../components/AssociationList';
import AISummaryCard from '../../components/AISummaryCard';
import { dealStageOptions } from '../../data/dealsData';

const ownerOptions = ['Alex Rivera', 'Jane Smith', 'Sarah Jenkins', 'Kevin Malone', 'Michael Chen', 'Olivia Lee'];



export default function DealDetailPage() {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deals, updateDeal } = useDeals();
  const { accounts } = useAccounts();
  const { contacts } = useContacts();
  const deal = deals.find((item) => item.id === dealId);

  if (!deal) {
    return (
      <section className="w-full space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-2xl font-semibold text-slate-900">Deal not found</p>
          <p className="mt-3 text-slate-500">The deal you are looking for does not exist.</p>
          <Link to="/deals" className="mt-6 inline-flex rounded-xl bg-emerald-700 px-6 py-3 text-xl font-semibold text-white">
            Back to deals
          </Link>
        </div>
      </section>
    );
  }

  const save = (field) => (value) => updateDeal(deal.id, { [field]: value });

  const associatedCompany = accounts.find((account) => account.company === deal.associatedCompany);
  const associatedContacts = contacts.filter((contact) =>
    (deal.associatedContacts || []).includes(contact.name),
  );

  const activities = [
    {
      id: 'created',
      title: 'Deal Created',
      description: `This deal was created${deal.dealOwner ? ` by ${deal.dealOwner}` : ''}.`,
      timestamp: deal.dealCreatedDate,
    },
    {
      id: 'stage',
      title: 'Stage Updated',
      description: `Deal is currently in the "${deal.dealStage}" stage.`,
      timestamp: deal.lastActivityDate,
    },
  ];

  return (
    <section className="w-full space-y-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/deals')}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            &larr; Deals
          </button>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">{deal.dealName}</h1>
          <p className="mt-2 text-lg text-slate-500">{deal.associatedCompany}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr_1fr]">
        {/* LEFT: editable details */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Deal Details</p>
            <div className="space-y-4">
              <Field label="Deal Name">
                <EditableCell value={deal.dealName} onSave={save('dealName')} />
              </Field>
              <Field label="Deal Value">
                <EditableCell
                  value={String(deal.dealSize)}
                  onSave={(value) => updateDeal(deal.id, { dealSize: Number(value) || 0 })}
                />
                <p className="mt-1 text-xs text-slate-400">{formatCurrency(deal.dealSize)}</p>
              </Field>
              <Field label="Deal Owner">
                <EditableCell type="owner" value={deal.dealOwner} options={ownerOptions} onSave={save('dealOwner')} />
              </Field>
              <Field label="Deal Stage">
                <EditableCell type="stage" value={deal.dealStage} options={dealStageOptions} onSave={save('dealStage')} />
              </Field>
              <Field label="Deal Source">
                <EditableCell value={deal.source} onSave={save('source')} />
              </Field>
              <Field label="Expected Close Date">
                <EditableCell type="date" value={deal.expectedCloseDate} onSave={save('expectedCloseDate')} />
                <p className="mt-1 text-xs text-slate-400">{formatDateLocal(deal.expectedCloseDate)}</p>
              </Field>
              <Field label="Next Step">
                <EditableCell value={deal.nextAction} onSave={save('nextAction')} />
              </Field>
              <Field label="Next Step Due Date">
                <EditableCell type="date" value={deal.nextStepDueDate} onSave={save('nextStepDueDate')} />
                <p className="mt-1 text-xs text-slate-400">{formatDateLocal(deal.nextStepDueDate)}</p>
              </Field>
              {deal.dealStage === 'Closed Lost' && (
                <Field label="Lost Reason">
                  <EditableCell type="textarea" value={deal.lostReason} onSave={save('lostReason')} />
                </Field>
              )}
              {deal.dealStage === 'Closed Won' && (
                <Field label="Won Reason">
                  <EditableCell type="textarea" value={deal.wonReason} onSave={save('wonReason')} />
                </Field>
              )}
              <Field label="Deal Notes">
                <EditableCell type="textarea" value={deal.remarks} onSave={save('remarks')} />
              </Field>
            </div>
          </div>
        </div>

        {/* MIDDLE: tabs */}
        <div>
          <RecordActivityTabs
            activities={activities}
            initialNotes={
              deal.remarks
                ? [{ id: 'seed-note', text: deal.remarks, author: deal.dealOwner || 'Unknown', timestamp: deal.dealCreatedDate }]
                : []
            }
            initialTasks={
              deal.nextAction
                ? [{ id: 'seed-task', label: deal.nextAction, dueDate: deal.nextStepDueDate, done: false }]
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
            title="Contacts"
            items={associatedContacts.map((contact) => ({
              href: `/contacts/${getContactId(contact)}`,
              title: contact.name,
              subtitle: contact.email,
            }))}
            emptyLabel="No contacts associated."
          />
          <AISummaryCard
            summary={`This deal is worth ${formatCurrency(deal.dealSize)} and is currently in the "${deal.dealStage}" stage. ${
              deal.nextAction ? `Next step: ${deal.nextAction}.` : ''
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