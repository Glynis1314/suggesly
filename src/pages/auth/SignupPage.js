import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, CheckCircle2 } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { saveSession } from '../../utils/auth';

function getStrength(password) {
  if (!password) return { label: 'Weak', score: 0, color: 'bg-red-400' };
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  if (score <= 2) return { label: 'Weak', score: 1, color: 'bg-red-400' };
  if (score <= 4) return { label: 'Medium', score: 2, color: 'bg-amber-400' };
  return { label: 'Strong', score: 3, color: 'bg-emerald-500' };
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const passwordStrength = getStrength(form.password);
  const emailValid = /.+@.+\..+/.test(form.email);
  const passwordsMatch = form.confirmPassword === '' || form.password === form.confirmPassword;
  const canSubmit = form.name.trim() && emailValid && form.password.length >= 8 && passwordsMatch && form.agreed;

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!canSubmit) return;

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Unable to create account.');
      }

      saveSession({
        email: form.email,
        name: form.name,
        role: 'New User',
      });
      setSuccess('Account created — please continue to your dashboard.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.10),_transparent_40%),linear-gradient(135deg,_#f8fafc_0%,_#f1f5f9_100%)] px-4 py-10">
      <div className="animate-[fadeInUp_300ms_ease-out] w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.35)]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 p-3 shadow-sm">
            <img src="/assets/suggesly_icon.png" alt="Suggesly icon" className="h-full w-full rounded-full object-cover" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">Suggesly</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Sales Simplified</p>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">Start managing your pipeline with Suggesly</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          ) : null}
          {success ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>
          ) : null}

          <Input
            label="Full Name"
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            autoComplete="name"
            placeholder="Alex Rivera"
            className="py-3"
            leftElement={<div className="pointer-events-none text-slate-400"><User size={16} /></div>}
          />

          <Input
            label="Work Email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            autoComplete="email"
            placeholder="alex@company.com"
            className="py-3"
            leftElement={<div className="pointer-events-none text-slate-400"><Mail size={16} /></div>}
            error={form.email && !emailValid ? 'Enter a valid email address' : ''}
          />

          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange('password')}
              autoComplete="new-password"
              placeholder="Create a password"
              className="py-3"
              leftElement={<div className="pointer-events-none text-slate-400"><Lock size={16} /></div>}
              rightElement={
                <button type="button" className="text-slate-400 transition hover:text-slate-600" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <div className="mt-2">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((segment) => (
                  <div key={segment} className={`h-1.5 flex-1 rounded-full ${segment < passwordStrength.score ? passwordStrength.color : 'bg-slate-200'}`} />
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-500">Password strength: <span className="font-medium text-slate-700">{passwordStrength.label}</span></p>
            </div>
          </div>

          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            autoComplete="new-password"
            placeholder="Confirm your password"
            className="py-3"
            leftElement={<div className="pointer-events-none text-slate-400"><Lock size={16} /></div>}
            rightElement={
              <button type="button" className="text-slate-400 transition hover:text-slate-600" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            error={form.confirmPassword && !passwordsMatch ? "Passwords don't match" : ''}
          />

          <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
            <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded border border-slate-300 bg-white">
              <input type="checkbox" checked={form.agreed} onChange={() => setForm((current) => ({ ...current, agreed: !current.agreed }))} className="peer h-4 w-4 appearance-none rounded checked:bg-emerald-600 checked:border-emerald-600" />
              <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" className="pointer-events-none hidden h-3 w-3 peer-checked:block">
                <path d="m5 10 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span>
              I agree to the{' '}
              <a href="#" className="font-medium text-emerald-600 underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="font-medium text-emerald-600 underline">Privacy Policy</a>
            </span>
          </label>

          <Button className="w-full shadow-md shadow-emerald-500/20 transition-all duration-150 hover:bg-emerald-700 active:scale-[0.98]" loading={loading} type="submit">
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
