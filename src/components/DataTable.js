import React, { useMemo } from 'react';

const headerCellClasses = 'px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 border-r border-slate-100 last:border-0';

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
  children,
}) {
  const tableWidth = useMemo(() => {
    return columns.reduce((sum, col) => sum + (col.width || 0), 0);
  }, [columns]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white w-full">
      <div className="max-h-[calc(100vh-26rem)] overflow-y-auto overflow-x-auto w-full">
        <table className="w-full table-fixed" style={{ width: `${tableWidth}px` }}>
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-gray-100">
              {columns.map((col, index) => (
                <th
                  key={col.id}
                  style={{ width: `${col.width}px` }}
                  className={`${headerCellClasses} relative select-none group ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  } ${
                    col.sortable ? 'cursor-pointer' : ''
                  } ${
                    dragOverColIndex === index ? 'bg-slate-100 border-l-2 border-l-emerald-500' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(index, e)}
                  onDragOver={(e) => handleDragOver(index, e)}
                  onDrop={(e) => handleDrop(index, e)}
                >
                  <div className="flex items-center justify-between">
                    <span
                      onClick={() => col.sortable && onSort && onSort(col.sortKey)}
                      className={`truncate cursor-grab active:cursor-grabbing font-semibold flex-grow flex items-center gap-1 ${
                        col.align === 'right' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {col.label}
                      {col.sortable && sortKey === col.sortKey && (
                        <span className="text-[10px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </span>
                    <div
                      onMouseDown={(e) => handleResizeStart(index, e)}
                      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100 hover:opacity-100 bg-slate-300 active:bg-emerald-500 transition-opacity"
                      style={{ zIndex: 2 }}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 font-medium">
                  {loadingMessage}
                </td>
              </tr>
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
