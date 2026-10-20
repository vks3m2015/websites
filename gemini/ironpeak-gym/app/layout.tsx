import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Iron Peak Fitness', description: 'Train stronger, together.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
