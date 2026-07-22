import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Briefcase, Building2, Users2, CalendarDays, ShieldCheck, LogOut } from 'lucide-react';
import EditableCell from '../../components/EditableCell';
import ToggleSwitch from '../../components/ToggleSwitch';
import { readStoredUser, updateSession, clearSession } from '../../utils/auth';
import { useDeals } from '../../context/DealsContext';
import { useAccounts } from '../../context/AccountsContext';
import { useContacts } from '../../context/ContactsContext';

function StatPill({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-4 last:border-b-0 sm:grid-cols-3 sm:items-center sm:gap-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const stored = readStoredUser() || {};
  const [profile, setProfile] = useState({
    name: 'Alex Rivera',
    email: 'alex@example.com',
    role: 'Account Executive',
    phone: '',
    location: '',
    bio: '',
    ...stored,
  });

  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    desktopNotifications: true,
    weeklySummary: false,
    ...stored.preferences,
  });

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);

  const { deals, loading: dealsLoading, error: dealsError } = useDeals();
  const { accounts, loading: accountsLoading, error: accountsError } = useAccounts();
  const { contacts, loading: contactsLoading, error: contactsError } = useContacts();

  const stats = useMemo(() => {
    const ownedDeals = deals.filter((deal) => deal.dealOwner === profile.name).length;
    const ownedCompanies = accounts.filter((account) => account.owner === profile.name).length;
    const ownedContacts = contacts.filter((contact) => contact.owner === profile.name).length;
    return { ownedDeals, ownedCompanies, ownedContacts };
  }, [deals, accounts, contacts, profile.name]);

  const flashSaved = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  const saveField = (field) => (value) => {
    setProfile((current) => {
      const next = { ...current, [field]: value };
      updateSession({ [field]: value });
      return next;
    });
    flashSaved();
  };

  const savePrefs = (key) => (value) => {
    setPrefs((current) => {
      const next = { ...current, [key]: value };
      updateSession({ preferences: next });
      return next;
    });
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    if (!passwordForm.current || !passwordForm.next) {
      setPasswordMessage('Please fill in your current and new password.');
      return;
    }
    if (passwordForm.next.length < 8) {
      setPasswordMessage('New password must be at least 8 characters.');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMessage("New password and confirmation don't match.");
      return;
    }
    setPasswordMessage('Password updated successfully.');
    setPasswordForm({ current: '', next: '', confirm: '' });
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  const memberSince = stored.createdAt
    ? new Date(stored.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Jan 2026';

  const isLoading = dealsLoading || accountsLoading || contactsLoading;
  const isError = dealsError || accountsError || contactsError;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          <p className="text-sm font-semibold text-slate-500">Loading profile details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    const errorMsg = dealsError?.message || accountsError?.message || contactsError?.message || 'Failed to fetch profile statistics.';
    return (
      <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-center shadow-sm">
        <p className="text-sm font-bold text-rose-700">Error loading profile data</p>
        <p className="mt-1.5 text-xs text-rose-500">{String(errorMsg)}</p>
      </div>
    );
  }

  return (
    <section className="w-full space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 px-6 pb-16 pt-10 sm:px-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/80 bg-emerald-100 text-3xl font-semibold text-emerald-700 shadow-xl">
                {(profile.name || 'U').charAt(0).toUpperCase()}
              </div>
              <button
                type="button"
                aria-label="Change photo"
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-900 text-white shadow-md transition hover:bg-emerald-800"
              >
                <Camera size={14} />
              </button>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white sm:text-3xl">{profile.name}</p>
              <p className="mt-1 text-sm font-medium text-emerald-100">{profile.role}</p>
              <p className="mt-0.5 text-sm text-emerald-100/80">{profile.email}</p>
            </div>
          </div>

          {savedFlash && (
            <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
              Changes saved
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatPill icon={<Briefcase size={18} />} label="Deals Owned" value={stats.ownedDeals} />
        <StatPill icon={<Building2 size={18} />} label="Companies Owned" value={stats.ownedCompanies} />
        <StatPill icon={<Users2 size={18} />} label="Contacts Owned" value={stats.ownedContacts} />
        <StatPill icon={<CalendarDays size={18} />} label="Member Since" value={memberSince} />
      </div>

      {/* Main grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Personal Information" description="This information may be visible to your team.">
            <Field label="Full Name">
              <EditableCell value={profile.name} onSave={saveField('name')} />
            </Field>
            <Field label="Email Address">
              <EditableCell type="email" value={profile.email} onSave={saveField('email')} />
            </Field>
            <Field label="Phone Number">
              <EditableCell value={profile.phone} onSave={saveField('phone')} />
            </Field>
            <Field label="Job Title">
              <EditableCell value={profile.role} onSave={saveField('role')} />
            </Field>
            <Field label="Location">
              <EditableCell value={profile.location} onSave={saveField('location')} />
            </Field>
            <Field label="About">
              <EditableCell type="textarea" value={profile.bio} onSave={saveField('bio')} />
            </Field>
          </SectionCard>

          <SectionCard title="Security" description="Update your password regularly to keep your account secure.">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordMessage && (
                <p
                  className={`rounded-xl px-4 py-2.5 text-sm ${
                    passwordMessage.includes('successfully')
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {passwordMessage}
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-600">Current Password</span>
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm((c) => ({ ...c, current: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-600">New Password</span>
                  <input
                    type="password"
                    value={passwordForm.next}
                    onChange={(e) => setPasswordForm((c) => ({ ...c, next: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-600">Confirm New Password</span>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm((c) => ({ ...c, confirm: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                </label>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Two-factor authentication is not enabled yet.</span>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Enable
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Update Password
                </button>
              </div>
            </form>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Notifications" description="Choose what you want to be notified about.">
            <div className="divide-y divide-slate-100">
              <ToggleSwitch
                label="Email notifications"
                description="Deal updates and task reminders"
                checked={prefs.emailNotifications}
                onChange={savePrefs('emailNotifications')}
              />
              <ToggleSwitch
                label="Desktop notifications"
                description="Real-time alerts in this browser"
                checked={prefs.desktopNotifications}
                onChange={savePrefs('desktopNotifications')}
              />
              <ToggleSwitch
                label="Weekly summary"
                description="A digest of your pipeline every Monday"
                checked={prefs.weeklySummary}
                onChange={savePrefs('weeklySummary')}
              />
            </div>
          </SectionCard>

          <SectionCard title="Danger Zone">
            <p className="text-sm text-slate-500">Signing out will end your current session on this device.</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </SectionCard>
        </div>
      </div>
    </section>
  );
}
