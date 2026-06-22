// src/services/firebase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getApps, initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ── Replace all values with your Firebase console config ────────────────────
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAwp1YZvDz0wNrPOj-mQGx1rsfKYFw7bdQ',
  authDomain: 'paddlepoint-ff045.firebaseapp.com',
  projectId: 'paddlepoint-ff045',
  storageBucket: 'paddlepoint-ff045.firebasestorage.app',
  messagingSenderId: '488864877077',
  appId: '1:488864877077:android:70a47ed88480675fee1c1c',
};

// Prevent re-initialization on hot reload
const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);

export const db = getFirestore(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Analytics only runs in web/production (not in Expo Go)
export const analyticsPromise = isSupported().then(yes => yes ? getAnalytics(app) : null);

export const COLLECTIONS = {
  MATCHES: 'matches',
  PLAYERS: 'players',
  TOURNAMENTS: 'tournaments',
  CAST_SESSIONS: 'castSessions',
};

export const MATCH_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
};

export const MATCH_TYPE = {
  SINGLES: 'singles',
  DOUBLES: 'doubles',
};

// TV cast base URL — update after you deploy to Firebase Hosting
export const CAST_BASE_URL = 'https://paddlepoint-ff045.web.app';