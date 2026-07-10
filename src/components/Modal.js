import PropTypes from 'prop-types';

export default function Modal({ open, title, children, onClose, actions }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
          </div>
          <button
            type="button"
            className="rounded-full bg-slate-100 px-3 py-2 text-xl text-slate-500 transition hover:bg-slate-200"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="mt-6">{children}</div>

        {actions && (
          <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
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
};
