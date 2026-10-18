"use client";

import Link from "next/link";
import { Bell, ChevronDown } from "lucide-react";

export default function Header({ title, eyebrow }: { title: string; eyebrow: string }) {
  return <header className="topbar">
    <div><div className="eyebrow">{eyebrow}</div><h1 className="page-title">{title}</h1></div>
    <div className="top-actions">
      <span className="pill" style={{ color: "var(--amber)" }}>● DEMO PREVIEW</span>
      <button className="pill" aria-label="Notifications" title="Notifications"><Bell size={14}/></button>
      <Link href="/settings" className="avatar" aria-label="Settings">GQ</Link>
    </div>
  </header>;
}
