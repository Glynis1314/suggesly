import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { saveSession } from '../../utils/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = React.useState('alex@example.com');
  const [password, setPassword] = React.useState('welcome123');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    if (email.trim() && password.trim()) {
      saveSession({
        email,
        name: 'Alex Rivera',
        role: 'Account Executive',
      });

      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
      return;
    }

    setError('Invalid email or password.');
    setLoading(false);
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
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Log in to your Suggesly account</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="you@company.com"
            className="pl-11 py-3"
            leftElement={
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Mail size={16} />
              </div>
            }
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="pl-11 py-3"
            leftElement={
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Lock size={16} />
              </div>
            }
            rightElement={
              <button
                type="button"
                className="text-slate-400 transition hover:text-slate-600"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span className="flex h-4 w-4 items-center justify-center rounded border border-slate-300 bg-white">
                <input type="checkbox" className="peer h-4 w-4 appearance-none rounded checked:bg-emerald-600 checked:border-emerald-600" />
                <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" className="pointer-events-none hidden h-3 w-3 peer-checked:block">
                  <path d="m5 10 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm font-medium text-emerald-600 hover:underline"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot password?
            </button>
          </div>

          <Button className="w-full shadow-md shadow-emerald-500/20 transition-all duration-150 hover:bg-emerald-700 active:scale-[0.98]" loading={loading} type="submit">
            Sign in
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="font-medium text-emerald-600 hover:underline"
            onClick={() => navigate('/signup')}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}