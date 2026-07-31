import React from 'react';
import PropTypes from 'prop-types';

const priorityStyles = {
  HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  LOW: 'bg-slate-50 text-slate-700 border-slate-200',
  NONE: 'bg-gray-50 text-gray-700 border-gray-200',
};

const badgeBaseClasses = 'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase border';

export default function PriorityBadge({ priority }) {
  if (!priority || priority === 'None') return null;
  const key = priority.toString().toUpperCase();
  return (
    <span className={`${badgeBaseClasses} ${priorityStyles[key] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {priority}
    </span>
  );
}

PriorityBadge.propTypes = {
  priority: PropTypes.string,
};
