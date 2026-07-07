import { Link } from 'react-router-dom';

export default function AssociationList({ title, items = [], emptyLabel, addHref }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {title} ({items.length})
        </p>
        {addHref && (
          <Link to={addHref} className="text-xs font-semibold text-emerald-700 hover:underline">
            + Add
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">{emptyLabel || 'Nothing associated yet.'}</p>
      ) : (
        <div className="mt-3 space-y-3">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="block rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-emerald-200 hover:bg-emerald-50"
            >
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              {item.subtitle && <p className="mt-0.5 text-xs text-slate-500">{item.subtitle}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
