function formatDueDate(dueDate) {
  return new Date(dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  });
}

export default function TaskListCell({ tasks }) {
  if (!tasks || tasks.length === 0) {
    return <span className="text-gray-400">—</span>;
  }

  const upcomingTask = [...tasks].sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))[0];

  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-sm text-blue-600">✓</span>
      <div className="min-w-0">
        <div className="text-sm font-medium text-blue-600">{upcomingTask.label}</div>
        {upcomingTask.dueDate ? (
          <div className="text-xs leading-5 text-gray-500">Due {formatDueDate(upcomingTask.dueDate)}</div>
        ) : (
          <div className="text-xs leading-5 text-gray-500">No due date</div>
        )}
      </div>
    </div>
  );
}
