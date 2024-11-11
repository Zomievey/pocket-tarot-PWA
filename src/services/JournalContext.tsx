import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useAuth } from "./AuthContext";

type JournalEntry = {
  id?: string;
  type: "Card of the Day" | "Three Card Reading" | "Five Card Reading";
  timestamp: number;
  userId: string;
  cards: {
    image: string;
    title: string;
  }[];
  notes: string;
};

export const JournalContext = createContext<{
  journalEntries: JournalEntry[];
  addEntry: (
    entry: Omit<JournalEntry, "timestamp" | "userId">
  ) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateEntry: (
    id: string,
    updatedData: Partial<JournalEntry>
  ) => Promise<void>;
  fetchUserEntries: () => Promise<void>;
  loading: boolean;
  error: string | null;
  hasAccess: boolean;
}>({
  journalEntries: [],
  addEntry: async () => {},
  deleteEntry: async () => {},
  updateEntry: async () => {},
  fetchUserEntries: async () => {},
  loading: false,
  error: null,
  hasAccess: false,
});

export const useJournal = () => useContext(JournalContext);

export const JournalProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [userEntryCount, setUserEntryCount] = useState(0);

  useEffect(() => {
    const checkUserAccess = async () => {
      if (user?.uid) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userAccess =
          userDoc.exists() && userDoc.data()?.hasJournalAccess === true;
        setHasAccess(userAccess);
      }
    };
    checkUserAccess();
  }, [user]);

  const fetchUserEntries = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "journalEntries"));
      const userEntries = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as JournalEntry),
        }))
        .filter((entry) => entry.userId === user.uid);

      setJournalEntries(userEntries);
      setUserEntryCount(userEntries.length);

      if (userEntries.length > 0 && !hasAccess) {
        setError("Upgrade to add more entries.");
      }
    } catch (err) {
      setError("Failed to load journal entries.");
      console.error("Error fetching entries:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, hasAccess]);

  const addEntry = useCallback(
    async (entry: Omit<JournalEntry, "timestamp" | "userId">) => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        // Check if this is the first entry
        if (
          userEntryCount === 0 &&
          userDoc.exists() &&
          userDoc.data()?.hasJournalAccess
        ) {
          const docRef = await addDoc(collection(db, "journalEntries"), {
            ...entry,
            userId: user.uid,
            timestamp: Timestamp.now(),
          });
          setJournalEntries([
            {
              id: docRef.id,
              ...entry,
              userId: user.uid,
              timestamp: Timestamp.now().toMillis(),
            },
            ...journalEntries,
          ]);

          // Update Firestore and local state for access after first entry
          await updateDoc(userRef, { hasJournalAccess: false });
          setHasAccess(false); // Reflect access change in local state
          setUserEntryCount((prevCount) => prevCount + 1);

          // Set error to prompt user to upgrade
          setError("Upgrade to add more entries.");
        } else if (hasAccess) {
          // Allow adding new entries if user has paid access
          const docRef = await addDoc(collection(db, "journalEntries"), {
            ...entry,
            userId: user.uid,
            timestamp: Timestamp.now(),
          });
          setJournalEntries([
            {
              id: docRef.id,
              ...entry,
              userId: user.uid,
              timestamp: Timestamp.now().toMillis(),
            },
            ...journalEntries,
          ]);
          setUserEntryCount((prevCount) => prevCount + 1);
        } else {
          setError("Please upgrade to add more entries.");
        }
      } catch (err) {
        setError("Failed to add journal entry.");
        console.error("Error adding entry:", err);
      }
    },
    [journalEntries, user?.uid, hasAccess, userEntryCount]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      if (!user?.uid) return;
  
      try {
        // Delete the journal entry in Firestore
        await deleteDoc(doc(db, "journalEntries", id));
  
        // Update the local journal entries state
        setJournalEntries((prevEntries) => {
          const updatedEntries = prevEntries.filter((entry) => entry.id !== id);
  
          // Update entry count based on updated entries
          const newEntryCount = updatedEntries.length;
          setUserEntryCount(newEntryCount);
  
          // Reset hasJournalAccess if no entries remain
          if (newEntryCount === 0) {
            updateDoc(doc(db, "users", user.uid), { hasJournalAccess: true });
            setHasAccess(true);
          }
  
          return updatedEntries;
        });
      } catch (err) {
        setError("Failed to delete journal entry.");
        console.error("Error deleting entry:", err);
      }
    },
    [user?.uid]
  );
  
  const updateEntry = useCallback(
    async (id: string, updatedData: Partial<JournalEntry>) => {
      try {
        const entryRef = doc(db, "journalEntries", id);
        await updateDoc(entryRef, updatedData);
  
        // Update local state for the edited entry
        setJournalEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.id === id ? { ...entry, ...updatedData } : entry
          )
        );
      } catch (err) {
        setError("Failed to update journal entry.");
        console.error("Error updating entry:", err);
      }
    },
    []
  );
  

  const value = useMemo(
    () => ({
      journalEntries,
      addEntry,
      deleteEntry,
      updateEntry,
      fetchUserEntries,
      loading,
      error,
      hasAccess,
    }),
    [
      journalEntries,
      addEntry,
      deleteEntry,
      updateEntry,
      fetchUserEntries,
      loading,
      error,
      hasAccess,
    ]
  );

  return (
    <JournalContext.Provider value={value}>{children}</JournalContext.Provider>
  );
};
