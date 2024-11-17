// PaymentContext.tsx

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { db } from "./firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

type PaymentContextType = {
  handlePaymentSuccess: () => Promise<void>;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayments = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayments must be used within a PaymentProvider");
  }
  return context;
};

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  const handlePaymentSuccess = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const userRef = doc(db, "users", user.uid);

      // Grant unlimited access
      await updateDoc(userRef, {
        hasUnlimitedAccess: true,
      });

      // No need to call fetchUserAccess here

      // Display success notification
      toast.success(
        "Payment successful! You now have unlimited journal access."
      );
    } catch (err) {
      console.error("Error handling payment success:", err);
      toast.error(
        "Payment was successful, but there was an issue updating your access. Please refresh the page."
      );
    }
  }, [user?.uid]);

  const value = useMemo(
    () => ({ handlePaymentSuccess }),
    [handlePaymentSuccess]
  );

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
};
