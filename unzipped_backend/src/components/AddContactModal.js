import { useEffect, useState } from 'react';
import SlidePanel from './SlidePanel';

const inputClass =
  'mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20';
const labelClass = 'text-sm font-semibold text-slate-600';
const errorClass = 'mt-2 text-sm text-rose-600';

const today = () => new Date().toISOString().slice(0, 10);
const formatDisplayDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

const ownerOptions = ['Alex Rivera', 'Jane Smith', 'Sarah Jenkins', 'Kevin Malone', 'Michael Chen', 'Olivia Lee'];
const personaOptions = ['Engineering', 'Marketing', 'Sales'];

const emptyForm = {
  name: '',
  owner: '',
  company: '',
  jobTitle: '',
  email: '',
  phone: '',
  linkedin: '',
  stage: '',
  country: '',
  city: '',
  notes: '',
  nextTask: '',
  persona: '',
  lastContactedDate: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AddContactModal({ open, onClose, onCreate, stageOptions = [], companyOptions = [] }) {
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

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Contact name is required.';
    if (!form.owner) nextErrors.owner = 'Contact owner is required.';
    if (!form.email.trim() || !emailPattern.test(form.email.trim())) {
      nextErrors.email = 'A valid email address is required.';
    }
    if (!form.stage) nextErrors.stage = 'Contact stage is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    const initials = form.name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const now = today();
    const currentUser = 'Alex Rivera';

    onCreate({
      name: form.name,
      initials: initials || '?',
      company: form.company,
      email: form.email,
      phone: form.phone,
      location: [form.city, form.country].filter(Boolean).join(', '),
      country: form.country,
      city: form.city,
      owner: form.owner,
      jobTitle: form.jobTitle,
      linkedin: form.linkedin,
      stage: form.stage,
      activity: formatDisplayDate(now),
      created: formatDisplayDate(now),
      notes: form.notes,
      nextTask: form.nextTask,
      persona: form.persona,
      lastContactedDate: form.lastContactedDate,
      contactId: `con-${Date.now()}`,
      createdBy: currentUser,
      updatedBy: currentUser,
      createdDateSystem: now,
      modifiedDate: now,
    });
  };

  return (
    <SlidePanel
      open={open}
      title="New Contact"
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
            Create Contact
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="max-h-[65vh] overflow-y-auto pr-2">
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelClass}>
              Contact Name <span className="text-rose-500">*</span>
            </span>
            <input type="text" value={form.name} onChange={setField('name')} placeholder="Jane Doe" className={inputClass} />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </label>

          <label className="block">
            <span className={labelClass}>
              Contact Owner <span className="text-rose-500">*</span>
            </span>
            <select value={form.owner} onChange={setField('owner')} className={inputClass}>
              <option value="">Select owner</option>
              {ownerOptions.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
            {errors.owner && <p className={errorClass}>{errors.owner}</p>}
          </label>

          <label className="block">
            <span className={labelClass}>Associated Company</span>
            <input
              type="text"
              list="company-options"
              value={form.company}
              onChange={setField('company')}
              placeholder="Search or type a company"
              className={inputClass}
            />
            <datalist id="company-options">
              {companyOptions.map((company) => (
                <option key={company} value={company} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <span className={labelClass}>Contact Job Title</span>
            <input type="text" value={form.jobTitle} onChange={setField('jobTitle')} placeholder="VP of Sales" className={inputClass} />
          </label>

          <label className="block">
            <span className={labelClass}>
              Contact Email <span className="text-rose-500">*</span>
            </span>
            <input type="email" value={form.email} onChange={setField('email')} placeholder="jane@company.com" className={inputClass} />
            {errors.email && <p className={errorClass}>{errors.email}</p>}
          </label>

          <label className="block">
            <span className={labelClass}>Contact Phone Number</span>
            <input type="tel" value={form.phone} onChange={setField('phone')} placeholder="+1 (555) 012-3456" className={inputClass} />
          </label>

          <label className="block">
            <span className={labelClass}>Contact LinkedIn</span>
            <input
              type="url"
              value={form.linkedin}
              onChange={setField('linkedin')}
              placeholder="https://www.linkedin.com/in/..."
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>
              Contact Stage <span className="text-rose-500">*</span>
            </span>
            <select value={form.stage} onChange={setField('stage')} className={inputClass}>
              <option value="">Select stage</option>
              {stageOptions.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
            {errors.stage && <p className={errorClass}>{errors.stage}</p>}
          </label>

          <label className="block">
            <span className={labelClass}>Contact Country</span>
            <input type="text" value={form.country} onChange={setField('country')} className={inputClass} />
          </label>

          <label className="block">
            <span className={labelClass}>Contact City</span>
            <input type="text" value={form.city} onChange={setField('city')} className={inputClass} />
          </label>

          <label className="block">
            <span className={labelClass}>Persona / Department</span>
            <select value={form.persona} onChange={setField('persona')} className={inputClass}>
              <option value="">Not specified</option>
              {personaOptions.map((persona) => (
                <option key={persona} value={persona}>
                  {persona}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>Last Contacted Date</span>
            <input
              type="date"
              value={form.lastContactedDate}
              onChange={setField('lastContactedDate')}
              className={inputClass}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className={labelClass}>Next Task</span>
            <input
              type="text"
              value={form.nextTask}
              onChange={setField('nextTask')}
              placeholder="Schedule a follow-up call"
              className={inputClass}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className={labelClass}>Notes</span>
            <textarea value={form.notes} onChange={setField('notes')} rows="3" className={inputClass} />
          </label>
        </div>
      </form>
    </SlidePanel>
  );
}