import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout({ children, title, eyebrow }: { children: ReactNode; title: string; eyebrow: string }) {
  return <div className="app-shell"><Sidebar/><div className="main-area"><Header title={title} eyebrow={eyebrow}/><main className="content">{children}<div className="footer-note">GENEARA QUANT · Amber Lux / Cocoa Noir · Preview data only</div></main></div></div>;
}
