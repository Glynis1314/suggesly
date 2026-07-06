import React from 'react';

export default function Avatar({ src, alt, name, size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const sizeClass = sizes[size] || sizes.md;

  if (src) {
    return <img src={src} alt={alt || name || 'Profile'} className={`${sizeClass} rounded-full object-cover ${className}`} />;
  }

  return (
    <div className={`${sizeClass} flex items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700 ${className}`}>
      {(name || 'U').charAt(0).toUpperCase()}
    </div>
  );
}
