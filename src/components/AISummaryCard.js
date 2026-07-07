import { useState } from 'react';

function SparkleIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5c.3 2.6 1 4.4 2.2 5.6 1.2 1.2 3 1.9 5.6 2.2-2.6.3-4.4 1-5.6 2.2-1.2 1.2-1.9 3-2.2 5.6-.3-2.6-1-4.4-2.2-5.6-1.2-1.2-3-1.9-5.6-2.2 2.6-.3 4.4-1 5.6-2.2 1.2-1.2 1.9-3 2.2-5.6Z" />
    </svg>
  );
}

export default function AISummaryCard({ summary, onRegenerate }) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState(summary);

  const handleRegenerate = async () => {
    setLoading(true);
    if (onRegenerate) {
      const next = await onRegenerate();
      if (next) setText(next);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    setLoading(false);
  };

  return (
    <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5">
      <div className="flex items-center gap-2 text-emerald-700">
        <SparkleIcon />
        <p className="text-sm font-semibold uppercase tracking-wide">AI Summary</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{text || 'No notes yet to summarize.'}</p>
      <button
        type="button"
        onClick={handleRegenerate}
        disabled={loading}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
      >
        {loading ? 'Regenerating…' : 'Regenerate Summary'}
      </button>
    </div>
  );
}
