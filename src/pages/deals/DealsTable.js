import React from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import CurrencyCell from '../../components/CurrencyCell';
import DateCell from '../../components/DateCell';
import TaskListCell from '../../components/TaskListCell';
import EditableCell from '../../components/EditableCell';

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
  ownerOptions,
  dealStageOptions,
  updateDeal,
  selectedRows,
  setSelectedRows,
}) {
  const navigate = useNavigate();

  const handleSave = (deal, field, value) => {
    updateDeal({ ...deal, [field]: value });
  };

  const toggleRow = (id) => {
    setSelectedRows((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const selectAll = deals.length > 0 && deals.every((row) => selectedRows.includes(row.id));

  const toggleSelectAll = () => {
    if (selectAll) {
      const currentIds = deals.map((row) => row.id);
      setSelectedRows((current) => current.filter((id) => !currentIds.includes(id)));
    } else {
      const currentIds = deals.map((row) => row.id);
      setSelectedRows((current) => {
        const next = [...current];
        currentIds.forEach((id) => {
          if (!next.includes(id)) {
            next.push(id);
          }
        });
        return next;
      });
    }
  };

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
          <EditableCell
            type="owner"
            value={deal.dealOwner}
            options={ownerOptions}
            onSave={(value) => handleSave(deal, 'dealOwner', value)}
          />
        );
      case 'source':
        return (
          <EditableCell
            type="text"
            value={deal.source || ''}
            onSave={(value) => handleSave(deal, 'source', value)}
          />
        );
      case 'dealStage':
        return (
          <EditableCell
            type="stage"
            value={deal.dealStage}
            options={dealStageOptions}
            onSave={(value) => handleSave(deal, 'dealStage', value)}
          />
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
      case 'notes':
        return (
          <EditableCell
            type="textarea"
            value={deal.notes || ''}
            onSave={(value) => handleSave(deal, 'notes', value)}
          />
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

  const modifiedColumns = [
    {
      id: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={selectAll}
          onChange={toggleSelectAll}
          className="h-5 w-5 rounded border-slate-300 shrink-0"
        />
      ),
      width: 52,
      sortable: false,
    },
    ...columns,
    { id: 'actions', label: 'Actions', width: 72, sortable: false },
  ];

  return (
    <div className="w-full">
      <DataTable
        columns={modifiedColumns}
        loading={loading}
        error={error}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={onSort}
        dragOverColIndex={dragOverColIndex === null ? null : dragOverColIndex + 1}
        handleResizeStart={(idx, e) => {
          if (idx > 0 && idx < modifiedColumns.length - 1) handleResizeStart(idx - 1, e);
        }}
        handleDragStart={(idx, e) => {
          if (idx > 0 && idx < modifiedColumns.length - 1) handleDragStart(idx - 1, e);
        }}
        handleDragOver={(idx, e) => {
          if (idx > 0 && idx < modifiedColumns.length - 1) handleDragOver(idx - 1, e);
        }}
        handleDrop={(idx, e) => {
          if (idx > 0 && idx < modifiedColumns.length - 1) handleDrop(idx - 1, e);
        }}
        emptyMessage="No deals found."
        loadingMessage="Loading deals..."
      >
        {deals.slice(0, visibleCount).map((deal) => (
          <tr key={deal.id} className="border-b border-gray-100 hover:bg-slate-50">
            <td className="px-5 py-4 align-middle w-[52px]">
              <div className="flex h-full items-center">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(deal.id)}
                  onChange={() => toggleRow(deal.id)}
                  className="h-5 w-5 rounded border-slate-300"
                />
              </div>
            </td>
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
            <td className="px-5 py-4 align-middle text-slate-400 w-[72px]">
              <div className="flex h-full items-center">...</div>
            </td>
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
