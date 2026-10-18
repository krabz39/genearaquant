
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
              email,
              password,
            })
          : await supabase.auth.signUp({
              email,
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
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : 'Authentication failed.',
      );
    } finally {
      setBusy(false);
    }
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
        separately by Deriv OAuth.
      </p>

      <form onSubmit={submit}>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
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
          />
        </label>

        <button className="primary" type="submit" disabled={busy}>
          {busy
            ? 'Please wait…'
            : mode === 'signin'
              ? 'Sign in'
              : 'Create account'}
        </button>
      </form>

      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}

      <button
        type="button"
        className="textButton"
        disabled={busy}
        onClick={() => {
          setMode((current) =>
            current === 'signin' ? 'signup' : 'signin',
          );
          setMessage('');
        }}
      >
        {mode === 'signin'
          ? 'Need an account? Sign up'
          : 'Already registered? Sign in'}
      </button>
    </main>
  );
}
