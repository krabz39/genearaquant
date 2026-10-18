import Link from 'next/link';
import { requireUserOrRedirect } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function Trading() {
  await requireUserOrRedirect();

  return (
    <main className="shell">
      <Link href="/dashboard" className="back">
        ← Workspace
      </Link>

      <h1>Execution controls</h1>

      <section className="panel">
        <div className="warning" role="status">
          ORDER EXECUTION LOCKED
        </div>

        <p className="muted">
          This release cannot place trades. No demo orders are generated.
          Execution remains unavailable until proposal validation, risk
          enforcement, idempotent order handling, settlement reconciliation,
          and independent testing are complete.
        </p>
      </section>

      <section className="panel">
        <h2>Before execution can be enabled</h2>

        <ul>
          <li>Validate Deriv proposals and contract parameters.</li>
          <li>Enforce risk limits on the server before every order.</li>
          <li>Prevent duplicate orders with idempotent handling.</li>
          <li>Reconcile order results and settlements with Deriv.</li>
          <li>Complete independent testing and authorization checks.</li>
        </ul>

        <p className="muted">
          These are readiness requirements, not confirmation that they have
          already been implemented or tested.
        </p>

        <Link className="secondary" href="/risk-manager">
          Review risk controls
        </Link>
      </section>
    </main>
  );
}