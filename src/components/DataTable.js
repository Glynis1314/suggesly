import React, { useMemo, useState, useRef, useEffect } from 'react';

const headerCellClasses = 'px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 border-r border-slate-100 last:border-0';

function HeaderMenu({ col, index, sortKey, sortDirection, onSort, onAddColumn, isFrozen, toggleFreeze }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isSortable = col.id !== 'checkbox' && col.id !== 'actions' && col.sortable !== false;
  const sortKeyToUse = col.sortKey || col.id;

  return (
    <div className="relative flex items-center shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 text-left normal-case tracking-normal font-normal"
        >
          {isSortable && (
            <>
              <button
                type="button"
                onClick={() => {
                  onSort && onSort(sortKeyToUse, 'asc');
                  setIsOpen(false);
                }}
                className="flex w-full items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition font-medium"
              >
                Sort ascending
              </button>
              <button
                type="button"
                onClick={() => {
                  onSort && onSort(sortKeyToUse, 'desc');
                  setIsOpen(false);
                }}
                className="flex w-full items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition font-medium"
              >
                Sort descending
              </button>
              <div className="h-px bg-slate-100 my-1" />
            </>
          )}
          <button
            type="button"
            onClick={() => {
              toggleFreeze();
              setIsOpen(false);
            }}
            className="flex w-full items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition font-medium"
          >
            {isFrozen ? 'Unfreeze column' : 'Freeze column'}
          </button>
          <button
            type="button"
            onClick={() => {
              onAddColumn && onAddColumn(index);
              setIsOpen(false);
            }}
            className="flex w-full items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition font-medium"
          >
            Add column
          </button>
        </div>
      )}
    </div>
  );
}

export default function DataTable({
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
  emptyMessage = 'No records found.',
  loadingMessage = 'Loading records...',
  onAddColumn,
  children,
}) {
  const [frozenColumnId, setFrozenColumnId] = useState(null);

  const tableWidth = useMemo(() => {
    return columns.reduce((sum, col) => sum + (col.width || 0), 0);
  }, [columns]);

  const frozenColIndex = columns.findIndex((col) => col.id === frozenColumnId);
  const frozenLeftOffset = useMemo(() => {
    if (frozenColIndex <= 0) return 0;
    let offset = 0;
    for (let i = 0; i < frozenColIndex; i++) {
      offset += columns[i].width || 0;
    }
    return offset;
  }, [columns, frozenColIndex]);

  const styleBlock = useMemo(() => {
    if (!frozenColumnId || frozenColIndex === -1) return null;
    return (
      <style>{`
        .has-frozen-column tr th:nth-child(1),
        .has-frozen-column tr td:nth-child(1) {
          position: sticky !important;
          left: 0 !important;
          z-index: 12 !important;
          background-color: white !important;
        }
        .has-frozen-column thead tr th:nth-child(1) {
          background-color: #f9fafb !important;
          z-index: 22 !important;
        }
        .has-frozen-column tr th:nth-child(${frozenColIndex + 1}),
        .has-frozen-column tr td:nth-child(${frozenColIndex + 1}) {
          position: sticky !important;
          left: ${frozenLeftOffset}px !important;
          z-index: 11 !important;
          background-color: white !important;
          box-shadow: 4px 0 8px -2px rgba(0, 0, 0, 0.1) !important;
        }
        .has-frozen-column thead tr th:nth-child(${frozenColIndex + 1}) {
          background-color: #f9fafb !important;
          z-index: 21 !important;
          box-shadow: 4px 0 8px -2px rgba(0, 0, 0, 0.1) !important;
        }
        .has-frozen-column tr:hover td:nth-child(1),
        .has-frozen-column tr:hover td:nth-child(${frozenColIndex + 1}) {
          background-color: #f8fafc !important;
        }
      `}</style>
    );
  }, [frozenColumnId, frozenColIndex, frozenLeftOffset]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white w-full">
      {styleBlock}
      <div className="max-h-[calc(100vh-26rem)] overflow-y-auto overflow-x-auto w-full">
        <table className={`w-full table-fixed ${frozenColumnId ? 'has-frozen-column' : ''}`} style={{ width: `${tableWidth}px` }}>
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-gray-100">
              {columns.map((col, index) => {
                const isSortable = col.id !== 'checkbox' && col.id !== 'actions' && col.sortable !== false;
                const sortKeyToUse = col.sortKey || col.id;
                return (
                  <th
                    key={col.id}
                    style={{ width: `${col.width}px` }}
                    className={`${headerCellClasses} relative select-none group ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    } ${
                      isSortable ? 'cursor-pointer' : ''
                    } ${
                      dragOverColIndex === index ? 'bg-slate-100 border-l-2 border-l-emerald-500' : ''
                    }`}
                    draggable={col.id !== 'checkbox' && col.id !== 'actions'}
                    onDragStart={(e) => col.id !== 'checkbox' && col.id !== 'actions' && handleDragStart(index, e)}
                    onDragOver={(e) => col.id !== 'checkbox' && col.id !== 'actions' && handleDragOver(index, e)}
                    onDrop={(e) => col.id !== 'checkbox' && col.id !== 'actions' && handleDrop(index, e)}
                  >
                    <div className="flex items-center justify-between min-w-0 w-full relative">
                      {col.id === 'checkbox' || col.id === 'actions' ? (
                        <span className="font-semibold text-slate-500 flex items-center">
                          {col.label}
                        </span>
                      ) : (
                        <div className="flex items-center justify-between w-full min-w-0 gap-1">
                          <span
                            onClick={() => isSortable && onSort && onSort(sortKeyToUse)}
                            className={`truncate cursor-grab active:cursor-grabbing font-semibold flex-grow flex items-center gap-1 ${
                              col.align === 'right' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {col.label}
                            {isSortable && sortKey === sortKeyToUse && (
                              <span className="text-[10px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                            )}
                          </span>
                        <HeaderMenu
                          col={col}
                          index={index}
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                          onSort={onSort}
                          onAddColumn={onAddColumn}
                          isFrozen={frozenColumnId === col.id}
                          toggleFreeze={() => setFrozenColumnId(current => current === col.id ? null : col.id)}
                        />
                      </div>
                    )}
                    <div
                      onMouseDown={(e) => handleResizeStart(index, e)}
                      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100 hover:opacity-100 bg-slate-300 active:bg-emerald-500 transition-opacity"
                      style={{ zIndex: 2 }}
                    />
                  </div>
                </th>
              ); }) }
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="border-b border-slate-200">
                  {columns.map((col) => (
                    <td key={col.id} className="px-5 py-4 align-middle">
                      {col.id === 'checkbox' ? (
                        <div className="h-5 w-5 bg-slate-200 rounded animate-pulse" />
                      ) : col.id === 'actions' ? (
                        <div className="h-4 w-6 bg-slate-200 rounded animate-pulse" />
                      ) : (
                        <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-rose-500 font-medium">
                  {error}
                </td>
              </tr>
            ) : React.Children.count(children) === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 font-medium">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
