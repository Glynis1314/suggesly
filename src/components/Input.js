import React from 'react';
import PropTypes from 'prop-types';

export default function Input({
  label,
  error,
  id,
  className = '',
  containerClassName = '',
  leftElement,
  rightElement,
  disabled = false,
  ...props
}) {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={`flex flex-col ${containerClassName}`}>
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 text-sm font-semibold text-text-secondary">
          {label}
        </label>
      ) : null}
      <div className="relative rounded-md shadow-sm">
        {leftElement ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
            {leftElement}
          </div>
        ) : null}
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className={`
            block w-full rounded-md border text-sm transition-all duration-150 outline-none px-4 py-2.5
            bg-surface-card text-text-primary placeholder:text-text-muted border-surface-border
            focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
            disabled:bg-surface-muted disabled:text-text-muted disabled:border-surface-border/50 disabled:cursor-not-allowed
            ${leftElement ? 'pl-10' : ''} 
            ${rightElement ? 'pr-10' : ''} 
            ${error ? 'border-error text-error focus:border-error focus:ring-error/20' : ''} 
            ${className}
          `}
          {...props}
        />
        {rightElement ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted">
            {rightElement}
          </div>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-semibold text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  leftElement: PropTypes.node,
  rightElement: PropTypes.node,
  disabled: PropTypes.bool,
};

