import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrencyCompact } from '../../utils/format';
import { useDeals } from '../../context/DealsContext';
import { useAccounts } from '../../context/AccountsContext';
import { useContacts } from '../../context/ContactsContext';
import Avatar from '../../components/Avatar';
import StageBadge from '../../components/StageBadge';
import AddDealModal from '../../components/AddDealModal';
import { getAccountId } from '../../utils/recordIds';
import { dealStageOptions } from '../../data/dealsData';
import FunnelChart from '../../components/FunnelChart';

const FUNNEL_STAGE_ORDER = [
  'Deal Created',
  'POC',
  'Proposal',
  'Nurture',
  'Closed Lost',
  'Closed Won',
];

const STAGE_COLORS = {
  'Deal Created': '#818cf8', // light indigo/blue
  'POC': '#6366f1',          // transitioning blue/indigo
  'Proposal': '#4f46e5',     // rich indigo
  'Nurture': '#f59e0b',      // amber/orange
  'Closed Lost': '#f43f5e',  // rose
  'Closed Won': '#10b981',   // emerald/green
};

export default function DashboardPage() {
  const { deals, createDeal } = useDeals();
  const { accounts } = useAccounts();
  const { contacts } = useContacts();

  const [showAddDeal, setShowAddDeal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // 1. Overall Pipeline Statistics (Total ARR, Total Accounts/Deals)
  const totalStats = useMemo(() => {
    const totalARR = deals.reduce((sum, d) => sum + (Number(d.dealSize) || 0), 0);
    return {
      totalARR,
      totalAccounts: deals.length,
    };
  }, [deals]);

  // 2. Compute live funnel data for FunnelChart component
  const funnelData = useMemo(() => {
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

  // 3. Fallback stage (stage with most deals, or first stage in order)
  const defaultStage = useMemo(() => {
    let bestStage = FUNNEL_STAGE_ORDER[0];
    let maxCount = -1;

    funnelData.forEach((stage) => {
      if (stage.count > maxCount) {
        maxCount = stage.count;
        bestStage = stage.label;
      }
    });

    return bestStage;
  }, [funnelData]);

  const activeStage = selectedStage || defaultStage;

  // 4. Deals in active stage
  const dealsInActiveStage = useMemo(() => {
    return deals.filter((d) => d.dealStage === activeStage);
  }, [deals, activeStage]);

  // 5. Paginated Accounts sorted by lastActivityDate descending
  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      const dateA = a.lastActivityDate ? new Date(a.lastActivityDate).getTime() : 0;
      const dateB = b.lastActivityDate ? new Date(b.lastActivityDate).getTime() : 0;
      return dateB - dateA;
    });
  }, [accounts]);

  const totalPages = Math.ceil(sortedAccounts.length / pageSize);
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAccounts.slice(start, start + pageSize);
  }, [sortedAccounts, currentPage]);

  // Ensure current page is valid when accounts list updates
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Helper to format currency values
  const formatTotalARR = (value) => formatCurrencyCompact(value, 2);
  const formatDealSizeCompact = (value) => formatCurrencyCompact(value, 0);

  // Helper to generate initials & color for company avatars
  const getAccountInitialsAndColor = (account) => {
    const companyName = account.company || 'U';
    const init = account.init || companyName.charAt(0).toUpperCase();
    const colors = [
      'bg-emerald-100 text-emerald-700',
      'bg-sky-100 text-sky-700',
      'bg-amber-100 text-amber-700',
      'bg-indigo-100 text-indigo-700',
      'bg-rose-100 text-rose-700',
      'bg-slate-100 text-slate-700',
    ];
    const hash = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = account.color || colors[hash % colors.length];
    return { init, color };
  };

  // Helper for owner avatars and formatted names
  const getOwnerInitials = (ownerName) => {
    if (!ownerName) return '??';
    return ownerName
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  };

  const getOwnerFormattedName = (ownerName) => {
    if (!ownerName) return '—';
    const parts = ownerName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
  };

  // Helper to generate a relative time string
  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      if (diffMins <= 0) return 'Just now';
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 max-h-[calc(100vh-5rem)] overflow-y-auto w-full">
      {/* 1. Page Header */}
      <div>
        <div className="text-sm text-slate-400">CRM &gt; Funnel View &gt; Deals Funnel</div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Deals Funnel View</h1>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm">
              Filters
            </button>
            <button
              onClick={() => setShowAddDeal(true)}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition shadow-sm"
            >
              + New Deal
            </button>
          </div>
        </div>
      </div>

      {/* 2 & 3. Conversion Funnel & Stage Details Panel Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Conversion Funnel Card */}
        <div className="lg:col-span-2 h-[520px] max-h-[520px] rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h2 className="text-lg font-bold text-slate-900">Sales Funnel</h2>
            <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
              <span>
                Total ARR:{' '}
                <span className="text-slate-900 font-semibold">
                  {formatTotalARR(totalStats.totalARR)}
                </span>
              </span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
              <span>
                Total Accounts:{' '}
                <span className="text-slate-900 font-semibold">
                  {totalStats.totalAccounts}
                </span>
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center">
            <FunnelChart
              data={funnelData}
              selectedStage={activeStage}
              onSelectStage={setSelectedStage}
            />
          </div>
        </div>

        {/* Right: Stage Detail Panel */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-[520px] max-h-[520px]">
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            <h2 className="text-lg font-bold text-slate-900 mb-6 sticky top-0 bg-white pb-2 z-10 border-b border-slate-100 shrink-0">
              {activeStage} ({dealsInActiveStage.length})
            </h2>

            <div className="space-y-3">
              {dealsInActiveStage.slice(0, 6).map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between py-3 px-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition bg-slate-50/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      name={deal.associatedCompany}
                      size="sm"
                      className="bg-emerald-100 text-emerald-700 font-semibold shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {deal.associatedCompany}
                      </p>
                      <p className="text-sm font-semibold text-emerald-600 mt-0.5">
                        {formatDealSizeCompact(deal.dealSize)} ARR
                      </p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 p-1 font-bold text-lg leading-none rounded">
                    ...
                  </button>
                </div>
              ))}

              {dealsInActiveStage.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <svg className="h-10 w-10 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 4h-2a2 2 0 00-2 2v3m-6-6h-2a2 2 0 00-2 2v3" />
                  </svg>
                  <p className="text-sm font-medium">No deals in {activeStage}</p>
                </div>
              )}
            </div>
          </div>

          {dealsInActiveStage.length > 6 && (
            <div className="pt-4 border-t border-slate-100 mt-4 text-center shrink-0">
              <Link
                to="/deals"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                View All {dealsInActiveStage.length} in {activeStage}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 4. Recent Company/Account Activity Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition" title="Export">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition">
              <span className="font-bold text-lg leading-none">...</span>
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/50">
                  <th className="px-5 py-4">Account Name</th>
                  <th className="px-5 py-4">Owner</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Stage</th>
                  <th className="px-5 py-4">Last Activity</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAccounts.map((account) => {
                  const { init, color } = getAccountInitialsAndColor(account);
                  return (
                    <tr key={getAccountId(account)} className="border-b border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold uppercase ${color}`}>
                            {init}
                          </div>
                          <span className="font-bold text-slate-900 truncate">
                            {account.company}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                            {getOwnerInitials(account.owner)}
                          </div>
                          <span className="text-slate-700 font-medium truncate">
                            {getOwnerFormattedName(account.owner)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {account.city && account.country
                          ? `${account.city}, ${account.country}`
                          : account.city || account.country || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <StageBadge stage={account.stage} />
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {formatRelativeTime(account.lastActivityDate)}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          to={`/accounts/${getAccountId(account)}`}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(sortedAccounts.length, (currentPage - 1) * pageSize + 1)}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(sortedAccounts.length, currentPage * pageSize)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-800">{sortedAccounts.length}</span>{' '}
            companies
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-700 font-semibold transition"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-700 font-semibold transition"
            >
              Next
            </button>
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
    </section>
  );
}
