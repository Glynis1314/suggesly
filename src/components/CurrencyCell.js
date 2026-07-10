import { formatCurrency } from '../utils/format';

export default function CurrencyCell({ value }) {
  return <span className="text-sm font-medium text-gray-900">{formatCurrency(value)}</span>;
}
