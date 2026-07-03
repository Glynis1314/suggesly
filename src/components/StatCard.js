export default function StatCard({ title, value, delta, subtle }) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{title}</p>
      <p className={`mt-3 text-5xl font-semibold ${subtle ? 'text-slate-700' : ''}`}>
        {value} {delta ? <span className="text-2xl text-emerald-600">{delta}</span> : null}
      </p>
    </div>
  );
}
