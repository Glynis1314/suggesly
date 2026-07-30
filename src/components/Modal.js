import React from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

export default function Modal({
  open,
  title,
  children,
  onClose,
  actions,
  size = 'md',
}) {
  React.useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };

  const currentSizeClass = sizes[size] || sizes.md;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/40 p-4 backdrop-blur-sm animate-fade-in">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-transparent" onClick={onClose} aria-hidden="true" />
      
      {/* Modal Dialog */}
      <div className={`relative w-full ${currentSizeClass} rounded-3xl border border-surface-border bg-surface-card p-6 shadow-modal transition-all duration-200 transform scale-100 max-h-[90vh] flex flex-col`}>
        <div className="flex items-start justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">{title}</h2>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 text-text-secondary text-sm leading-relaxed flex-1 overflow-y-auto min-h-0 pr-1">{children}</div>

        {actions && (
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-surface-border pt-4 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  actions: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

