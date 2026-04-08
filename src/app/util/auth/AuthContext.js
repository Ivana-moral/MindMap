'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Creates an Authentication Context
 */
const AuthContext = createContext({
  user: null,
  loading: true,
});

/**
 * Creates an AuthProvider for child components
 * @param {*} children
 * @returns AuthProvider
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async(firebaseUser) => {
	  console.log('[AuthContext] Firebase User:', firebaseUser);
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const role = idTokenResult?.claims?.role || null;
          console.log(idTokenResult);
          setUserRole(role);
          sessionStorage.setItem('role', role);
          console.log('[AuthContext] Role from claims:', role);
        } catch (err) {
          console.error('[AuthContext] Error getting role:', err);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
	try {
		await firebaseSignOut(auth);
		setUser(null); // optional, context will update from onAuthStateChanged anyway
	} catch (error) {
		console.error('Error signing out:', error);
	}
};

  return (
    <AuthContext.Provider value={{ user, loading, signOut, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Helper function to allow users to get the current context
 * @returns AuthContext
 */
export const useAuth = () => useContext(AuthContext);
