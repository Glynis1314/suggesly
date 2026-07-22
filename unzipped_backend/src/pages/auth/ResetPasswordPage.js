import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';

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

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [validToken, setValidToken] = React.useState(true);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (!token) {
      setValidToken(false);
      return;
    }

    const validateToken = async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (token === 'invalid') {
        setValidToken(false);
      }
    };

    validateToken();
  }, [token]);

  const passwordStrength = getStrength(password);
  const passwordsMatch = confirmPassword === '' || password === confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!password || password.length < 8 || !passwordsMatch) {
      setError('Please choose a strong password that matches the confirmation.');
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setLoading(false);
    setSubmitted(true);
  };

  React.useEffect(() => {
    if (submitted) {
      const timer = window.setTimeout(() => navigate('/login', { replace: true, state: { toast: 'Password updated — please log in with your new password.' } }), 800);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [navigate, submitted]);

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

        {!validToken ? (
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 p-3 text-red-500">
              <AlertCircle size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">This link has expired</h1>
            <p className="mt-2 text-sm text-slate-500">Reset links are valid for a limited time. Request a new one below.</p>
            <Link to="/forgot-password" className="mt-6 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all duration-150 hover:bg-emerald-700 active:scale-[0.98]">
              Request new link
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-slate-900">Set a new password</h1>
              <p className="mt-2 text-sm text-slate-500">Choose a new password for your account</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
              ) : null}

              <div>
                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="Enter a new password"
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
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Confirm your new password"
                className="py-3"
                leftElement={<div className="pointer-events-none text-slate-400"><Lock size={16} /></div>}
                rightElement={
                  <button type="button" className="text-slate-400 transition hover:text-slate-600" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={confirmPassword && !passwordsMatch ? "Passwords don't match" : ''}
              />

              <Button className="w-full shadow-md shadow-emerald-500/20 transition-all duration-150 hover:bg-emerald-700 active:scale-[0.98]" loading={loading} type="submit">
                Reset Password
              </Button>
            </form>
          </>
        )}

        <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600">
          <ArrowLeft size={16} />
          Back to log in
        </Link>
      </div>
    </div>
  );
}
