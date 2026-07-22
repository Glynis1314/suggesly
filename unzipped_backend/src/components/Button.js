import React from 'react';
import PropTypes from 'prop-types';

export default function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-card disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary: 'bg-brand-600 text-text-inverse hover:bg-brand-700 active:bg-brand-800 focus:ring-brand-500',
    secondary: 'bg-surface-muted text-text-primary hover:bg-surface-hover active:bg-surface-border focus:ring-text-muted',
    outline: 'border border-surface-border bg-surface-card text-text-secondary hover:bg-surface-hover hover:text-text-primary active:bg-surface-muted focus:ring-brand-500',
    ghost: 'text-text-secondary bg-transparent hover:bg-surface-hover hover:text-text-primary active:bg-surface-muted focus:ring-brand-500',
  };

  const sizes = {
    sm: 'rounded-sm px-3 py-1.5 text-xs gap-1.5',
    md: 'rounded-md px-4 py-2.5 text-sm gap-2',
    lg: 'rounded-lg px-5 py-3 text-base gap-2.5',
  };

  const spinnerColors = {
    primary: 'border-text-inverse',
    secondary: 'border-text-primary',
    outline: 'border-brand-600',
    ghost: 'border-brand-600',
  };

  const currentVariantClass = variants[variant] || variants.primary;
  const currentSizeClass = sizes[size] || sizes.md;
  const currentSpinnerColor = spinnerColors[variant] || spinnerColors.primary;

  return (
    <button
      type={type}
      className={`${baseClasses} ${currentVariantClass} ${currentSizeClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className={`h-4 w-4 animate-spin rounded-full border-2 ${currentSpinnerColor} border-t-transparent`} aria-hidden="true" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

