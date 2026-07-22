import React from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import CurrencyCell from '../../components/CurrencyCell';
import OwnerAvatar from '../../components/OwnerAvatar';
import StageBadge from '../../components/StageBadge';
import DateCell from '../../components/DateCell';
import TaskListCell from '../../components/TaskListCell';

const cellBaseClasses = 'px-6 py-4 border-r border-slate-100 last:border-0 h-16 min-w-0';
const primaryTextClasses = 'text-sm font-semibold text-slate-800';
const secondaryTextClasses = 'text-xs text-slate-400 font-medium';

const getAvatarClasses = (id) => {
  const themes = [
    'bg-emerald-50 text-emerald-700 border-emerald-100',
    'bg-sky-50 text-sky-700 border-sky-100',
    'bg-indigo-50 text-indigo-700 border-indigo-100',
    'bg-amber-50 text-amber-700 border-amber-100',
  ];
  if (!id) return themes[0];
  const charCodeSum = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return themes[charCodeSum % themes.length];
};

const getDealDisplayName = (name) => {
  return name && name.trim() !== '' ? name : 'Untitled Deal';
};

export default function DealsTable({
  deals,
  columns,
  loading,
  error,
  sortKey,
  sortDirection,
  onSort,
  dragOverColIndex,
  handleResizeStart,
  handleDragStart,
  handleDragOver,
  handleDrop,
  visibleCount,
  loadMore,
  onScroll,
}) {
  const navigate = useNavigate();

  const renderCellContent = (deal, colId) => {
    switch (colId) {
      case 'dealName':
        return (
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${getAvatarClasses(deal.id)}`}>
              {getDealDisplayName(deal.dealName).charAt(0).toUpperCase()}
            </div>
            <div className="flex min-w-0 flex-col">
              <button
                type="button"
                onClick={() => navigate(`/deals/${deal.id}`)}
                className={`${primaryTextClasses} text-left underline-offset-4 transition hover:underline truncate`}
              >
                {getDealDisplayName(deal.dealName)}
              </button>
              <p className={`${secondaryTextClasses} mt-1 block truncate`}>
                {deal.associatedCompany?.company || deal.associatedCompany || '—'}
              </p>
            </div>
          </div>
        );
      case 'dealSize':
        return (
          <div className="flex items-center justify-end w-full">
            <CurrencyCell value={deal.dealSize} />
          </div>
        );
      case 'dealOwner':
        return (
          <div className="flex items-center">
            <OwnerAvatar owner={deal.dealOwner} />
          </div>
        );
      case 'source':
        return (
          <div className="flex items-center">
            <span className="text-sm text-gray-900">{deal.source || deal.dealSourceOwnerName || '—'}</span>
          </div>
        );
      case 'dealStage':
        return (
          <div className="flex items-center">
            <StageBadge stage={deal.dealStage} />
          </div>
        );
      case 'dealCreatedDate':
        return (
          <div className="flex items-center">
            <DateCell date={deal.dealCreatedDate} />
          </div>
        );
      case 'lastActivityDate':
        return (
          <div className="flex items-center">
            <DateCell date={deal.lastActivityDate} />
          </div>
        );
      case 'upcomingTask':
        return (
          <div className="flex items-center">
            <TaskListCell tasks={deal.tasks} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        loading={loading}
        error={error}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={onSort}
        dragOverColIndex={dragOverColIndex}
        handleResizeStart={handleResizeStart}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        emptyMessage="No deals found."
        loadingMessage="Loading deals..."
      >
        {deals.slice(0, visibleCount).map((deal) => (
          <tr key={deal.id} className="border-b border-gray-100 hover:bg-slate-50">
            {columns.map((col) => (
              <td
                key={col.id}
                style={{ width: `${col.width}px` }}
                className={`${cellBaseClasses} ${col.align === 'right' ? 'text-right' : 'text-left'} align-middle overflow-hidden`}
              >
                <div className="flex h-full items-center min-w-0">
                  {renderCellContent(deal, col.id)}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </DataTable>

      {/* Pagination control */}
      <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500 flex items-center justify-between mt-4">
        <div>
          Showing {Math.min(deals.length, visibleCount)} of {deals.length} deals
          {deals.length > visibleCount && (
            <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Scroll down to load more
            </span>
          )}
        </div>
        <div>
          {deals.length > visibleCount && (
            <button
              onClick={loadMore}
              className="rounded-full bg-slate-100 hover:bg-slate-200 px-4 py-1 text-slate-700 font-medium text-xs transition"
            >
              Load More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
