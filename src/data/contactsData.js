export const contactsRows = [
  { name: 'Alex Smith', initials: 'AS', company: 'Vercel', email: 'alex@vercel.com', phone: '+1 (555) 012-3456', location: 'San Francisco, USA', activity: 'Oct 24, 2023', created: 'Jan 12, 2023', notes: 'Discussed renewal options and sent updated quote.' },
  { name: 'Sarah Johnson', initials: 'SJ', company: 'Acme Corp', email: 's.johnson@acme.co', phone: '+1 (555) 987-6543', location: 'New York, USA', activity: 'Oct 26, 2023', created: 'Sep 05, 2023', notes: 'Requested technical documentation and pricing tier.' },
  { name: 'Marcus Low', initials: 'ML', company: 'Stripe', email: 'm.low@stripe.com', phone: '+44 20 7946 0958', location: 'London, UK', activity: 'Oct 25, 2023', created: 'Oct 20, 2023', notes: 'Inbound from webinar follow-up campaign.' },
  { name: 'Elena Torres', initials: 'ET', company: 'Airbnb', email: 'elena.t@airbnb.com', phone: '+34 91 123 4567', location: 'Madrid, Spain', activity: 'Oct 22, 2023', created: 'Mar 15, 2023', notes: 'Sent case studies, awaiting internal alignment.' },
  { name: 'David Rossi', initials: 'DR', company: 'Ferrari S.p.A.', email: 'd.rossi@ferrari.it', phone: '+39 0536 949111', location: 'Maranello, Italy', activity: 'Oct 10, 2023', created: 'May 12, 2023', notes: 'Chose local vendor after compliance review.' },
];

export const contactStageOptions = [
  'Created',
  'Assigned',
  'Reached Out',
  'Engaged',
  'No Response',
  'Not Interested',
  'Wrong Contact Info',
  'Not the right person',
  'Nurture',
];

export const contactStageClasses = {
  Created: 'bg-slate-100 text-slate-700',
  Assigned: 'bg-emerald-100 text-emerald-700',
  'Reached Out': 'bg-cyan-100 text-cyan-700',
  Engaged: 'bg-emerald-100 text-emerald-700',
  'No Response': 'bg-amber-100 text-amber-700',
  'Not Interested': 'bg-orange-100 text-orange-700',
  'Wrong Contact Info': 'bg-rose-100 text-rose-700',
  'Not the right person': 'bg-red-100 text-red-700',
  Nurture: 'bg-violet-100 text-violet-700',
};
