import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GENEARA QUANT',
  description: 'A secure, risk-first trading workspace.',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}