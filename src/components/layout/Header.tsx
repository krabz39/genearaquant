'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';

type HeaderProps = {
  title: string;
  eyebrow: string;
};

export default function Header({ title, eyebrow }: HeaderProps) {
  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="top-actions">
        <span
          className="pill"
          style={{ color: 'var(--amber)' }}
          aria-label="Demo preview mode"
        >
          ● DEMO PREVIEW
        </span>

        <button
          className="pill"
          type="button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={14} aria-hidden="true" />
        </button>

        <Link href="/settings" className="avatar" aria-label="Settings">
          GQ
        </Link>
      </div>
    </header>
  );
}