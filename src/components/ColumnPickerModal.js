import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';

export default function ColumnPickerModal({
  open,
  onClose,
  allColumns = [],
  visibleColumns = [],
  onApply,
}) {
  const [draftColumns, setDraftColumns] = useState([]);
  const [search, setSearch] = useState('');
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  // Sync draftColumns with currently visibleColumns when modal opens
  useEffect(() => {
    if (open) {
      setDraftColumns(visibleColumns);
      setSearch('');
      setDraggedIdx(null);
      setDragOverIdx(null);
    }
  }, [open, visibleColumns]);

  const handleCheckboxChange = (col) => {
    const isChecked = draftColumns.some((c) => c.id === col.id);
    if (isChecked) {
      setDraftColumns((prev) => prev.filter((c) => c.id !== col.id));
    } else {
      setDraftColumns((prev) => [...prev, col]);
    }
  };

  const handleRemove = (colId) => {
    setDraftColumns((prev) => prev.filter((c) => c.id !== colId));
  };

  const handleRemoveAll = () => {
    setDraftColumns([]);
  };

  const handleApply = () => {
    onApply(draftColumns);
    onClose();
  };

  const handleDragStart = (index, e) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (index, e) => {
    e.preventDefault();
    if (draggedIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (index, e) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    setDraftColumns((prev) => {
      const next = [...prev];
      const [draggedCol] = next.splice(draggedIdx, 1);
      next.splice(index, 0, draggedCol);
      return next;
    });

    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const filteredColumns = allColumns.filter((col) =>
    col.label.toLowerCase().includes(search.toLowerCase())
  );

  const footerActions = (
    <div className="flex w-full items-center justify-between">
      <button
        type="button"
        onClick={handleRemoveAll}
        className="text-sm font-semibold text-rose-600 hover:text-rose-800 transition hover:underline focus:outline-none"
      >
        Remove all columns
      </button>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-slate-500/20"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          Apply
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Choose which columns you see"
      actions={footerActions}
      size="lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0 h-[450px]">
        {/* Left pane: Available Properties */}
        <div className="flex flex-col border border-slate-200 rounded-2xl p-4 bg-white min-h-0 h-full">
          <h3 className="font-semibold text-slate-900 mb-2">Available Properties</h3>
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 mb-3 focus:ring-2 focus:ring-emerald-500/20"
          />
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredColumns.length > 0 ? (
              filteredColumns.map((col) => {
                const isChecked = draftColumns.some((c) => c.id === col.id);
                return (
                  <label
                    key={col.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer text-sm text-slate-700 transition"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(col)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500/20"
                    />
                    <span>{col.label}</span>
                  </label>
                );
              })
            ) : (
              <div className="text-slate-400 text-sm py-4 text-center">
                No matching properties
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Selected Columns */}
        <div className="flex flex-col border border-slate-200 rounded-2xl p-4 bg-white min-h-0 h-full">
          <h3 className="font-semibold text-slate-900 mb-2">
            Selected columns ({draftColumns.length})
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {draftColumns.map((col, index) => (
              <div
                key={col.id}
                draggable
                onDragStart={(e) => handleDragStart(index, e)}
                onDragOver={(e) => handleDragOver(index, e)}
                onDrop={(e) => handleDrop(index, e)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border bg-slate-50 text-sm text-slate-700 transition ${
                  draggedIdx === index ? 'opacity-50' : ''
                } ${
                  dragOverIdx === index ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-slate-400 cursor-move select-none shrink-0 font-medium text-lg px-1">
                    ⋮⋮
                  </span>
                  <span className="truncate">{col.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(col.id)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/50 transition shrink-0 text-lg leading-none"
                  aria-label={`Remove ${col.label} column`}
                >
                  &times;
                </button>
              </div>
            ))}
            {draftColumns.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm py-12">
                No columns selected
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

ColumnPickerModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  allColumns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  visibleColumns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onApply: PropTypes.func.isRequired,
};
