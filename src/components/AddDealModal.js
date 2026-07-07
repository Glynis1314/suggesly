import { useEffect, useState } from 'react';
import SlidePanel from './SlidePanel';

const inputClass =
  'mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20';
const labelClass = 'text-sm font-semibold text-slate-600';
const errorClass = 'mt-2 text-sm text-rose-600';

const ownerOptions = ['Alex Rivera', 'Jane Smith', 'Sarah Jenkins', 'Kevin Malone', 'Michael Chen', 'Olivia Lee'];

const emptyForm = {
  dealName: '',
  associatedCompany: '',
  associatedContacts: [],
  dealValue: '',
  dealOwner: '',
  dealStage: '',
  dealSource: '',
  expectedCloseDate: '',
  nextStep: '',
  nextStepDueDate: '',
  lostReason: '',
  wonReason: '',
  dealNotes: '',
};

export default function AddDealModal({
  open,
  onClose,
  onCreate,
  stageOptions = [],
  companyOptions = [],
  contactOptions = [],
}) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      setErrors({});
    }
  }, [open]);

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const toggleContact = (name) => {
    setForm((current) => {
      const has = current.associatedContacts.includes(name);
      return {
        ...current,
        associatedContacts: has
          ? current.associatedContacts.filter((item) => item !== name)
          : [...current.associatedContacts, name],
      };
    });
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.dealName.trim()) nextErrors.dealName = 'Deal name is required.';
    if (!form.associatedCompany.trim()) nextErrors.associatedCompany = 'Associated company is required.';
    if (!form.dealValue || Number.isNaN(Number(form.dealValue)) || Number(form.dealValue) <= 0) {
      nextErrors.dealValue = 'Deal value is required and must be greater than 0.';
    }
    if (!form.dealOwner) nextErrors.dealOwner = 'Deal owner is required.';
    if (!form.dealStage) nextErrors.dealStage = 'Deal stage is required.';
    if (form.dealStage === 'Closed Lost' && !form.lostReason.trim()) {
      nextErrors.lostReason = 'Lost reason is required when a deal is closed lost.';
    }
    if (form.dealStage === 'Closed Won' && !form.wonReason.trim()) {
      nextErrors.wonReason = 'Won reason is required when a deal is closed won.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    const now = new Date().toISOString();
    const dealSize = Number(form.dealValue);

    onCreate({
      id: `${form.dealName.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}-${Date.now()}`,
      dealName: form.dealName,
      dealSize,
      dealOwner: form.dealOwner,
      dealSourceOwner: '',
      dealSourceOwnerName: '',
      dealStage: form.dealStage,
      dealCreatedDate: now,
      lastActivityDate: now,
      remarks: form.dealNotes,
      associatedCompany: form.associatedCompany,
      primaryContact: form.associatedContacts[0] || '',
      associatedContacts: form.associatedContacts,
      expectedCloseDate: form.expectedCloseDate,
      dealProbability: 0,
      lostReason: form.dealStage === 'Closed Lost' ? form.lostReason : '',
      wonReason: form.dealStage === 'Closed Won' ? form.wonReason : '',
      nextAction: form.nextStep,
      nextStepDueDate: form.nextStepDueDate,
      country: '',
      city: '',
      source: form.dealSource,
    });
  };

  return (
    <SlidePanel
      open={open}
      title="New Deal"
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-700"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-emerald-700 px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-800"
            onClick={handleSubmit}
          >
            Create Deal
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="max-h-[65vh] overflow-y-auto pr-2">
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelClass}>
              Deal Name <span className="text-rose-500">*</span>
            </span>
            <input type="text" value={form.dealName} onChange={setField('dealName')} placeholder="Acme Corp Renewal" className={inputClass} />
            {errors.dealName && <p className={errorClass}>{errors.dealName}</p>}
          </label>

          <label className="block">
            <span className={labelClass}>
              Associated Company <span className="text-rose-500">*</span>
            </span>
            <input
              type="text"
              list="deal-company-options"
              value={form.associatedCompany}
              onChange={setField('associatedCompany')}
              placeholder="Search or type a company"
              className={inputClass}
            />
            <datalist id="deal-company-options">
              {companyOptions.map((company) => (
                <option key={company} value={company} />
              ))}
            </datalist>
            {errors.associatedCompany && <p className={errorClass}>{errors.associatedCompany}</p>}
          </label>

          <label className="block">
            <span className={labelClass}>
              Deal Value <span className="text-rose-500">*</span>
            </span>
            <input type="number" value={form.dealValue} onChange={setField('dealValue')} placeholder="450000" className={inputClass} />
            {errors.dealValue && <p className={errorClass}>{errors.dealValue}</p>}
          </label>

          <label className="block">
            <span className={labelClass}>
              Deal Owner <span className="text-rose-500">*</span>
            </span>
            <select value={form.dealOwner} onChange={setField('dealOwner')} className={inputClass}>
              <option value="">Select owner</option>
              {ownerOptions.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
            {errors.dealOwner && <p className={errorClass}>{errors.dealOwner}</p>}
          </label>

          <label className="block">
            <span className={labelClass}>
              Deal Stage <span className="text-rose-500">*</span>
            </span>
            <select value={form.dealStage} onChange={setField('dealStage')} className={inputClass}>
              <option value="">Select stage</option>
              {stageOptions.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
            {errors.dealStage && <p className={errorClass}>{errors.dealStage}</p>}
          </label>

          <label className="block">
            <span className={labelClass}>Deal Source</span>
            <input type="text" value={form.dealSource} onChange={setField('dealSource')} placeholder="Referral, Outbound, ..." className={inputClass} />
          </label>

          <label className="block">
            <span className={labelClass}>Expected Close Date</span>
            <input type="date" value={form.expectedCloseDate} onChange={setField('expectedCloseDate')} className={inputClass} />
          </label>

          <label className="block">
            <span className={labelClass}>Next Step Due Date</span>
            <input type="date" value={form.nextStepDueDate} onChange={setField('nextStepDueDate')} className={inputClass} />
          </label>

          <div className="block sm:col-span-2">
            <span className={labelClass}>Associated Contacts</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {contactOptions.map((name) => {
                const active = form.associatedContacts.includes(name);
                return (
                  <button
                    type="button"
                    key={name}
                    onClick={() => toggleContact(name)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block sm:col-span-2">
            <span className={labelClass}>Next Step</span>
            <input type="text" value={form.nextStep} onChange={setField('nextStep')} placeholder="Send updated proposal" className={inputClass} />
          </label>

          {form.dealStage === 'Closed Lost' && (
            <label className="block sm:col-span-2">
              <span className={labelClass}>
                Lost Reason <span className="text-rose-500">*</span>
              </span>
              <input type="text" value={form.lostReason} onChange={setField('lostReason')} className={inputClass} />
              {errors.lostReason && <p className={errorClass}>{errors.lostReason}</p>}
            </label>
          )}

          {form.dealStage === 'Closed Won' && (
            <label className="block sm:col-span-2">
              <span className={labelClass}>
                Won Reason <span className="text-rose-500">*</span>
              </span>
              <input type="text" value={form.wonReason} onChange={setField('wonReason')} className={inputClass} />
              {errors.wonReason && <p className={errorClass}>{errors.wonReason}</p>}
            </label>
          )}

          <label className="block sm:col-span-2">
            <span className={labelClass}>Deal Notes</span>
            <textarea value={form.dealNotes} onChange={setField('dealNotes')} rows="3" className={inputClass} />
          </label>
        </div>
      </form>
    </SlidePanel>
  );
}