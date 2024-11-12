import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, Timestamp, getDoc } from "firebase/firestore";
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
  addEntry: (entry: Omit<JournalEntry, "timestamp" | "userId">) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateEntry: (id: string, updatedData: Partial<JournalEntry>) => Promise<void>;
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

  // Fetch access status on component mount or user change
  useEffect(() => {
    const checkUserAccess = async () => {
      if (user?.uid) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userAccess = userDoc.exists() && userDoc.data()?.hasJournalAccess === true;
        setHasAccess(userAccess);
      }
    };
    checkUserAccess();
  }, [user]);

  // Fetch user's journal entries
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
      setError(null); // Clear any existing error on successful fetch
    } catch (err) {
      setError("Failed to load journal entries.");
      console.error("Error fetching entries:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Add a journal entry
  const addEntry = useCallback(
    async (entry: Omit<JournalEntry, "timestamp" | "userId">) => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userEntryCount === 0 && userDoc.exists() && userDoc.data()?.hasJournalAccess) {
          // First entry for a free account
          const docRef = await addDoc(collection(db, "journalEntries"), {
            ...entry,
            userId: user.uid,
            timestamp: Timestamp.now(),
          });
          setJournalEntries([{ id: docRef.id, ...entry, userId: user.uid, timestamp: Timestamp.now().toMillis() }, ...journalEntries]);
          await updateDoc(userRef, { hasJournalAccess: false });
          setHasAccess(false);
          setUserEntryCount((prevCount) => prevCount + 1);
          setError("Upgrade to add more entries.");
        } else if (hasAccess) {
          // Paid access: allow adding new entries
          const docRef = await addDoc(collection(db, "journalEntries"), {
            ...entry,
            userId: user.uid,
            timestamp: Timestamp.now(),
          });
          setJournalEntries([{ id: docRef.id, ...entry, userId: user.uid, timestamp: Timestamp.now().toMillis() }, ...journalEntries]);
          setUserEntryCount((prevCount) => prevCount + 1);
          setError(null); // Clear any error if they have access
        } else {
          // No access
          setError("Please upgrade to add more entries.");
        }
      } catch (err) {
        setError("Failed to add journal entry.");
        console.error("Error adding entry:", err);
      }
    },
    [journalEntries, user?.uid, hasAccess, userEntryCount]
  );

  // Delete a journal entry
  const deleteEntry = useCallback(
    async (id: string) => {
      if (!user?.uid) return;

      try {
        await deleteDoc(doc(db, "journalEntries", id));
        setJournalEntries((prevEntries) => {
          const updatedEntries = prevEntries.filter((entry) => entry.id !== id);
          const newEntryCount = updatedEntries.length;
          setUserEntryCount(newEntryCount);

          // Reset access if no entries remain
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

  // Update a journal entry
  const updateEntry = useCallback(
    async (id: string, updatedData: Partial<JournalEntry>) => {
      try {
        const entryRef = doc(db, "journalEntries", id);
        await updateDoc(entryRef, updatedData);

        setJournalEntries((prevEntries) =>
          prevEntries.map((entry) => (entry.id === id ? { ...entry, ...updatedData } : entry))
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
    [journalEntries, addEntry, deleteEntry, updateEntry, fetchUserEntries, loading, error, hasAccess]
  );

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
};
