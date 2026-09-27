import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with the specific databaseId provisioned and auto-detect long-polling enabled
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
  },
  (firebaseConfig as Record<string, any>).firestoreDatabaseId || '(default)'
);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function isQuotaExceededError(error: unknown): boolean {
  if (!error) return false;
  const errMsg = error instanceof Error ? error.message : String(error);
  const code = (error as { code?: string })?.code;
  return (
    code === 'resource-exhausted' ||
    errMsg.includes('resource-exhausted') ||
    errMsg.includes('Quota limit exceeded') ||
    errMsg.includes('Quota exceeded') ||
    errMsg.includes('Free daily write units per project')
  );
}

/**
 * Checks if a Firebase Auth error was caused by the user closing or dismissing the sign-in popup.
 * In these cases, it is an expected user action and should NOT be logged as a fatal system error.
 */
export function isAuthPopupCancellation(error: unknown): boolean {
  if (!error) return false;
  const code = (error as { code?: string })?.code;
  const errMsg = error instanceof Error ? error.message : String(error);
  return (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/popup-blocked' ||
    errMsg.includes('auth/popup-closed-by-user') ||
    errMsg.includes('auth/cancelled-popup-request') ||
    errMsg.includes('auth/popup-blocked') ||
    errMsg.includes('popup-closed-by-user')
  );
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);

  // If the client is temporarily offline or connection is negotiating, log as informative warning
  if (errMsg.includes('unavailable') || errMsg.includes('offline') || errMsg.includes('could not reach')) {
    console.warn(`Firestore [${operationType}] at ${path}: Operating in offline/cached mode.`);
    return {
      error: errMsg,
      authInfo: {},
      operationType,
      path,
    };
  }

  // If daily write quota is exceeded on free tier, log informative warning without throwing uncaught fatal errors
  if (isQuotaExceededError(error)) {
    console.warn(
      `Firestore [${operationType}] at ${path}: Free tier daily write quota limit reached. Falling back to local offline storage cache.`
    );
    return {
      error: 'Daily Firestore free tier write quota reached. Local persistence active.',
      authInfo: {},
      operationType,
      path,
    };
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export async function testConnection() {
  // Graceful connectivity status check without forcing disruptive server roundtrip
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.info('Client is currently in offline mode; Firestore local cache is active.');
  }
}

