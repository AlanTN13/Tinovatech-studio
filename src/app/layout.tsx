import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers'; // Import the new Providers component

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Content Canvas',
  description: 'Organize your social media content ideas',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers> {/* Use the Providers component */}
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
