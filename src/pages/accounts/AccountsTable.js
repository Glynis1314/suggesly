import React from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import EditableCell from '../../components/EditableCell';
import { getAccountId } from '../../utils/recordIds';
import {
  accountStageOptions,
  accountPriorityOptions,
  accountSourceOptions,
  accountEmployeeSizeOptions,
} from '../../constants/options';

const getInitials = (name) => {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const getColorClass = (name) => {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700',
  ];
  const hash = String(name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function AccountsTable({
  companies,
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
  selectedRows,
  setSelectedRows,
  visibleCount,
  loadMore,
  ownerOptions,
  updateAccount,
}) {
  const handleSave = (id, field, value) => {
    updateAccount(id, { [field]: value });
  };

  const toggleRow = (id) => {
    setSelectedRows((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === companies.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(companies.map((row) => getAccountId(row)));
    }
  };

  const renderCellContent = (row, colId) => {
    switch (colId) {
      case 'company':
        return (
          <div className="flex h-full items-center gap-3 min-w-0">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-xl font-semibold ${getColorClass(row.company)}`}>
              {getInitials(row.company)}
            </div>
            <div className="min-w-0">
              <Link
                to={`/accounts/${getAccountId(row)}`}
                className="text-sm font-semibold text-slate-900 hover:text-emerald-700 hover:underline block truncate"
              >
                {row.company}
              </Link>
              <a
                href={`https://${row.site}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block truncate text-sm text-slate-500 hover:text-slate-700"
              >
                {row.site}
              </a>
            </div>
          </div>
        );
      case 'owner':
        return (
          <EditableCell
            type="owner"
            value={row.owner}
            options={ownerOptions}
            onSave={(value) => handleSave(getAccountId(row), 'owner', value)}
          />
        );
      case 'source':
        return (
          <EditableCell
            type="multiselect"
            value={row.source}
            options={accountSourceOptions}
            onSave={(value) => handleSave(getAccountId(row), 'source', value)}
          />
        );
      case 'priority':
        return (
          <EditableCell
            type="select"
            value={row.priority}
            options={accountPriorityOptions}
            onSave={(value) => handleSave(getAccountId(row), 'priority', value)}
          />
        );
      case 'stage':
        return (
          <EditableCell
            type="stage"
            value={row.stage}
            options={accountStageOptions}
            onSave={(value) => handleSave(getAccountId(row), 'stage', value)}
          />
        );
      case 'notes':
        return (
          <EditableCell
            type="textarea"
            value={row.notes}
            onSave={(value) => handleSave(getAccountId(row), 'notes', value)}
          />
        );
      case 'nextSteps':
        return (
          <EditableCell
            type="text"
            value={row.nextSteps}
            onSave={(value) => handleSave(getAccountId(row), 'nextSteps', value)}
          />
        );
      case 'nextActionDate':
        return (
          <EditableCell
            type="date"
            value={row.nextActionDate}
            onSave={(value) => handleSave(getAccountId(row), 'nextActionDate', value)}
          />
        );
      case 'lastActivityDate':
        return (
          <EditableCell
            type="date"
            value={row.lastActivityDate}
            onSave={(value) => handleSave(getAccountId(row), 'lastActivityDate', value)}
          />
        );
      case 'createdDate':
        return (
          <EditableCell
            type="date"
            value={row.createdDate}
            onSave={(value) => handleSave(getAccountId(row), 'createdDate', value)}
          />
        );
      case 'country':
        return (
          <EditableCell
            type="text"
            value={row.country}
            onSave={(value) => handleSave(getAccountId(row), 'country', value)}
          />
        );
      case 'custom':
        return (
          <EditableCell
            type="text"
            value={row.custom}
            onSave={(value) => handleSave(getAccountId(row), 'custom', value)}
          />
        );
      case 'city':
        return (
          <EditableCell
            type="text"
            value={row.city}
            onSave={(value) => handleSave(getAccountId(row), 'city', value)}
          />
        );
      case 'employeeSize':
        return (
          <EditableCell
            type="select"
            value={row.employeeSize}
            options={accountEmployeeSizeOptions}
            onSave={(value) => handleSave(getAccountId(row), 'employeeSize', value)}
          />
        );
      case 'linkedin':
        return (
          <EditableCell
            type="linkedin"
            value={row.linkedin}
            onSave={(value) => handleSave(getAccountId(row), 'linkedin', value)}
          />
        );
      default:
        return null;
    }
  };

  const modifiedColumns = [
    { id: 'checkbox', label: '', width: 52, sortable: false },
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
        emptyMessage="No companies found."
        loadingMessage="Loading companies..."
      >
        {companies.slice(0, visibleCount).map((row) => (
          <tr key={getAccountId(row)} className="border-b border-slate-200 bg-white hover:bg-slate-50">
            <td className="px-5 py-4 align-middle w-[52px]">
              <div className="flex h-full items-center">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(getAccountId(row))}
                  onChange={() => toggleRow(getAccountId(row))}
                  className="h-5 w-5 rounded border-slate-300"
                />
              </div>
            </td>
            {columns.map((col) => (
              <td key={col.id} style={{ width: `${col.width}px` }} className="px-5 py-4 align-middle overflow-hidden">
                <div className="flex h-full items-center min-w-0 truncate">
                  {renderCellContent(row, col.id)}
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
      <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500 flex items-center justify-between mt-4">
        <div>
          Showing {Math.min(companies.length, visibleCount)} of {companies.length} results
          {companies.length > visibleCount && (
            <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Scroll down to load more
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {companies.length > visibleCount && (
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
