
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

type AuthMode = 'signin' | 'signup';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy) return;

    setBusy(true);
    setMessage('');

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (!url || !key) {
        throw new Error(
          'Supabase public environment variables are not configured.',
        );
      }

      const supabase = createBrowserClient(url, key);

      const result =
        mode === 'signin'
          ? await supabase.auth.signInWithPassword({
              email: email.trim(),
              password,
            })
          : await supabase.auth.signUp({
              email: email.trim(),
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/dashboard`,
              },
            });

      if (result.error) {
        throw result.error;
      }

      if (mode === 'signup' && !result.data.session) {
        setMessage(
          'Check your email to confirm your account, then sign in.',
        );
        return;
      }

      window.location.assign('/dashboard');
    } catch (err: unknown) {
      setMessage(
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  function toggleMode() {
    setMode((current) =>
      current === 'signin' ? 'signup' : 'signin',
    );
    setMessage('');
  }

  return (
    <main className="auth">
      <Link href="/" className="eyebrow">
        GENEARA / QUANT
      </Link>

      <h1>
        {mode === 'signin'
          ? 'Welcome back'
          : 'Create your workspace'}
      </h1>

      <p>
        Use your GENEARA QUANT account. Deriv credentials are handled
        separately through Deriv OAuth.
      </p>

      <form onSubmit={submit}>
        <label htmlFor="login-email">
          Email
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
          />
        </label>

        <label htmlFor="login-password">
          Password
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete={
              mode === 'signin'
                ? 'current-password'
                : 'new-password'
            }
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
          />
        </label>

        <button
          className="primary"
          type="submit"
          disabled={busy}
        >
          {busy
            ? 'Please wait…'
            : mode === 'signin'
              ? 'Sign in'
              : 'Create account'}
        </button>
      </form>

      {message && (
        <p role="status" aria-live="polite" className="notice">
          {message}
        </p>
      )}

      <button
        type="button"
        className="textButton"
        disabled={busy}
        onClick={toggleMode}
      >
        {mode === 'signin'
          ? 'Need an account? Sign up'
          : 'Already registered? Sign in'}
      </button>
    </main>
  );
}
