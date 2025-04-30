'use client';

import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/auth/LoginPage';

export default function HomePage(): ReactElement {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    // You can return a loading spinner here
    return <div>Loading...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  // User is authenticated but redirection hasn't happened yet
  // You might want to show a loading state or nothing
  return null;
}
