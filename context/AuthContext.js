'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Demo route: provide fake user, no Firebase subscription (avoids setState loop)
  useEffect(() => {
    if (pathname.startsWith('/demo')) {
      setUser({
        uid: 'demo-user',
        email: 'demo@example.com',
        displayName: 'Demo User'
      });
      setLoading(false);
      return;
    }
    // When leaving demo, reset so auth effect can take over
    setLoading(true);
  }, [pathname]);

  // Normal auth: only runs when not on demo path
  useEffect(() => {
    if (pathname.startsWith('/demo')) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        if (pathname === '/login' || pathname === '/') {
          router.push('/dashboard');
        }
      } else {
        if (pathname !== '/login' && pathname !== '/') {
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
