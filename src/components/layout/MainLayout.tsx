import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

type MainLayoutProps = {
  children: ReactNode;
  title: string;
  eyebrow: string;
};

export default function MainLayout({
  children,
  title,
  eyebrow,
}: MainLayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <Header title={title} eyebrow={eyebrow} />

        <main className="content">
          {children}

          <div className="footer-note">
            GENEARA QUANT · Amber Lux / Cocoa Noir · Preview data only
          </div>
        </main>
      </div>
    </div>
  );
}