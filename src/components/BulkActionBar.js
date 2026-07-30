import React from 'react';
import PropTypes from 'prop-types';
import { User, Pencil, Trash2 } from 'lucide-react';
import Button from './Button';

export default function BulkActionBar({
  selectedCount,
  onClear,
  onAssign,
  onBulkEdit,
  onDelete,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm mb-6 w-full">
      {/* Selected Chip */}
      <div className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
        <span>{selectedCount} selected</span>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="text-sm font-medium text-slate-500 hover:text-slate-700 transition focus:outline-none"
      >
        Clear
      </button>

      <div className="h-5 w-px bg-slate-200 mx-2" />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onAssign}
          className="rounded-full !py-2 !px-4 text-sm font-semibold text-slate-700 border-slate-200 bg-white hover:bg-slate-50"
        >
          <User className="h-4 w-4 text-slate-500" />
          <span>Assign</span>
        </Button>
        <Button
          variant="outline"
          onClick={onBulkEdit}
          className="rounded-full !py-2 !px-4 text-sm font-semibold text-slate-700 border-slate-200 bg-white hover:bg-slate-50"
        >
          <Pencil className="h-4 w-4 text-slate-500" />
          <span>Edit</span>
        </Button>
        <Button
          variant="outline"
          onClick={onDelete}
          className="rounded-full !py-2 !px-4 text-sm font-semibold border-red-200 text-red-600 bg-white hover:bg-red-50 focus:ring-red-500"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
          <span>Delete</span>
        </Button>
      </div>
    </div>
  );
}

BulkActionBar.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  onClear: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
  onBulkEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
