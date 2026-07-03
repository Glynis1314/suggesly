import { useState } from 'react';

const propertyOptions = [
  { key: 'name', label: 'Contact Name', type: 'text' },
  { key: 'company', label: 'Company', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'stage', label: 'Stage', type: 'select' },
  { key: 'location', label: 'Location', type: 'text' },
];

export default function FilterPanel({ stageOptions = [], onAddFilter, onClose }) {
  const [property, setProperty] = useState(propertyOptions[0].key);
  const [condition, setCondition] = useState('contains');
  const [value, setValue] = useState('');

  const prop = propertyOptions.find((p) => p.key === property);

  return (
    <div className="w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Add filter</div>
        <button onClick={onClose} className="text-slate-400">✕</button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-slate-500">Property</label>
          <select value={property} onChange={(e) => setProperty(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
            {propertyOptions.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500">Condition</label>
          <select value={condition} onChange={(e) => setCondition(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
            <option value="contains">contains</option>
            <option value="is">is</option>
            <option value="isNot">is not</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500">Value</label>
          {prop.type === 'select' ? (
            <select value={value} onChange={(e) => setValue(e.target.value)} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
              <option value="">(any)</option>
              {stageOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none" />
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={() => { onAddFilter({ property, condition, value }); setValue(''); }} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Add</button>
          <button onClick={onClose} className="rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
        </div>
      </div>
    </div>
  );
}
