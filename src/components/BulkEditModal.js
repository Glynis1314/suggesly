import React, { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import EditableCell from './EditableCell';

export default function BulkEditModal({
  open,
  onClose,
  ids = [],
  fields = [],
  entityLabel = 'records',
  ownerOptions = [],
  onUpdate,
  lockedProperty = null,
}) {
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [localValue, setLocalValue] = useState('');
  const [loading, setLoading] = useState(false);
  const latestValueRef = useRef('');

  useEffect(() => {
    if (open) {
      if (lockedProperty) {
        setSelectedPropertyId(lockedProperty);
      } else {
        setSelectedPropertyId('');
      }
      setLocalValue('');
      latestValueRef.current = '';
      setLoading(false);
    }
  }, [open, lockedProperty]);

  const propertyGroups = useMemo(() => {
    const groupsMap = {};
    fields.forEach((field) => {
      const gName = field.group || 'Additional Information';
      if (!groupsMap[gName]) {
        groupsMap[gName] = [];
      }
      groupsMap[gName].push(field);
    });
    return Object.entries(groupsMap).map(([label, options]) => ({
      label,
      options,
    }));
  }, [fields]);

  const selectedProperty = useMemo(() => {
    return fields.find((opt) => opt.id === selectedPropertyId) || null;
  }, [fields, selectedPropertyId]);

  const cellOptions = useMemo(() => {
    if (!selectedProperty) return [];
    if (selectedProperty.id === 'owner' || selectedProperty.id === 'dealOwner') return ownerOptions;
    return selectedProperty.options || [];
  }, [selectedProperty, ownerOptions]);

  const handleCellSave = (val) => {
    latestValueRef.current = val;
    setLocalValue(val);
  };

  const handleUpdate = async () => {
    if (!selectedPropertyId || !onUpdate) return;
    setLoading(true);
    try {
      await onUpdate(ids, { [selectedPropertyId]: latestValueRef.current });
      onClose();
    } catch (err) {
      console.error('Bulk update failed:', err);
      alert('Bulk update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const footerActions = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleUpdate}
        disabled={loading || !selectedPropertyId}
        className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? 'Updating...' : 'Update'}
      </button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lockedProperty ? `Assign ${ids.length} ${entityLabel}` : `Bulk edit ${ids.length} ${entityLabel}`}
      actions={footerActions}
      size="sm"
    >
      <div className="space-y-6">
        {/* Step 1: Property Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">
            Property to update
          </label>
          <select
            value={selectedPropertyId}
            onChange={(e) => {
              setSelectedPropertyId(e.target.value);
              setLocalValue('');
              latestValueRef.current = '';
            }}
            disabled={!!lockedProperty || loading}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 disabled:opacity-50 cursor-pointer"
          >
            <option value="">Select a property...</option>
            {propertyGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Step 2: Value Picker (EditableCell Wrapper) */}
        {selectedProperty && (
          <div className="p-4 rounded-3xl border border-slate-100 bg-slate-50/50">
            <label className="block text-sm font-semibold text-slate-600 mb-3">
              New value for {selectedProperty.label}
            </label>
            <div className="w-full">
              <EditableCell
                key={selectedProperty.id}
                type={selectedProperty.type}
                value={localValue}
                options={cellOptions}
                onSave={handleCellSave}
              />
            </div>
            {!loading && (selectedProperty.type === 'text' || selectedProperty.type === 'textarea') && (
              <p className="mt-2 text-xs text-slate-400">
                Click on the cell placeholder or value to edit, then click Update.
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

BulkEditModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  ids: PropTypes.arrayOf(PropTypes.string).isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      group: PropTypes.string,
      type: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  entityLabel: PropTypes.string,
  ownerOptions: PropTypes.arrayOf(PropTypes.string),
  onUpdate: PropTypes.func.isRequired,
  lockedProperty: PropTypes.string,
};
