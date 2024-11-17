declare module "../services/firebaseConfig" {
    import { FirebaseApp } from "firebase/app";
    import { Firestore } from "firebase/firestore";
    import { Analytics } from "firebase/analytics";
  
    const app: FirebaseApp;
    const db: Firestore;
    const analytics: Analytics;
  
    export { app, db, analytics };
  }
  