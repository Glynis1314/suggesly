import PropTypes from 'prop-types';

const stageStyles = {
  ASSIGNED: 'bg-emerald-100 text-emerald-700',
  'REACHED OUT': 'bg-sky-100 text-sky-700',
  ENGAGED: 'bg-yellow-100 text-yellow-700',
  'DEMO BOOKED': 'bg-green-100 text-green-700',
  'DEMO DONE': 'bg-slate-100 text-slate-700',
  NURTURE: 'bg-slate-200 text-slate-700',
  'NOT INTERESTED': 'bg-red-100 text-red-700',
  DROPPED: 'bg-orange-100 text-orange-700',
  'CLOSED WON': 'bg-green-100 text-green-700',
  'CLOSED LOST': 'bg-red-100 text-red-700',
  CUSTOMER: 'bg-blue-100 text-blue-700',
  QUALIFIED: 'bg-green-100 text-green-700',
  LEAD: 'bg-amber-100 text-amber-700',
};

const badgeBaseClasses = 'inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase';

export default function StageBadge({ stage }) {
  const key = stage?.toString().toUpperCase();
  return <span className={`${badgeBaseClasses} ${stageStyles[key] || stageStyles[stage] || 'bg-gray-100 text-gray-700'}`}>{stage}</span>;
}

StageBadge.propTypes = {
  stage: PropTypes.string.isRequired,
};
