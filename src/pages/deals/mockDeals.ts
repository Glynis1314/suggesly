export interface Deal {
  id: string;
  dealName: string;
  dealSize: number;
  dealOwner: string;
  dealSourceOwner: string;
  dealStage: 'Deal Created' | 'POC' | 'Proposal' | 'Closed Won' | 'Closed Lost' | 'Nurture';
  dealCreatedDate: string;
  lastActivityDate: string;
  remarks: string;
  associatedCompany: string;
  primaryContact: string;
  expectedCloseDate: string;
  dealProbability: number;
  dealSourceOwnerName: string;
  lostReason: string;
  nextAction: string;
  country: string;
  city: string;
  source: string;
}

export const mockDeals: Deal[] = [
  {
    id: 'acme-corp-renewal-1',
    dealName: 'Acme Corp - $450,000',
    dealSize: 450000,
    dealOwner: 'Jane Smith',
    dealSourceOwner: 'Michael Scott',
    dealStage: 'POC',
    dealCreatedDate: '2023-10-12T09:00:00.000Z',
    lastActivityDate: '2023-10-20T14:30:00.000Z',
    remarks: 'Renewal proposal presented to decision makers.',
    associatedCompany: 'Acme Corp',
    primaryContact: 'Pam Beesly',
    expectedCloseDate: '2024-01-15',
    dealProbability: 65,
    dealSourceOwnerName: 'Michael Scott',
    lostReason: '',
    nextAction: 'Review contract',
    country: 'USA',
    city: 'New York',
    source: 'Referral',
  },
  {
    id: 'enterprise-expansion-1',
    dealName: 'Enterprise Expansion - $1,200,000',
    dealSize: 1200000,
    dealOwner: 'Alex Rivera',
    dealSourceOwner: 'Sarah Connor',
    dealStage: 'Closed Won',
    dealCreatedDate: '2023-09-28T10:20:00.000Z',
    lastActivityDate: '2023-11-10T11:00:00.000Z',
    remarks: 'Final paperwork signed and executed.',
    associatedCompany: 'Enterprise Expansion',
    primaryContact: 'John Doe',
    expectedCloseDate: '2023-12-05',
    dealProbability: 100,
    dealSourceOwnerName: 'Sarah Connor',
    lostReason: '',
    nextAction: 'Onboard team',
    country: 'USA',
    city: 'Boston',
    source: 'Email campaign',
  },
  {
    id: 'global-logistics-upsell-1',
    dealName: 'Global Logistics Upsell - $85,000',
    dealSize: 85000,
    dealOwner: 'Jane Smith',
    dealSourceOwner: 'David Goggins',
    dealStage: 'Nurture',
    dealCreatedDate: '2023-11-05T08:45:00.000Z',
    lastActivityDate: '2023-10-30T12:45:00.000Z',
    remarks: 'Waiting for updated procurement budget.',
    associatedCompany: 'Global Logistics',
    primaryContact: 'Nina Patel',
    expectedCloseDate: '2024-02-10',
    dealProbability: 40,
    dealSourceOwnerName: 'David Goggins',
    lostReason: '',
    nextAction: 'Check pricing options',
    country: 'Germany',
    city: 'Hamburg',
    source: 'Conference',
  },
  {
    id: 'starlight-partnership-1',
    dealName: 'Starlight Inc Partnership - $25,000',
    dealSize: 25000,
    dealOwner: 'Alex Rivera',
    dealSourceOwner: 'Robert Webb',
    dealStage: 'Deal Created',
    dealCreatedDate: '2023-11-14T13:00:00.000Z',
    lastActivityDate: '2023-11-14T13:00:00.000Z',
    remarks: 'Initial discovery complete; proposal underway.',
    associatedCompany: 'Starlight Inc',
    primaryContact: 'Eli Turner',
    expectedCloseDate: '2024-01-20',
    dealProbability: 55,
    dealSourceOwnerName: 'Robert Webb',
    lostReason: '',
    nextAction: 'Finalize proposal draft',
    country: 'Canada',
    city: 'Toronto',
    source: 'Referral',
  },
  {
    id: 'vanguard-systems-1',
    dealName: 'Vanguard Systems - $190,000',
    dealSize: 190000,
    dealOwner: 'Kevin Malone',
    dealSourceOwner: 'Angela Martin',
    dealStage: 'Closed Lost',
    dealCreatedDate: '2023-10-01T11:30:00.000Z',
    lastActivityDate: '2023-10-15T09:10:00.000Z',
    remarks: 'Customer chose a competitor offering a lower price.',
    associatedCompany: 'Vanguard Systems',
    primaryContact: 'Brian Lewis',
    expectedCloseDate: '2023-11-05',
    dealProbability: 0,
    dealSourceOwnerName: 'Angela Martin',
    lostReason: 'Budget constraints',
    nextAction: 'Follow up next quarter',
    country: 'USA',
    city: 'Chicago',
    source: 'Cold outreach',
  },
];
