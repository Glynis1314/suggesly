import { useState } from 'react';
import PropTypes from 'prop-types';

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
    <div className="rounded-2xl border border-brand-100/80 bg-brand-50/50 p-6 shadow-2xs transition-all duration-150">
      <div className="flex items-center gap-2 text-brand-700">
        <SparkleIcon className="h-4.5 w-4.5" />
        <p className="text-xs font-bold uppercase tracking-wider">AI Summary</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">{text || 'No notes yet to summarize.'}</p>
      <button
        type="button"
        onClick={handleRegenerate}
        disabled={loading}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-surface-card px-3.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 hover:border-brand-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      >
        {loading ? (
          <>
            <span className="h-3 w-3 animate-spin rounded-full border border-brand-700 border-t-transparent" aria-hidden="true" />
            <span>Regenerating…</span>
          </>
        ) : (
          'Regenerate Summary'
        )}
      </button>
    </div>
  );
}

AISummaryCard.propTypes = {
  summary: PropTypes.string,
  onRegenerate: PropTypes.func,
};

