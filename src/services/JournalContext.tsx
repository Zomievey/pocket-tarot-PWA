// JournalContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useAuth } from "./AuthContext"; // Import AuthContext to access uid

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
  addEntry: (entry: Omit<JournalEntry, "timestamp" | "userId">) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateEntry: (id: string, updatedData: Partial<JournalEntry>) => Promise<void>;
  fetchUserEntries: () => Promise<void>;
  loading: boolean;
  error: string | null;
}>({
  journalEntries: [],
  addEntry: async () => {},
  deleteEntry: async () => {},
  updateEntry: async () => {},
  fetchUserEntries: async () => {},
  loading: false,
  error: null,
});

export const useJournal = () => useContext(JournalContext);

export const JournalProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth(); // Access the authenticated user
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserEntries = useCallback(async () => {
    if (!user?.uid) return; // Check if uid is available
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
    } catch (err) {
      setError("Failed to load journal entries.");
      console.error("Error fetching entries:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const addEntry = useCallback(
    async (entry: Omit<JournalEntry, "timestamp" | "userId">) => {
      if (!user?.uid) return; // Check if uid is available
      try {
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
      } catch (err) {
        setError("Failed to add journal entry.");
        console.error("Error adding entry:", err);
      }
    },
    [journalEntries, user?.uid]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        await deleteDoc(doc(db, "journalEntries", id));
        setJournalEntries(journalEntries.filter((entry) => entry.id !== id));
      } catch (err) {
        setError("Failed to delete journal entry.");
        console.error("Error deleting entry:", err);
      }
    },
    [journalEntries]
  );

  const updateEntry = useCallback(
    async (id: string, updatedData: Partial<JournalEntry>) => {
      try {
        const entryRef = doc(db, "journalEntries", id);
        await updateDoc(entryRef, updatedData);
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
    }),
    [
      journalEntries,
      addEntry,
      deleteEntry,
      updateEntry,
      fetchUserEntries,
      loading,
      error,
    ]
  );

  return (
    <JournalContext.Provider value={value}>{children}</JournalContext.Provider>
  );
};
