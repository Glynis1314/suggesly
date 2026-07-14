import React from 'react';
import PropTypes from 'prop-types';

export default function StatCard({ title, value, delta, subtle }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-card transition-all duration-200 hover:border-brand-500/30 hover:shadow-card-hover flex flex-col justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{title}</p>
        <p className={`mt-2.5 text-3xl font-extrabold tracking-tight ${subtle ? 'text-text-secondary' : 'text-text-primary'}`}>
          {value}
        </p>
      </div>
      {delta ? (
        <div className="mt-3 flex items-center">
          <span className="inline-flex items-center rounded-full bg-success-light px-2.5 py-0.5 text-xs font-semibold text-success-dark border border-success/15">
            {delta}
          </span>
        </div>
      ) : null}
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  delta: PropTypes.string,
  subtle: PropTypes.bool,
};

