import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrencyCompact } from '../../utils/format';
import { useDeals } from '../../context/DealsContext';
import { useAccounts } from '../../context/AccountsContext';
import { useContacts } from '../../context/ContactsContext';
import AddDealModal from '../../components/AddDealModal';
import { getAccountId } from '../../utils/recordIds';
import { dealStageOptions } from '../../constants/options';
import FunnelChart from '../../components/FunnelChart';

const FUNNEL_STAGE_ORDER = [
  'Deal Created',
  'POC',
  'Proposal',
  'Nurture',
  'Closed Won',
  'Closed Lost',
];

const STAGE_COLORS = {
  'Deal Created': '#818cf8', // light indigo/blue
  'POC': '#6366f1',          // transitioning blue/indigo
  'Proposal': '#4f46e5',     // rich indigo
  'Nurture': '#f59e0b',      // amber/orange
  'Closed Won': '#10b981',   // emerald/green
  'Closed Lost': '#f43f5e',  // rose/red
};

const MEETINGS_STAGE_ORDER = [
  'Reached Out',
  'Engaged',
  'Nurture',
  'Not Interested',
  'Dropped',
  'Demo Booked',
];

const MEETINGS_STAGE_COLORS = {
  'Reached Out': '#0ea5e9',
  'Engaged': '#fde047',
  'Nurture': '#94a3b8',
  'Not Interested': '#ef4444',
  'Dropped': '#fb923c',
  'Demo Booked': '#10b981',
};

function LogMeetingModal({ open, onClose, companyOptions, onCreate }) {
  const [company, setCompany] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [stage, setStage] = useState('Meeting Scheduled');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company) return;
    onCreate({
      company,
      date,
      title,
      notes,
      stage,
    });
    setCompany('');
    setTitle('');
    setNotes('');
    setStage('Meeting Scheduled');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-[fadeInUp_200ms_ease-out]">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Log New Meeting</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Company</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
              required
            >
              <option value="">Select a company</option>
              {companyOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Meeting Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Meeting Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Discovery Call"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Meeting Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
            >
              <option value="Meeting Scheduled">Meeting Scheduled</option>
              <option value="Meeting Completed">Meeting Completed</option>
              <option value="Follow-up Sent">Follow-up Sent</option>
              <option value="Converted to Deal">Converted to Deal</option>
              <option value="No-Show">No-Show</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key discussion points..."
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition shadow-sm"
            >
              Log Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { deals, createDeal, loading: dealsLoading, error: dealsError } = useDeals();
  const { accounts, loading: accountsLoading, error: accountsError } = useAccounts();
  const { contacts, loading: contactsLoading, error: contactsError } = useContacts();

  const [activeTab, setActiveTab] = useState('Deals');
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showLogMeeting, setShowLogMeeting] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  // pre-seed local meetings data for the Meetings tab to feel alive and functional immediately.
  const [localMeetings, setLocalMeetings] = useState([
    {
      company: 'Globex Corp',
      date: '2026-07-10',
      title: 'Initial Discovery Call',
      notes: 'Spoke with CEO about CRM pain points. Very interested in our proposal.',
      stage: 'Meeting Completed',
    },
    {
      company: 'Initech',
      date: '2026-07-12',
      title: 'Demo Presentation',
      notes: 'Presented slide deck and live sandbox. Next step: security review.',
      stage: 'Follow-up Sent',
    },
    {
      company: 'Acme Corp',
      date: '2026-07-11',
      title: 'Intro Call',
      notes: 'Scheduled a follow-up demo for next week.',
      stage: 'Meeting Scheduled',
    },
  ]);

  const handleCreateMeeting = (newMeeting) => {
    setLocalMeetings((prev) => [newMeeting, ...prev]);
  };

  const getCompanyIdByName = (name) => {
    const acc = accounts.find((a) => a.company === name);
    return acc ? getAccountId(acc) : 'unknown';
  };

  // 1. Compute Funnel Data for Deals tab
  const dealsFunnelData = useMemo(() => {
    const counts = {};
    const values = {};

    FUNNEL_STAGE_ORDER.forEach((stage) => {
      counts[stage] = 0;
      values[stage] = 0;
    });

    deals.forEach((deal) => {
      const stage = deal.dealStage;
      if (counts[stage] !== undefined) {
        counts[stage]++;
        values[stage] += Number(deal.dealSize) || 0;
      }
    });

    return FUNNEL_STAGE_ORDER.map((stage) => ({
      label: stage,
      count: counts[stage],
      value: values[stage],
      color: STAGE_COLORS[stage] || '#64748b',
    }));
  }, [deals]);

  // 2. Compute Funnel Data for Meetings tab (using account stage)
  const meetingsFunnelData = useMemo(() => {
    const counts = {};
    const values = {};

    MEETINGS_STAGE_ORDER.forEach((stage) => {
      counts[stage] = 0;
      values[stage] = 0;
    });

    accounts.forEach((account) => {
      const stage = account.stage;
      if (counts[stage] !== undefined) {
        counts[stage]++;
        const companyName = account.company;
        const matchingDeals = deals.filter((d) => {
          const associatedCompanyStr = d.associatedCompany?.company || d.associatedCompany || '';
          return associatedCompanyStr === companyName;
        });
        const dealsSum = matchingDeals.reduce((sum, d) => sum + (Number(d.dealSize) || 0), 0);
        values[stage] += dealsSum;
      }
    });

    return MEETINGS_STAGE_ORDER.map((stage) => ({
      label: stage,
      count: counts[stage],
      value: values[stage],
      color: MEETINGS_STAGE_COLORS[stage] || '#64748b',
    }));
  }, [accounts, deals]);

  const activeFunnelData = activeTab === 'Deals' ? dealsFunnelData : meetingsFunnelData;

  // 3. Fallback stage
  const defaultStage = useMemo(() => {
    let bestStage = activeTab === 'Deals' ? FUNNEL_STAGE_ORDER[0] : MEETINGS_STAGE_ORDER[0];
    let maxCount = -1;
    activeFunnelData.forEach((stage) => {
      if (stage.count > maxCount) {
        maxCount = stage.count;
        bestStage = stage.label;
      }
    });
    return bestStage;
  }, [activeFunnelData, activeTab]);

  const activeStage = selectedStage || defaultStage;

  // 4. Compute right panel accounts based on active stage & tab
  const rightPanelData = useMemo(() => {
    if (activeTab === 'Deals') {
      return deals.filter((d) => d.dealStage === activeStage).map((deal) => {
        const size = Number(deal.dealSize) || 0;
        const lastAct = deal.lastActivityDate ? new Date(deal.lastActivityDate).getTime() : 0;
        const daysSinceLastAct = (Date.now() - lastAct) / 86400000;

        // Heuristic: VALUABLE if ARR >= $150k, STUCK if inactive > 30 days or Closed Lost, HOT otherwise.
        let statusPill = 'HOT';
        let statusColor = 'bg-blue-100 text-blue-700';
        if (deal.dealStage === 'Closed Lost' || daysSinceLastAct > 30) {
          statusPill = 'STUCK';
          statusColor = 'bg-orange-100 text-orange-700';
        } else if (size >= 150000) {
          statusPill = 'VALUABLE';
          statusColor = 'bg-rose-100 text-rose-700';
        }

        let statusLine = deal.nextAction || 'Next step pending';
        if (deal.dealStage === 'Closed Won') {
          statusLine = 'Deal successfully closed';
        } else if (deal.dealStage === 'Closed Lost') {
          statusLine = `Closed Lost: ${deal.lostReason || 'No reason provided'}`;
        } else if (deal.lastActivityDate) {
          statusLine = `Activity: ${new Date(deal.lastActivityDate).toLocaleDateString()}`;
        }

        return {
          id: deal.id,
          company: deal.associatedCompany,
          statusPill,
          statusColor,
          statusLine,
          value: size,
        };
      });
    } else {
      // Meetings tab right panel list
      const qualifyingAccounts = accounts.filter((account) => account.stage === activeStage);
      
      return qualifyingAccounts.map((account) => {
        const companyName = account.company;
        const matchingDeals = deals.filter((d) => {
          const associatedCompanyStr = d.associatedCompany?.company || d.associatedCompany || '';
          return associatedCompanyStr === companyName;
        });
        const totalSize = matchingDeals.reduce((sum, d) => sum + (Number(d.dealSize) || 0), 0);
        
        let statusPill = 'HOT';
        let statusColor = 'bg-blue-100 text-blue-700';
        if (account.stage === 'Not Interested' || account.stage === 'Dropped') {
          statusPill = 'COLD';
          statusColor = 'bg-slate-100 text-slate-700';
        } else if (totalSize >= 150000) {
          statusPill = 'VALUABLE';
          statusColor = 'bg-rose-100 text-rose-700';
        }

        let statusLine = `Stage: ${account.stage}`;
        if (matchingDeals.length > 0) {
          const firstDeal = matchingDeals[0];
          statusLine = firstDeal.nextAction || `Active Deal: ${firstDeal.dealName}`;
        } else if (account.notes) {
          statusLine = account.notes;
        }

        return {
          id: account.id || account._id,
          company: account.company,
          statusPill,
          statusColor,
          statusLine,
          value: totalSize,
        };
      });
    }
  }, [activeTab, activeStage, deals, accounts]);

  // Helpers for company initials & colors
  const getAccountInitialsAndColor = (companyName) => {
    const init = companyName ? companyName.charAt(0).toUpperCase() : 'U';
    const colors = [
      'bg-emerald-100 text-emerald-700',
      'bg-sky-100 text-sky-700',
      'bg-amber-100 text-amber-700',
      'bg-indigo-100 text-indigo-700',
      'bg-rose-100 text-rose-700',
      'bg-slate-100 text-slate-700',
    ];
    const hash = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = colors[hash % colors.length];
    return { init, color };
  };

  // 5. Compute bottom Activity & Health table rows
  const tableRows = useMemo(() => {
    if (activeTab === 'Deals') {
      return [...deals].sort((a, b) => {
        const dateA = a.lastActivityDate ? new Date(a.lastActivityDate).getTime() : 0;
        const dateB = b.lastActivityDate ? new Date(b.lastActivityDate).getTime() : 0;
        return dateB - dateA;
      }).map((deal) => {
        const lastAct = deal.lastActivityDate ? new Date(deal.lastActivityDate).getTime() : 0;
        const daysSinceLastAct = (Date.now() - lastAct) / 86400000;
        const isStuck = deal.dealStage === 'Closed Lost' || daysSinceLastAct > 30;

        return {
          id: deal.id,
          company: deal.associatedCompany,
          health: isStuck ? 'Stuck' : 'Forward',
          remarks: deal.remarks || deal.notes || 'Initial deal staging.',
          nextStep: deal.nextAction || 'Follow-up Call',
          dueDate: deal.nextStepDueDate || deal.nextActionDate || 'TBD',
        };
      });
    } else {
        // Meetings tab table rows
        const manualRows = localMeetings.map((m, idx) => {
          const companyAcc = accounts.find((a) => a.company === m.company);
          const isStuck = companyAcc && ['Not Interested', 'Dropped'].includes(companyAcc.stage);
          return {
            id: `manual-table-${idx}`,
            company: m.company,
            health: isStuck ? 'Stuck' : 'Forward',
            remarks: m.notes || `Discussed ${m.title}.`,
            nextStep: 'Log next communication',
            dueDate: m.date,
          };
        });

      const proxyRows = deals.map((deal) => {
        const lastAct = deal.lastActivityDate ? new Date(deal.lastActivityDate).getTime() : 0;
        const daysSinceLastAct = (Date.now() - lastAct) / 86400000;
        const isStuck = deal.dealStage === 'Closed Lost' || daysSinceLastAct > 30;

        return {
          id: `proxy-table-${deal.id}`,
          company: deal.associatedCompany,
          health: isStuck ? 'Stuck' : 'Forward',
          remarks: deal.remarks || deal.notes || 'Meeting completed with client.',
          nextStep: deal.nextAction || 'Action items follow-up',
          dueDate: deal.nextStepDueDate || deal.nextActionDate || 'TBD',
        };
      });

      return [...manualRows, ...proxyRows].slice(0, 15); // Limit proxy + manual rows
    }
  }, [activeTab, deals, localMeetings, accounts]);

  const totalARRValue = useMemo(() => {
    return activeFunnelData.reduce((sum, item) => sum + item.value, 0);
  }, [activeFunnelData]);

  const isLoading = dealsLoading || accountsLoading || contactsLoading;
  const isError = dealsError || accountsError || contactsError;

  return (
    <section className="space-y-6 w-full">
      {/* 1. Page Header */}
      <div>
        <div className="text-sm text-slate-400">CRM &gt; Funnel View &gt; {activeTab === 'Deals' ? 'Deals Funnel' : 'Meetings Funnel'}</div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-1 mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {activeTab === 'Deals' ? 'Deals Funnel' : 'Meetings Funnel'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === 'Deals'
                ? 'Visualizing your pipeline health and conversion stages.'
                : 'Visualizing your meeting scheduling and completion rates.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-2">
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 13.293A1 1 0 013 12.586V4z" />
              </svg>
              Filters
            </button>
            {activeTab === 'Deals' ? (
              <button
                onClick={() => setShowAddDeal(true)}
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition shadow-sm"
              >
                + Create Deal
              </button>
            ) : (
              <button
                onClick={() => setShowLogMeeting(true)}
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition shadow-sm"
              >
                + Log Meeting
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher - Notion-style segmented pill toggle */}
        <div className="inline-flex rounded-full bg-slate-100 p-1 gap-1">
          {['Deals', 'Meetings'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setSelectedStage(null);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 ${
                activeTab === tab
                  ? 'bg-white shadow-sm text-emerald-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-rose-800 flex items-center gap-3">
          <svg className="h-5 w-5 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="text-sm font-semibold">Couldn&apos;t load live data — showing what&apos;s available.</span>
        </div>
      )}

      {/* 2 & 3. Stages Card (65%) & Stage Details (35%) Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Card: Pipeline Funnel */}
        <div className="lg:col-span-2 h-[520px] max-h-[520px] rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">
                {activeTab === 'Deals' ? 'Sales Pipeline Stages' : 'Meeting Pipeline Stages'}
              </h2>
              <span className="rounded-full bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1">
                ↗ 12% growth vs last month
              </span>
            </div>
            <div className="text-sm text-slate-500 font-medium">
              Total ARR:{' '}
              <span className="text-slate-900 font-semibold">
                {formatCurrencyCompact(totalARRValue, 2)}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex-1 min-h-0 flex flex-col justify-center gap-4 p-4">
              <div className="h-8 bg-slate-100 rounded animate-pulse w-full" />
              <div className="h-10 bg-slate-100 rounded animate-pulse w-5/6 mx-auto" />
              <div className="h-12 bg-slate-100 rounded animate-pulse w-4/5 mx-auto" />
              <div className="h-14 bg-slate-100 rounded animate-pulse w-2/3 mx-auto" />
              <div className="h-16 bg-slate-100 rounded animate-pulse w-1/2 mx-auto" />
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex items-center justify-center p-4">
              <FunnelChart
                data={activeFunnelData}
                selectedStage={activeStage}
                onSelectStage={setSelectedStage}
                splitFinalStage={activeTab === 'Deals'}
              />
            </div>
          )}
        </div>

        {/* Right Card: Stage Details List */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-[520px] max-h-[520px]">
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            <h2 className="text-lg font-bold text-slate-900 sticky top-0 bg-white pb-2 z-10 border-b border-slate-100 shrink-0">
              Accounts in {activeStage}
            </h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              {rightPanelData.length} {rightPanelData.length === 1 ? 'account' : 'accounts'} requiring action
            </p>

            {isLoading ? (
              <div className="space-y-4 mt-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 animate-pulse">
                    <div className="h-9 w-9 bg-slate-200 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-10 shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {rightPanelData.slice(0, 4).map((item) => {
                  const { init, color } = getAccountInitialsAndColor(item.company);
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition bg-slate-50/50 relative"
                    >
                      <div className="flex items-start justify-between gap-3 min-w-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase ${color}`}>
                            {init}
                          </div>
                          <div className="min-w-0 flex flex-col">
                            <Link
                              to={`/accounts/${getCompanyIdByName(item.company)}`}
                              className="text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline truncate block"
                            >
                              {item.company}
                            </Link>
                            <span className="text-[11px] text-slate-500 mt-0.5 truncate block">{item.statusLine}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.statusColor}`}>
                            {item.statusPill}
                          </span>
                          <span className="text-xs font-bold text-slate-700">{formatCurrencyCompact(item.value, 0)}</span>
                        </div>
                      </div>
                      <div className="absolute right-3 bottom-3">
                        <Link
                          to={activeTab === 'Deals' ? `/deals/${item.id}` : `/accounts/${getCompanyIdByName(item.company)}`}
                          className="text-slate-400 hover:text-slate-600 transition block p-1"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {rightPanelData.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <svg className="h-10 w-10 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 4h-2a2 2 0 00-2 2v3m-6-6h-2a2 2 0 00-2 2v3" />
                    </svg>
                    <p className="text-sm font-medium">No accounts in {activeStage}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {rightPanelData.length > 0 && (
            <div className="pt-3 border-t border-slate-100 mt-2 shrink-0">
              <Link
                to={activeTab === 'Deals' ? '/deals' : '/accounts'}
                className="block w-full text-center rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2.5 transition text-sm"
              >
                View all {rightPanelData.length} accounts
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 4. Activity & Health Table (Full Width) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {activeTab === 'Deals' ? 'Deal Activity & Health' : 'Meeting Activity & Health'}
          </h2>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Moving Forward
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" />
              Stuck
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white w-full">
          <div className="max-h-[360px] overflow-y-auto overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px] table-fixed">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/70 backdrop-blur-sm">
                  <th className="px-5 py-4" style={{ width: '22%' }}>Account Name</th>
                  <th className="px-5 py-4" style={{ width: '18%' }}>Health</th>
                  <th className="px-5 py-4" style={{ width: '32%' }}>Remarks</th>
                  <th className="px-5 py-4" style={{ width: '22%' }}>Next Steps</th>
                  <th className="px-5 py-4 text-right" style={{ width: '6%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="border-b border-slate-100 bg-white animate-pulse">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-slate-200 rounded-lg shrink-0" />
                          <div className="h-4 bg-slate-200 rounded w-24" />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-6 bg-slate-200 rounded-full w-28" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 bg-slate-200 rounded w-48" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 bg-slate-200 rounded w-32" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="h-4 bg-slate-200 rounded w-6 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : tableRows.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center text-slate-400">
                      No activity or health details available.
                    </td>
                  </tr>
                ) : (
                  tableRows.map((row) => {
                    const { init, color } = getAccountInitialsAndColor(row.company);
                    return (
                      <tr key={row.id} className="border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors text-sm">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase ${color}`}>
                              {init}
                            </div>
                            <span className="font-bold text-slate-900 truncate">
                              {row.company}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {row.health === 'Forward' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                              Moving forward
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/50">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Deal Stuck
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-600 italic">
                          &ldquo;{row.remarks.length > 55 ? `${row.remarks.slice(0, 52)}...` : row.remarks}&rdquo;
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 truncate">{row.nextStep}</span>
                            <span className="text-xs text-slate-400 mt-0.5">Due {row.dueDate}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button className="text-slate-400 hover:text-slate-700 p-1 font-bold text-lg leading-none rounded">
                            &bull;&bull;&bull;
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddDealModal
        open={showAddDeal}
        onClose={() => setShowAddDeal(false)}
        stageOptions={dealStageOptions}
        companyOptions={accounts.map((row) => row.company)}
        contactOptions={contacts.map((row) => row.name)}
        onCreate={(newDeal) => {
          createDeal(newDeal);
          setShowAddDeal(false);
        }}
      />

      <LogMeetingModal
        open={showLogMeeting}
        onClose={() => setShowLogMeeting(false)}
        companyOptions={accounts.map((row) => row.company)}
        onCreate={handleCreateMeeting}
      />
    </section>
  );
}
