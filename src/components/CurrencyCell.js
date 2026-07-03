const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function CurrencyCell({ value }) {
  return <span className="text-sm font-medium text-gray-900">{formatter.format(value)}</span>;
}
