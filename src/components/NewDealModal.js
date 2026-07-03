import { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function formatCurrencyValue(value) {
  const number = Number(value);
  if (Number.isNaN(number)) {
    return '';
  }
  return currencyFormatter.format(number);
}

export default function NewDealModal({
  open,
  company,
  defaultDealOwner,
  onClose,
  onCreate,
}) {
  const companyName = company?.company || '';
  const companySource = company?.source?.[0] || 'Unknown';
  const [dealSize, setDealSize] = useState('');
  const [dealOwner, setDealOwner] = useState(defaultDealOwner || '');
  const [dealSourceOwner, setDealSourceOwner] = useState('');
  const [dealSourceOwnerName, setDealSourceOwnerName] = useState('');
  const [primaryContact, setPrimaryContact] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [dealProbability, setDealProbability] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [remarks, setRemarks] = useState('');
  const [dealStage, setDealStage] = useState('Deal Created');
  const [lostReason, setLostReason] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setDealOwner(defaultDealOwner || company?.owner || '');
  }, [defaultDealOwner, company]);

  useEffect(() => {
    if (!open) {
      setDealSize('');
      setDealSourceOwner('');
      setDealSourceOwnerName('');
      setPrimaryContact('');
      setExpectedCloseDate('');
      setDealProbability('');
      setNextAction('');
      setRemarks('');
      setDealStage('Deal Created');
      setLostReason('');
      setErrors({});
    }
  }, [open]);

  const [country, city] = useMemo(() => {
    const locationParts = company?.location?.split(',').map((part) => part.trim());
    return [locationParts?.[0] || '', locationParts?.[1] || ''];
  }, [company]);

  const ownerOptions = [
    'Alex Rivera',
    'Jane Smith',
    'Sarah Connor',
    'Kevin Malone',
    'Michael Chen',
  ];

  const validate = () => {
    const currentErrors = {};

    if (!dealSize || Number.isNaN(Number(dealSize)) || Number(dealSize) <= 0) {
      currentErrors.dealSize = 'Deal size is required and must be greater than 0.';
    }
    if (!dealOwner) {
      currentErrors.dealOwner = 'Deal owner is required.';
    }
    if (!dealSourceOwner) {
      currentErrors.dealSourceOwner = 'Deal source owner is required.';
    }
    if (!dealSourceOwnerName) {
      currentErrors.dealSourceOwnerName = 'Deal source owner name is required.';
    }
    if (!primaryContact) {
      currentErrors.primaryContact = 'Primary contact is required.';
    }
    if (!expectedCloseDate) {
      currentErrors.expectedCloseDate = 'Expected close date is required.';
    }
    if (dealProbability === '' || Number.isNaN(Number(dealProbability))) {
      currentErrors.dealProbability = 'Deal probability is required.';
    }
    if (!nextAction) {
      currentErrors.nextAction = 'Next action is required.';
    }
    if (!remarks) {
      currentErrors.remarks = 'Remarks are required.';
    }
    if (dealStage === 'Closed Lost' && !lostReason) {
      currentErrors.lostReason = 'Lost reason is required when a deal is lost.';
    }

    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const normalizedSize = Number(dealSize);
    const createdDate = new Date().toISOString();
    const formattedSize = formatCurrencyValue(normalizedSize);
    const createdName = `${companyName} - ${formattedSize}`;

    onCreate({
      id: `${companyName.replace(/[^a-zA-Z0-9]+/g, '-')}-${Date.now()}`,
      dealName: createdName,
      dealSize: normalizedSize,
      dealOwner,
      dealSourceOwner,
      dealSourceOwnerName,
      dealStage,
      dealCreatedDate: createdDate,
      lastActivityDate: createdDate,
      remarks,
      associatedCompany: companyName,
      primaryContact,
      expectedCloseDate,
      dealProbability: Number(dealProbability),
      lostReason: dealStage === 'Closed Lost' ? lostReason : '',
      nextAction,
      country,
      city,
      source: companySource,
    });
  };

  return (
    <Modal
      open={open}
      title="New Deal"
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xl font-semibold text-slate-700"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-emerald-700 px-5 py-3 text-xl font-semibold text-white"
            onClick={handleSubmit}
          >
            Create deal
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xl font-semibold text-slate-800">Company Details</p>
            <label className="block">
              <span className="text-sm font-semibold text-slate-600">Company Name</span>
              <input
                type="text"
                value={companyName}
                readOnly
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-xl text-slate-900"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-600">Source</span>
              <input
                type="text"
                value={companySource}
                readOnly
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-xl text-slate-900"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-600">Country</span>
                <input
                  type="text"
                  value={country}
                  readOnly
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-xl text-slate-900"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-600">City</span>
                <input
                  type="text"
                  value={city}
                  readOnly
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-xl text-slate-900"
                />
              </label>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xl font-semibold text-slate-800">Deal Details</p>
            <label className="block">
              <span className="text-sm font-semibold text-slate-600">Deal Size / Revenue</span>
              <input
                type="number"
                value={dealSize}
                onChange={(event) => setDealSize(event.target.value)}
                placeholder="450000"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-xl text-slate-900"
              />
              {errors.dealSize && <p className="mt-2 text-sm text-rose-600">{errors.dealSize}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-600">Deal Owner</span>
              <select
                value={dealOwner}
                onChange={(event) => setDealOwner(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-xl text-slate-900"
              >
                <option value="">Select owner</option>
                {ownerOptions.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
              {errors.dealOwner && <p className="mt-2 text-sm text-rose-600">{errors.dealOwner}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-600">Deal Source Owner</span>
              <input
                type="text"
                value={dealSourceOwner}
                onChange={(event) => setDealSourceOwner(event.target.value)}
                placeholder="Michael Scott"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-xl text-slate-900"
              />
              {errors.dealSourceOwner && <p className="mt-2 text-sm text-rose-600">{errors.dealSourceOwner}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-600">Deal Source Owner Name</span>
              <input
                type="text"
                value={dealSourceOwnerName}
                onChange={(event) => setDealSourceOwnerName(event.target.value)}
                placeholder="Michael Scott"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-xl text-slate-900"
              />
              {errors.dealSourceOwnerName && <p className="mt-2 text-sm text-rose-600">{errors.dealSourceOwnerName}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-600">Primary Contact</span>
              <input
                type="text"
                value={primaryContact}
                onChange={(event) => setPrimaryContact(event.target.value)}
                placeholder="Pam Beesly"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-xl text-slate-900"
              />
              {errors.primaryContact && <p className="mt-2 text-sm text-rose-600">{errors.primaryContact}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-600">Expected Close Date</span>
              <input
                type="date"
                value={expectedCloseDate}
                onChange={(event) => setExpectedCloseDate(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-xl text-slate-900"
              />
              {errors.expectedCloseDate && <p className="mt-2 text-sm text-rose-600">{errors.expectedCloseDate}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-600">Deal Probability (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                value={dealProbability}
                onChange={(event) => setDealProbability(event.target.value)}
                placeholder="75"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-xl text-slate-900"
              />
              {errors.dealProbability && <p className="mt-2 text-sm text-rose-600">{errors.dealProbability}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-600">Next Action</span>
              <input
                type="text"
                value={nextAction}
                onChange={(event) => setNextAction(event.target.value)}
                placeholder="Schedule review call"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-xl text-slate-900"
              />
              {errors.nextAction && <p className="mt-2 text-sm text-rose-600">{errors.nextAction}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-600">Remarks</span>
              <textarea
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                rows="4"
                placeholder="Enter key notes or next steps"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-xl text-slate-900"
              />
              {errors.remarks && <p className="mt-2 text-sm text-rose-600">{errors.remarks}</p>}
            </label>
            {dealStage === 'Closed Lost' && (
              <label className="block">
                <span className="text-sm font-semibold text-slate-600">Lost Reason</span>
                <input
                  type="text"
                  value={lostReason}
                  onChange={(event) => setLostReason(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-xl text-slate-900"
                />
                {errors.lostReason && <p className="mt-2 text-sm text-rose-600">{errors.lostReason}</p>}
              </label>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
