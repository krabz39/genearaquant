'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  ChartNoAxesCombined,
  LayoutDashboard,
  WalletCards,
  Shield,
  History,
  SlidersHorizontal,
  Radio,
} from 'lucide-react';

const groups = [
  {
    label: 'WORKSPACE',
    items: [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { href: '/accounts', label: 'Accounts', icon: WalletCards },
      { href: '/trading', label: 'Live trading', icon: Activity },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { href: '/strategies', label: 'Strategies', icon: ChartNoAxesCombined },
      { href: '/risk-manager', label: 'Risk manager', icon: Shield },
      { href: '/trade-history', label: 'Trade history', icon: History },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { href: '/settings', label: 'Settings', icon: SlidersHorizontal },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className="brand" aria-label="GENEARA QUANT home">
        <div className="brand-mark" aria-hidden="true">
          GQ
        </div>

        <div>
          <div className="brand-name">GENEARA QUANT</div>
          <div className="brand-sub">INTELLIGENCE IN EVERY TICK</div>
        </div>
      </Link>

      <nav aria-label="Main navigation" className="sidebar-nav">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="nav-label">{group.label}</div>

            <div className="nav-list">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== '/dashboard' &&
                    pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    className={`nav-link${active ? ' active' : ''}`}
                    href={item.href}
                    key={item.href}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="worker-status">
          <div className="status-line">
            <span className="status-dot" aria-hidden="true" />
            <Radio size={13} aria-hidden="true" />
            <span>Preview mode</span>
          </div>

          <div
            className="tiny muted"
            style={{ marginTop: 9, lineHeight: 1.6 }}
          >
            Execution worker not connected
          </div>
        </div>

        <div className="tiny muted sidebar-version">
          GENEARA QUANT · v0.1.0
        </div>
      </div>
    </aside>
  );
}