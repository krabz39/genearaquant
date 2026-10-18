"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ChartNoAxesCombined, LayoutDashboard, WalletCards, Settings, Shield, History, SlidersHorizontal, Radio } from "lucide-react";

const groups = [
  { label: "WORKSPACE", items: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/accounts", label: "Accounts", icon: WalletCards },
    { href: "/trading", label: "Live trading", icon: Activity }
  ]},
  { label: "INTELLIGENCE", items: [
    { href: "/strategies", label: "Strategies", icon: ChartNoAxesCombined },
    { href: "/risk-manager", label: "Risk manager", icon: Shield },
    { href: "/trade-history", label: "Trade history", icon: History }
  ]},
  { label: "SYSTEM", items: [
    { href: "/settings", label: "Settings", icon: SlidersHorizontal }
  ]}
];

export default function Sidebar() {
  const pathname = usePathname();
  return <aside className="sidebar">
    <Link href="/" className="brand"><div className="brand-mark">GQ</div><div><div className="brand-name">GENEARA QUANT</div><div className="brand-sub">INTELLIGENCE IN EVERY TICK</div></div></Link>
    <nav style={{ display: "grid", gap: 22 }}>
      {groups.map(group => <div key={group.label}><div className="nav-label">{group.label}</div><div className="nav-list">
        {group.items.map(item => { const Icon = item.icon; const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)); return <Link className={`nav-link${active ? " active" : ""}`} href={item.href} key={item.href}><Icon size={16} strokeWidth={1.8}/>{item.label}</Link>; })}
      </div></div>)}
    </nav>
    <div className="sidebar-bottom">
      <div className="worker-status"><div className="status-line"><span className="status-dot"/><Radio size={13}/> Preview mode</div><div className="tiny muted" style={{ marginTop: 9, lineHeight: 1.6 }}>Execution worker not connected</div></div>
      <div className="tiny muted" style={{ padding: "16px 9px 0" }}>GENEARA QUANT · v0.1.0</div>
    </div>
  </aside>;
}
