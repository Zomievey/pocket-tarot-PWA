// PaymentContext.tsx
import React, { createContext, useContext } from "react";
import { getApp } from "firebase/app";
import { getStripePayments, createCheckoutSession } from "@invertase/firestore-stripe-payments";
import { loadStripe } from "@stripe/stripe-js";

// Load Stripe with the publishable key from the environment
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

// Initialize Firebase app and Stripe payments
const app = getApp();
const payments = getStripePayments(app, {
  productsCollection: "products",
  customersCollection: "customers",
});


// Define the context type with a properly typed createCheckoutSession function
type PaymentContextType = {
  createCheckoutSession: (priceId: string) => Promise<{ url: string }>;
  stripePromise: ReturnType<typeof loadStripe>;
};
console.log("Payments object:", payments);
// Wrapper function to create a checkout session
const initiateCheckoutSession = async (priceId: string) => {
  if (!priceId) {
    throw new Error("Stripe price ID is missing.");
  }

  console.log("Creating checkout session with price ID:", priceId);

  try {
    const session = await createCheckoutSession(payments, {
      price: priceId,
      success_url: window.location.href,
      cancel_url: window.location.href,
      mode: 'payment'
    });
    console.log("Checkout session created:", session);
    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};


const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayments = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayments must be used within a PaymentProvider");
  }
  return context;
};

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PaymentContext.Provider value={{ createCheckoutSession: initiateCheckoutSession, stripePromise }}>
      {children}
    </PaymentContext.Provider>
  );
};
