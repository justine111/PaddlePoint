// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn    = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
  const signUp    = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
  const signInAnon = ()         => signInAnonymously(auth);
  const signOut   = ()          => fbSignOut(auth);
  const setDisplayName = name   => updateProfile(auth.currentUser, { displayName: name });

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInAnon, signOut, setDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
