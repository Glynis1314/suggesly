import { formatDate } from '../utils/format';

export default function DateCell({ date }) {
  return <div className="text-sm font-medium text-gray-900">{formatDate(date)}</div>;
}
