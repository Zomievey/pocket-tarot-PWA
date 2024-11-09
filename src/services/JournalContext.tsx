import React, {
  createContext,
  useContext,
  useState,
  useEffect,
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

type JournalEntry = {
    id?: string; // Firestore document ID
    type: "Card of the Day" | "Three Card Reading" | "Five Card Reading";
    timestamp: number;
    cards: { // Use an array of cards to support multi-card readings
      image: string;
      title: string;
    }[];
    notes: string;
  };
  

export const JournalContext = createContext<{
  journalEntries: JournalEntry[];
  addEntry: (entry: JournalEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateEntry: (
    id: string,
    updatedData: Partial<JournalEntry>
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
}>({
  journalEntries: [],
  addEntry: async () => {},
  deleteEntry: async () => {},
  updateEntry: async () => {},
  loading: false,
  error: null,
});

export const useJournal = () => useContext(JournalContext);

export const JournalProvider = ({ children }: { children: ReactNode }) => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch entries from Firestore on component mount
  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "journalEntries"));
        const entries = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Store Firestore document ID
          ...doc.data(),
        })) as JournalEntry[];
        setJournalEntries(entries);
      } catch (err) {
        setError("Failed to load journal entries.");
        console.error("Error fetching entries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const addEntry = useCallback(
    async (entry: Omit<JournalEntry, "timestamp">) => {
      // Exclude 'timestamp' from input entry type
      try {
        const docRef = await addDoc(collection(db, "journalEntries"), {
          ...entry,
          timestamp: Timestamp.now(), // Set timestamp here
        });
        setJournalEntries([
          { id: docRef.id, ...entry, timestamp: Timestamp.now().toMillis() },
          ...journalEntries,
        ]); // Add entry with ID and timestamp in milliseconds
      } catch (err) {
        setError("Failed to add journal entry.");
        console.error("Error adding entry:", err);
      }
    },
    [journalEntries]
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
      loading,
      error,
    }),
    [journalEntries, addEntry, deleteEntry, updateEntry, loading, error]
  );

  return (
    <JournalContext.Provider value={value}>{children}</JournalContext.Provider>
  );
};
