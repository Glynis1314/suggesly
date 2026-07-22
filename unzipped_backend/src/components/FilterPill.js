export default function FilterPill({ label, onRemove }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
      <span>{label}</span>
      {onRemove ? (
        <button type="button" onClick={onRemove} className="text-slate-400 hover:text-slate-700">×</button>
      ) : null}
    </div>
  );
}
