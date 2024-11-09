import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";

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

export { app, db, analytics };
