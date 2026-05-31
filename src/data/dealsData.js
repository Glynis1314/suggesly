export const dealsRows = [
  { name: 'Acme Corp Renewal', size: '$450,000', owner: 'Jane Smith', source: 'Michael Scott', created: 'Oct 12, 2023', activity: '2 hours ago', task: 'Review Deck', init: 'A', stage: 'POC' },
  { name: 'Enterprise Expansion', size: '$1,200,000', owner: 'Alex Rivera', source: 'Sarah Connor', created: 'Sep 28, 2023', activity: 'Yesterday', task: '-', init: 'E', stage: 'Closed Won' },
  { name: 'Global Logistics Upsell', size: '$85,000', owner: 'Jane Smith', source: 'David Goggins', created: 'Nov 05, 2023', activity: 'Oct 30, 2023', task: 'Follow up call', init: 'G', stage: 'Nurture' },
  { name: 'Starlight Inc Partnership', size: '$25,000', owner: 'Alex Rivera', source: 'Robert Webb', created: 'Nov 14, 2023', activity: 'Today', task: 'Draft MSA', init: 'S', stage: 'Deal Created' },
  { name: 'Vanguard Systems', size: '$190,000', owner: 'Kevin Malone', source: 'Angela Martin', created: 'Oct 01, 2023', activity: 'Oct 15, 2023', task: '-', init: 'V', stage: 'Closed Lost' },
];

export const dealStageOptions = [
  'Deal Created',
  'POC',
  'Proposal',
  'Closed Won',
  'Closed Lost',
  'Nurture',
];

export const dealStageClasses = {
  'Deal Created': 'bg-slate-200 text-slate-700',
  POC: 'bg-emerald-100 text-emerald-700',
  Proposal: 'bg-indigo-100 text-indigo-700',
  'Closed Won': 'bg-emerald-100 text-emerald-700',
  'Closed Lost': 'bg-rose-100 text-rose-700',
  Nurture: 'bg-orange-100 text-orange-700',
};
