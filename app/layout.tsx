import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cosmic Draft · Sidemen Among Us fantasy',
  description: 'Draft a Sidemen crew and check each gameweek against the round records.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
