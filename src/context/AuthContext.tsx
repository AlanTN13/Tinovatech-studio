'use client';

import type { ReactNode, FC } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
// Minimal user type used in place of Firebase auth User
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  providerData: unknown[];
  providerId: string;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
  delete: () => Promise<void>;
  getIdToken: () => Promise<string>;
  getIdTokenResult: () => Promise<unknown>;
  reload: () => Promise<void>;
  toJSON: () => unknown;
}

// Mock user for development purposes when login is bypassed
const mockUser: User = {
  uid: 'mock-uid',
  email: 'ileana@example.com', // Keep the allowed email for consistency if logic depends on it
  displayName: 'Ileana Mock',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [],
  providerId: 'mock',
  // Add dummy methods required by the User type
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({
    token: 'mock-token',
    expirationTime: '',
    authTime: '',
    issuedAtTime: '',
    signInProvider: null,
    signInSecondFactor: null,
    claims: {},
  }),
  reload: async () => {},
  toJSON: () => ({}),
};


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with mock user and loading false
  const [user, setUser] = useState<User | null>(mockUser);
  const [loading, setLoading] = useState(false); // Set loading to false immediately

  // Authentication listener removed for demo mode

  // Mock signOut function - does nothing for auth, maybe logs out locally
  const signOut = async (): Promise<void> => {
    console.log("Signing out (mock)");
    setUser(null); // Simulate sign out locally if needed for UI changes
    // Optionally redirect to a specific page after mock sign out
    // window.location.href = '/'; // Example redirect
  };


  return (
    // Provide the mock user state and mock signOut function
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
