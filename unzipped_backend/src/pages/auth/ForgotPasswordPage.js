import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');
  const [countdown, setCountdown] = React.useState(30);

  React.useEffect(() => {
    if (!submitted || countdown <= 0) return undefined;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [submitted, countdown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!/.+@.+\..+/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setLoading(false);
    setSubmitted(true);
    setCountdown(30);
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

        {!submitted ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-slate-900">Forgot your password?</h1>
              <p className="mt-2 text-sm text-slate-500">Enter your email and we&apos;ll send you a reset link</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
              ) : null}

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@company.com"
                className="py-3"
                leftElement={<div className="pointer-events-none text-slate-400"><Mail size={16} /></div>}
              />

              <Button className="w-full shadow-md shadow-emerald-500/20 transition-all duration-150 hover:bg-emerald-700 active:scale-[0.98]" loading={loading} type="submit">
                Send Reset Link
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 p-3 text-emerald-600">
              <MailCheck size={24} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Check your email</h2>
            <p className="mt-2 text-sm text-slate-500">
              We&apos;ve sent a password reset link to <span className="font-medium text-slate-700">{email}</span>. It may take a few minutes to arrive.
            </p>
            <button type="button" className="mt-5 text-sm font-medium text-emerald-600 hover:underline" onClick={() => setSubmitted(false)} disabled={countdown > 0}>
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend email'}
            </button>
          </div>
        )}

        <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600">
          <ArrowLeft size={16} />
          Back to log in
        </Link>
      </div>
    </div>
  );
}
