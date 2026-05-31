export const accountsRows = [
  { company: 'Vercel Inc.', site: 'vercel.com', owner: 'Alex Rivera', location: 'USA, San Francisco', source: ['LINKEDIN'], activity: '2 hours ago', created: 'Oct 12, 2023', color: 'bg-emerald-100 text-emerald-700', init: 'V' },
  { company: 'Acme Corp', site: 'acme.co', owner: 'Sarah Jenkins', location: 'UK, London', source: ['EMAIL', 'CAMPAIGN'], activity: '1 day ago', created: 'Nov 05, 2023', color: 'bg-orange-100 text-orange-700', init: 'A' },
  { company: 'Stripe', site: 'stripe.com', owner: 'Alex Rivera', location: 'Ireland, Dublin', source: ['PERSONAL'], activity: '5 mins ago', created: 'Dec 01, 2023', color: 'bg-slate-100 text-slate-700', init: 'S' },
  { company: 'Figma', site: 'figma.com', owner: 'Michael Chen', location: 'USA, New York', source: ['LINKEDIN'], activity: '3 days ago', created: 'Aug 20, 2023', color: 'bg-indigo-100 text-indigo-700', init: 'F' },
  { company: 'Datadog', site: 'datadoghq.com', owner: 'Sarah Jenkins', location: 'Canada, Toronto', source: ['EMAIL', 'CAMPAIGN'], activity: '1 week ago', created: 'Jan 10, 2024', color: 'bg-rose-100 text-rose-700', init: 'D' },
  { company: 'Mailchimp', site: 'mailchimp.com', owner: 'Alex Rivera', location: 'USA, Atlanta', source: ['PERSONALLY SOURCED'], activity: '4 hours ago', created: 'Dec 15, 2023', color: 'bg-amber-100 text-amber-700', init: 'M' },
  { company: 'Shopify', site: 'shopify.com', owner: 'Michael Chen', location: 'Canada, Ottawa', source: ['LINKEDIN'], activity: 'Yesterday', created: 'Oct 02, 2023', color: 'bg-emerald-100 text-emerald-700', init: 'S' },
  { company: 'Atlassian', site: 'atlassian.com', owner: 'Sarah Jenkins', location: 'Australia, Sydney', source: ['EMAIL', 'CAMPAIGN'], activity: '2 weeks ago', created: 'July 18, 2023', color: 'bg-teal-100 text-teal-700', init: 'A' },
  { company: 'HubSpot', site: 'hubspot.com', owner: 'Alex Rivera', location: 'USA, Cambridge', source: ['PERSONALLY SOURCED'], activity: '1 hour ago', created: 'Nov 22, 2023', color: 'bg-orange-100 text-orange-700', init: 'H' },
];

export const accountStageOptions = [
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

export const accountStageClasses = {
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
