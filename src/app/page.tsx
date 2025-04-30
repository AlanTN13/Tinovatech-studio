'use client';

import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Removed useAuth import as it's no longer needed for redirection logic here
// import { useAuth } from '@/context/AuthContext';
// Removed LoginPage import as it's not rendered anymore
// import LoginPage from '@/components/auth/LoginPage';

export default function HomePage(): ReactElement | null {
  // Removed user and loading state from useAuth
  // const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect immediately to the dashboard
    router.push('/dashboard');
    // Removed dependency array as redirection is now unconditional
  }, [router]);

  // Render nothing or a loading indicator while redirecting
  // Since redirection happens immediately in useEffect, returning null is fine.
  // Or you could return a simple loading state:
  // return <div>Loading...</div>;
  return null;
}
