import Link from 'next/link';
import { requireUserOrRedirect } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function Settings() {
  const user = await requireUserOrRedirect();

  return (
    <main className="shell">
      <header className="topbar">
        <Link href="/" className="eyebrow">
          GENEARA / QUANT
        </Link>

        <span>{user.email}</span>
      </header>

      <Link href="/dashboard" className="back">
        ← Workspace
      </Link>

      <h1>Settings</h1>
      <p className="muted">Workspace and connection status.</p>

      <section className="panel">
        <h2>Application identity</h2>

        <p>
          Signed in as <strong>{user.email}</strong>
        </p>

        <p>Supabase session authentication is active for this request.</p>
      </section>

      <section className="panel">
        <h2>Deriv connection</h2>

        <p>
          Connect or refresh your Deriv authorization to load account
          information.
        </p>

        <a className="primary" href="/api/deriv/connect">
          Connect Deriv
        </a>
      </section>

      <section className="panel">
        <h2>Execution status</h2>

        <div className="warning" role="status">
          LOCKED — no orders can be placed by this release.
        </div>

        <p className="muted">
          Connecting an account or changing settings does not authorize live
          trading.
        </p>
      </section>
    </main>
  );
}