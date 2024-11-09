import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth"; // Import Firebase Auth

const firebaseConfig = {
  apiKey: "AIzaSyC7wi4fIl8fqypqcxkTxPQip9XtA4fl90Y",
  authDomain: "pocket-tarot-eb6da.firebaseapp.com",
  projectId: "pocket-tarot-eb6da",
  storageBucket: "pocket-tarot-eb6da.firebasestorage.app",
  messagingSenderId: "1067453739489",
  appId: "1:1067453739489:web:d7f76b1087cdfc303622a0",
  measurementId: "G-0FVZCVMMWE"
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const analytics: Analytics = getAnalytics(app);
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app); // Initialize Firebase Auth

export { app, db, analytics, auth }; // Export auth so you can use it in your app
