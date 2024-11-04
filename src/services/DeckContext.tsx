import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Define the shape of the context
type DeckContextType = {
  cardBack: string;
  setCardBack: (newCardBack: string) => void;
};

// Create the context
const DeckContext = createContext<DeckContextType | undefined>(undefined);

// Custom hook to access the DeckContext
export const useDeck = () => {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error("useDeck must be used within a DeckProvider");
  }
  return context;
};

// DeckProvider component
export const DeckProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Default card back image URL
  const defaultCardBack = "/assets/images/back-card.png";

  // State to store the current card back image URL
  const [cardBack, setCardBack] = useState<string>(defaultCardBack);

  // Function to save card back to localStorage for persistence in the browser
  const saveCardBackToStorage = useCallback((newCardBack: string) => {
    try {
      localStorage.setItem("cardBack", newCardBack);
    } catch (error) {
      console.error("Error saving cardBack to localStorage:", error);
    }
  }, []);

  // Load card back from localStorage on component mount
  useEffect(() => {
    const loadCardBackFromStorage = () => {
      try {
        const storedCardBack = localStorage.getItem("cardBack");
        if (storedCardBack) {
          setCardBack(storedCardBack);
        }
      } catch (error) {
        console.error("Error loading cardBack from localStorage:", error);
      }
    };

    loadCardBackFromStorage();
  }, []);

  // Function to update the card back and save it to localStorage
  const updateCardBack = useCallback(
    (newCardBack: string) => {
      setCardBack(newCardBack);
      saveCardBackToStorage(newCardBack);
    },
    [saveCardBackToStorage]
  );

  // Memoized value for the context
  const value = React.useMemo(
    () => ({ cardBack, setCardBack: updateCardBack }),
    [cardBack, updateCardBack]
  );

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
};
