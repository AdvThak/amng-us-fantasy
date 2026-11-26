import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Among Us Fantasy — Cosmic Draft',
  description: 'Unofficial space-pixel fantasy league starter for Sidemen Among Us. No external video APIs.'
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
