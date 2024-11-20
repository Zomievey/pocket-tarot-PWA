import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./firebaseConfig";
import { FirebaseError } from "firebase/app";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

type AuthContextType = {
  user: any;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateJournalAccess: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const isInAppBrowser = () => {
  const userAgent = navigator.userAgent || window.navigator.userAgent;
  return /Instagram|FBAN|FBAV|LinkedIn|Twitter/.test(userAgent);
};


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle auth state change and fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        // Ensure Firestore document exists for the user
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: currentUser.email,
            hasUnlimitedAccess: false,
            entryCount: 0,
          });
        }
      }
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Handle Google login
  const googleLogin = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();

      if (isInAppBrowser()) {
        // Use redirect for in-app browsers
        await signInWithRedirect(auth, provider);
      } else {
        // Use popup for regular browsers
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Reference to the user's document in Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        // If user document does not exist, create one with default access
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: user.email,
            hasUnlimitedAccess: false,
            entryCount: 0,
          });
        }

        setUser(user);
      }
    } catch (error) {
      console.error("Failed Google login:", error);
      setError("Failed to log in with Google. Please try again.");
    }
  };

  // Handle the redirect result (for signInWithRedirect)
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;

          // Reference to the user's document in Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          // If user document does not exist, create one with default access
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              email: user.email,
              hasUnlimitedAccess: false,
              entryCount: 0,
            });
          }

          setUser(user);
        }
      } catch (error) {
        console.error("Failed to handle redirect result:", error);
        setError("Failed to log in after redirect. Please try again.");
      }
    };

    handleRedirectResult();
  }, []);

  // Email/password login
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      // Check if user document exists, if not, create one
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email,
          hasUnlimitedAccess: false,
          entryCount: 0,
        });
      }

      setUser(userCredential.user);
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to log in. Please check your credentials.");
    }
  };

  // Register user with email/password
  const register = async (email: string, password: string) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;
      await setDoc(doc(db, "users", userId), {
        email,
        hasUnlimitedAccess: false,
        entryCount: 0,
      });
      setUser(userCredential.user);
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/email-already-in-use":
            setError("This email is already registered.");
            break;
          case "auth/weak-password":
            setError("Password should be at least 6 characters.");
            break;
          case "auth/invalid-email":
            setError("Please enter a valid email address.");
            break;
          default:
            setError("An error occurred. Please try again.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  // Update journal access
  const updateJournalAccess = React.useCallback(async () => {
    if (user?.uid) {
      try {
        await updateDoc(doc(db, "users", user.uid), { hasUnlimitedAccess: true });
      } catch (error) {
        console.error("Failed to update journal access:", error);
      }
    }
  }, [user?.uid]);

  // Logout
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
      setError("Failed to log out. Please try again.");
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setError("Failed to send password reset email. Please try again.");
    }
  };

  const value = React.useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      register,
      googleLogin,
      logout,
      resetPassword,
      updateJournalAccess,
    }),
    [user, loading, error, updateJournalAccess]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
