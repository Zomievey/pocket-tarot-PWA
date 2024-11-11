import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebaseConfig";
import { FirebaseError } from "firebase/app";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore"; // Removed getDoc
import { db } from "./firebaseConfig";

type AuthContextType = {
  user: any;
  loading: boolean;
  error: string | null; // Added error here
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateJournalAccess: () => Promise<void>; // New function to update access
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to log in. Please check your credentials.");
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      await setDoc(doc(db, "users", userId), { email, hasJournalAccess: true });
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

  const updateJournalAccess = async () => {
    if (user?.uid) {
      try {
        await updateDoc(doc(db, "users", user.uid), { hasJournalAccess: true });
      } catch (error) {
        console.error("Failed to update journal access:", error);
      }
    }
  };

  const googleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error("Failed Google login:", error);
      setError("Failed to log in with Google. Please try again.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
      setError("Failed to log out. Please try again.");
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        googleLogin,
        logout,
        resetPassword,
        updateJournalAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
