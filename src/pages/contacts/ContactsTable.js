import React from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import EditableCell from '../../components/EditableCell';
import { getContactId } from '../../utils/recordIds';
import { contactStageOptions } from '../../constants/options';



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
  ownerOptions,
  selectedRows,
  setSelectedRows,
}) {
  const handleSave = (id, field, value) => {
    updateContact(id, { [field]: value });
  };

  const toggleRow = (id) => {
    setSelectedRows((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const selectAll = contacts.length > 0 && contacts.every((row) => selectedRows.includes(getContactId(row)));

  const toggleSelectAll = () => {
    if (selectAll) {
      const currentIds = contacts.map((row) => getContactId(row));
      setSelectedRows((current) => current.filter((id) => !currentIds.includes(id)));
    } else {
      const currentIds = contacts.map((row) => getContactId(row));
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
          <EditableCell
            type="linkedin"
            value={row.linkedin}
            onSave={(v) => handleSave(getContactId(row), 'linkedin', v)}
          />
        );
      case 'owner':
        return (
          <EditableCell
            type="owner"
            value={row.owner}
            options={ownerOptions}
            onSave={(v) => handleSave(getContactId(row), 'owner', v)}
          />
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
        emptyMessage="No contacts found."
        loadingMessage="Loading contacts..."
      >
        {contacts.slice(0, visibleCount).map((row) => (
          <tr key={getContactId(row)} className="border-b border-gray-100 hover:bg-slate-50">
            <td className="px-5 py-4 align-middle w-[52px]">
              <div className="flex h-full items-center">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(getContactId(row))}
                  onChange={() => toggleRow(getContactId(row))}
                  className="h-5 w-5 rounded border-slate-300"
                />
              </div>
            </td>
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
            <td className="px-5 py-4 align-middle text-slate-400 w-[72px]">
              <div className="flex h-full items-center">...</div>
            </td>
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
