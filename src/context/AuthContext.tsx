'use client';

import type { ReactNode, FC } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/firebase/config'; // Assuming your Firebase config is here

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email === 'ileana@example.com') { // Replace with actual allowed email
        setUser(currentUser);
      } else {
        setUser(null);
        // If a logged-in user's email is not allowed, sign them out.
        if (currentUser) {
          firebaseSignOut(auth);
        }
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null); // Ensure user state is updated immediately
    } catch (error) {
      console.error("Error signing out: ", error);
      // Handle error appropriately, e.g., show a notification
    }
  };


  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
