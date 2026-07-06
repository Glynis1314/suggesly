import { useEffect, useState } from 'react';
import Modal from './Modal';

const inputClass =
  'mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20';
const labelClass = 'text-sm font-semibold text-slate-600';
const errorClass = 'mt-2 text-sm text-rose-600';

const today = () => new Date().toISOString().slice(0, 10);

const ownerOptions = ['Alex Rivera', 'Jane Smith', 'Sarah Jenkins', 'Kevin Malone', 'Michael Chen', 'Olivia Lee'];

const emptyForm = {
  company: '',
  owner: '',
  source: [],
  priority: '',
  stage: '',
  notes: '',
  nextSteps: '',
  nextActionDate: '',
  lastActivityDate: today(),
  createdDate: today(),
  country: '',
  city: '',
  employeeSize: '',
  linkedin: '',
};

export default function AddCompanyModal({
  open,
  onClose,
  onCreate,
  stageOptions = [],
  priorityOptions = [],
  sourceOptions = [],
  employeeSizeOptions = [],
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

  const toggleSource = (value) => {
    setForm((current) => {
      const has = current.source.includes(value);
      return {
        ...current,
        source: has ? current.source.filter((item) => item !== value) : [...current.source, value],
      };
    });
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.company.trim()) nextErrors.company = 'Company name is required.';
    if (!form.owner) nextErrors.owner = 'Owner is required.';
    if (!form.stage) nextErrors.stage = 'Stage is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    const init = form.company.trim().charAt(0).toUpperCase() || '?';
    const colorPalette = [
      'bg-emerald-100 text-emerald-700',
      'bg-orange-100 text-orange-700',
      'bg-sky-100 text-sky-700',
      'bg-indigo-100 text-indigo-700',
      'bg-rose-100 text-rose-700',
      'bg-amber-100 text-amber-700',
      'bg-teal-100 text-teal-700',
    ];
    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

    onCreate({
      ...form,
      companyId: `acc-${Date.now()}`,
      init,
      color,
      site: form.linkedin ? '' : '',
    });
  };

  return (
    <Modal
      open={open}
      title="New Company"
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
            Create Company
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="max-h-[65vh] overflow-y-auto pr-2">
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelClass}>
              Company Name <span className="text-rose-500">*</span>
            </span>
            <input
              type="text"
              value={form.company}
              onChange={setField('company')}
              placeholder="Acme Corp"
              className={inputClass}
            />
            {errors.company && <p className={errorClass}>{errors.company}</p>}
          </label>

          <label className="block">
            <span className={labelClass}>
              Owner <span className="text-rose-500">*</span>
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
            <span className={labelClass}>
              Stage <span className="text-rose-500">*</span>
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
            <span className={labelClass}>Priority</span>
            <select value={form.priority} onChange={setField('priority')} className={inputClass}>
              <option value="">Select priority</option>
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>Employee Size</span>
            <select value={form.employeeSize} onChange={setField('employeeSize')} className={inputClass}>
              <option value="">Select range</option>
              {employeeSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <div className="block sm:col-span-2">
            <span className={labelClass}>Source</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {sourceOptions.map((source) => {
                const active = form.source.includes(source);
                return (
                  <button
                    type="button"
                    key={source}
                    onClick={() => toggleSource(source)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                      active
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {source}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className={labelClass}>Country</span>
            <input type="text" value={form.country} onChange={setField('country')} className={inputClass} />
          </label>

          <label className="block">
            <span className={labelClass}>City</span>
            <input type="text" value={form.city} onChange={setField('city')} className={inputClass} />
          </label>

          <label className="block">
            <span className={labelClass}>Next Action Date</span>
            <input
              type="date"
              value={form.nextActionDate}
              onChange={setField('nextActionDate')}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Last Activity Date</span>
            <input
              type="date"
              value={form.lastActivityDate}
              onChange={setField('lastActivityDate')}
              className={inputClass}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className={labelClass}>LinkedIn URL</span>
            <input
              type="url"
              value={form.linkedin}
              onChange={setField('linkedin')}
              placeholder="https://www.linkedin.com/company/..."
              className={inputClass}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className={labelClass}>Next Step</span>
            <input
              type="text"
              value={form.nextSteps}
              onChange={setField('nextSteps')}
              placeholder="Send updated proposal"
              className={inputClass}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className={labelClass}>Notes</span>
            <textarea
              value={form.notes}
              onChange={setField('notes')}
              rows="3"
              className={inputClass}
            />
          </label>
        </div>
      </form>
    </Modal>
  );
}
