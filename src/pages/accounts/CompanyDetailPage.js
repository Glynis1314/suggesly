import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getContactId } from '../../utils/recordIds';
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
} from '../../constants/options';
import { getCompanyById, updateCompany } from '../../services/companyApi';
import { getContactsByCompany, getContacts } from '../../services/contactApi';
import { getDeals } from '../../services/dealApi';

const ownerOptions = ['Alex Rivera', 'Jane Smith', 'Sarah Jenkins', 'Kevin Malone', 'Michael Chen', 'Olivia Lee'];

export default function CompanyDetailPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [associatedContacts, setAssociatedContacts] = useState([]);
  const [associatedDeals, setAssociatedDeals] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const res = await getCompanyById(companyId);
        if (!isMounted) return;
        
        const companyData = res.data?.data;
        if (!companyData) {
          setAccount(null);
          setLoading(false);
          return;
        }
        
        const mappedCompany = {
          ...companyData,
          id: companyData._id || companyData.id,
          createdDate: companyData.createdAt ? new Date(companyData.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }) : (companyData.createdDate || ''),
        };
        setAccount(mappedCompany);
        setError(null);
        
        // Fetch associated contacts
        try {
          const contactsRes = await getContactsByCompany(companyId);
          if (isMounted) {
            setAssociatedContacts(contactsRes.data?.data || []);
          }
        } catch {
          // Fallback fetch all contacts and filter
          try {
            const contactsRes = await getContacts();
            if (isMounted) {
              const allContacts = contactsRes.data?.data || [];
              const matched = allContacts.filter(c => {
                const compId = c.company?._id || c.company;
                return compId === companyId || compId === companyData.company;
              });
              setAssociatedContacts(matched);
            }
          } catch (e) {
            console.error('Failed to fetch contacts:', e);
          }
        }
        
        // Fetch deals
        try {
          const dealsRes = await getDeals();
          if (isMounted) {
            const allDeals = dealsRes.data?.data || [];
            const matchedDeals = allDeals.filter(d => {
              const compId = d.associatedCompany?._id || d.associatedCompany;
              return compId === companyId || compId === companyData.company;
            });
            setAssociatedDeals(mappedDeals(matchedDeals));
          }
        } catch (e) {
          console.error('Failed to fetch deals:', e);
        }
        
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch company details.');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    const mappedDeals = (dealsList) => dealsList.map(d => ({ ...d, id: d._id || d.id }));
    
    fetchCompanyData();
    return () => { isMounted = false; };
  }, [companyId]);

  if (loading) {
    return (
      <section className="w-full space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-2xl font-semibold text-slate-900">Loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-2xl font-semibold text-rose-500">{error}</p>
          <Link to="/accounts" className="mt-6 inline-flex rounded-xl bg-emerald-700 px-6 py-3 text-xl font-semibold text-white">
            Back to companies
          </Link>
        </div>
      </section>
    );
  }

  if (!account) {
    return (
      <section className="w-full space-y-6">
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

  const save = (field) => async (value) => {
    try {
      const res = await updateCompany(companyId, { [field]: value });
      const updated = res.data?.data;
      if (updated) {
        setAccount({
          ...updated,
          id: updated._id || updated.id,
          createdDate: updated.createdAt ? new Date(updated.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }) : (updated.createdDate || ''),
        });
      }
    } catch (err) {
      console.error('Failed to update company:', err);
      const errMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to update company: ${errMsg}`);
    }
  };

  const activities = [
    {
      id: 'created',
      title: 'Company Created',
      description: `This company was created${account.owner ? ` and assigned to ${account.owner}` : ''}.`,
      timestamp: account.createdAt,
    },
    {
      id: 'stage',
      title: 'Stage Updated',
      description: `Company is currently in the "${account.stage}" stage.`,
      timestamp: account.updatedAt,
    },
  ];

  return (
    <section className="w-full space-y-6">
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
            entityType="company"
            entityId={account._id}
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
