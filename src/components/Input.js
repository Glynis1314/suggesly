import React from 'react';

export default function Input({
  label,
  error,
  className = '',
  containerClassName = '',
  leftElement,
  rightElement,
  ...props
}) {
  return (
    <div className={containerClassName}>
      {label ? (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      ) : null}
      <div className="relative">
        {leftElement ? <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">{leftElement}</div> : null}
        <input
          className={`w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${leftElement ? 'pl-11' : ''} ${rightElement ? 'pr-11' : ''} ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''} ${className}`}
          {...props}
        />
        {rightElement ? <div className="absolute inset-y-0 right-3 flex items-center">{rightElement}</div> : null}
      </div>
      {error ? <p className="mt-1.5 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
