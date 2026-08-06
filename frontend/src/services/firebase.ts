import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'

// Firebase web config — public by design (safe to ship in the browser bundle).
// Override any value via VITE_FIREBASE_* env vars if you create a new project.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBoI28x57TmLs7q8L4I4p8ngLVOtHSTs18',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'elephant-67342.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'elephant-67342',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'elephant-67342.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '343580456336',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:343580456336:web:7ebb8516e50e3675166f15',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-9G4JCPK8NJ',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export { auth }

export async function firebaseSignIn(email: string, password: string): Promise<string> {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user.getIdToken()
}

export async function firebaseSignUp(email: string, password: string): Promise<{ idToken: string; uid: string }> {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  return { idToken: await cred.user.getIdToken(), uid: cred.user.uid }
}

export function firebaseSignOut(): void {
  signOut(auth).catch(() => {
    /* ignore */
  })
}
