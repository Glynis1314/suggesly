import React from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import EditableCell from '../../components/EditableCell';
import { getContactId } from '../../utils/recordIds';
import { contactStageOptions } from '../../constants/options';

function LinkIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M15 7h3a5 5 0 0 1 0 10h-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 17H6a5 5 0 0 1 0-10h3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ContactsTable({
  contacts,
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
  updateContact,
}) {
  const handleSave = (id, field, value) => {
    updateContact(id, { [field]: value });
  };

  const renderCellContent = (row, colId) => {
    switch (colId) {
      case 'name':
        return (
          <div className="flex items-center gap-3">
            <Link
              to={`/contacts/${getContactId(row)}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-700 transition hover:bg-emerald-200"
            >
              {row.initials}
            </Link>
            <div className="min-w-0">
              <EditableCell value={row.name} onSave={(v) => handleSave(getContactId(row), 'name', v)} />
            </div>
          </div>
        );
      case 'company':
        return (
          <div className="min-w-0 truncate">
            <EditableCell value={row.company} onSave={(v) => handleSave(getContactId(row), 'company', v)} />
          </div>
        );
      case 'email':
        return (
          <div className="min-w-0 truncate text-teal-600">
            <EditableCell type="email" value={row.email} onSave={(v) => handleSave(getContactId(row), 'email', v)} />
          </div>
        );
      case 'phone':
        return (
          <div className="min-w-0 truncate">
            <EditableCell value={row.phone} onSave={(v) => handleSave(getContactId(row), 'phone', v)} />
          </div>
        );
      case 'linkedin':
        return (
          <a
            href={`https://www.linkedin.com/in/${row.name.replace(/\s+/g, '-').toLowerCase()}`}
            target="_blank"
            rel="noreferrer"
            className="text-teal-600 hover:text-teal-700"
          >
            <LinkIcon className="h-5 w-5" />
          </a>
        );
      case 'location':
        return (
          <div className="min-w-0 truncate">
            <EditableCell value={row.location} onSave={(v) => handleSave(getContactId(row), 'location', v)} />
          </div>
        );
      case 'stage':
        return (
          <EditableCell
            type="stage"
            value={row.stage}
            options={contactStageOptions}
            onSave={(v) => handleSave(getContactId(row), 'stage', v)}
          />
        );
      case 'activity':
        return (
          <div className="text-slate-600">
            <EditableCell type="date" value={row.activity} onSave={(v) => handleSave(getContactId(row), 'activity', v)} />
          </div>
        );
      case 'created':
        return (
          <div className="text-slate-600">
            <EditableCell type="date" value={row.created} onSave={(v) => handleSave(getContactId(row), 'created', v)} />
          </div>
        );
      case 'notes':
        return (
          <div className="min-w-0 truncate italic text-slate-700">
            <EditableCell type="textarea" value={row.notes} onSave={(v) => handleSave(getContactId(row), 'notes', v)} />
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
        emptyMessage="No contacts found."
        loadingMessage="Loading contacts..."
      >
        {contacts.slice(0, visibleCount).map((row) => (
          <tr key={getContactId(row)} className="border-b border-gray-100 hover:bg-slate-50">
            {columns.map((col) => (
              <td
                key={col.id}
                style={{ width: `${col.width}px` }}
                className="px-5 py-4 align-middle overflow-hidden"
              >
                <div className="flex h-full items-center min-w-0">
                  {renderCellContent(row, col.id)}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </DataTable>

      {/* Pagination control */}
      <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500 flex items-center justify-between mt-4">
        <div>
          Showing {Math.min(contacts.length, visibleCount)} of {contacts.length} contacts
          {contacts.length > visibleCount && (
            <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Scroll down to load more
            </span>
          )}
        </div>
        <div>
          {contacts.length > visibleCount && (
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
