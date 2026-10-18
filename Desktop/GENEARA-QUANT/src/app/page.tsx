import Link from 'next/link';

export default function Home() {
  return (
    <main className="landing">
      <div className="eyebrow">GENEARA / QUANT</div>

      <h1>
        Precision begins
        <br />
        <span>with discipline.</span>
      </h1>

      <p>
        A secure trading workspace for your connected Deriv accounts, strategy
        configuration, and risk controls.
      </p>

      <div className="actions">
        <Link className="primary" href="/login">
          Sign in
        </Link>

        <Link className="secondary" href="/dashboard">
          Open workspace
        </Link>
      </div>

      <small>
        Live order execution is currently locked pending verification.
      </small>
    </main>
  );
}