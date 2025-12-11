import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

// TODO: Replace with your Firebase project configuration
// Get these values from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: 'AIzaSyBuj0jZtJSKZyAG_4tn7A2O63VXXdK-D_A',
  authDomain: 'habit-maker-3195e.firebaseapp.com',
  projectId: 'habit-maker-3195e',
  storageBucket: 'habit-maker-3195e.firebasestorage.app',
  messagingSenderId: '341215315958',
  appId: 'G-VL9CESWYQM',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication
export const auth = getAuth(app)

// Initialize Firestore with offline persistence
// This automatically caches data locally (IndexedDB) for fast loads and offline support
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
})

export default app
