function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function OwnerAvatar({ owner }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
        {getInitials(owner)}
      </div>
      <span className="text-sm font-medium text-gray-900">{owner}</span>
    </div>
  );
}
