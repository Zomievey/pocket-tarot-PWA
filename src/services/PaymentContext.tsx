import React, { createContext, useContext } from "react";
import { db } from "./firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext"; 

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

// PaymentProvider component
export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  // Update the user's journal access upon successful payment
  const handlePaymentSuccess = async () => {
    if (user?.uid) {
      try {
        await updateDoc(doc(db, "users", user.uid), { hasJournalAccess: true });
        console.log("User access updated to full access after payment.");
      } catch (error) {
        console.error("Error updating journal access after payment:", error);
      }
    }
  };

  return (
    <PaymentContext.Provider value={{ handlePaymentSuccess }}>
      {children}
    </PaymentContext.Provider>
  );
};
