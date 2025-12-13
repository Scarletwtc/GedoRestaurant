// Firebase core and product SDKs we need
import { initializeApp } from "firebase/app";
import {
  getAnalytics,
  isSupported as analyticsSupported,
} from "firebase/analytics";
// If later you want auth / firestore / storage just import here.

// --- Firebase configuration ---
// NOTE: keep these values in env vars for production builds; hard-coded for demo simplicity.
const firebaseConfig = {
  apiKey: "AIzaSyC278L4gL5-T6BqoWgiPIqvBX_gKssDDlA",
  authDomain: "gedo-restaurant.firebaseapp.com",
  projectId: "gedo-restaurant",
  storageBucket: "gedo-restaurant.firebasestorage.app",
  messagingSenderId: "892196940436",
  appId: "1:892196940436:web:4645b8aff9a7e3ad0ea281",
  measurementId: "G-7P8H1KGKSP",
};

// Initialize Firebase App (singleton)
const app = initializeApp(firebaseConfig);

// Initialize Analytics only when supported (avoids errors in unsupported environments)
let analytics = null;
if (typeof window !== "undefined") {
  analyticsSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics };
