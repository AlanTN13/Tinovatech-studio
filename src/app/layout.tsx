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
  title: 'Tinovatech Content Canvas', // Updated Brand Name
  description: 'Organiza tus ideas de contenido para redes sociales', // Translated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Set language to Spanish
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers> {/* Use the Providers component */}
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
