import { useEffect } from 'react';

export default function SlidePanel({ open, title, children, onClose, actions }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="animate-[slideInRight_240ms_ease-out] relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-emerald-700 px-8 py-6">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <button
            type="button"
            className="rounded-full bg-white/10 px-3 py-2 text-xl text-white transition hover:bg-white/20"
            onClick={onClose}
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">{children}</div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-white px-8 py-5">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
