function formatDisplayDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

export default function DateCell({ date }) {
  return <div className="text-sm font-medium text-gray-900">{formatDisplayDate(date)}</div>;
}
