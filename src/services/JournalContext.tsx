// JournalContext.tsx

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
  query,
  where,
  onSnapshot,
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
    description: string;
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
  hasUnlimitedAccess: boolean;
  entryCount: number;
}>({
  journalEntries: [],
  addEntry: async () => {},
  deleteEntry: async () => {},
  updateEntry: async () => {},
  fetchUserEntries: async () => {},
  hasUnlimitedAccess: false,
  loading: false,
  error: null,
  hasAccess: false,
  entryCount: 0,
});

export const useJournal = () => useContext(JournalContext);

export const JournalProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [entryCount, setEntryCount] = useState<number>(0);
  const [hasUnlimitedAccess, setHasUnlimitedAccess] = useState(false);

  // Set up a real-time listener for the user document
  useEffect(() => {
    if (user?.uid) {
      const userDocRef = doc(db, "users", user.uid);

      const unsubscribe = onSnapshot(userDocRef, (userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("User data:", userData); // For debugging

          const unlimitedAccess = Boolean(userData.hasUnlimitedAccess);
          console.log("Setting hasUnlimitedAccess to:", unlimitedAccess);
          setHasAccess(unlimitedAccess || (userData.entryCount || 0) < 3);
          setHasUnlimitedAccess(unlimitedAccess);
          setEntryCount(userData.entryCount || 0);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  const fetchUserEntries = useCallback(async () => {
    if (!user?.uid) return;
    console.log("Fetching user entries...", user.uid);

    setLoading(true);
    try {
      // Use Firestore query to fetch only the user's journal entries
      const userEntriesQuery = query(
        collection(db, "journalEntries"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(userEntriesQuery);
      const userEntries = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as JournalEntry),
      }));

      setJournalEntries(userEntries);
      console.log("Fetched Journal Entries:", userEntries);
      setError(null);
    } catch (err) {
      setError("Failed to load journal entries.");
      console.error("Error fetching entries:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const addEntry = useCallback(
    async (entry: Omit<JournalEntry, "timestamp" | "userId" | "id">) => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          throw new Error("User document does not exist.");
        }

        const userData = userDoc.data();
        const currentEntryCount = userData.entryCount || 0;

        // Determine if the user can add an entry
        const canAddEntry =
          userData.hasUnlimitedAccess || currentEntryCount < 3;

        if (canAddEntry) {
          // Add the journal entry
          const docRef = await addDoc(collection(db, "journalEntries"), {
            ...entry,
            userId: user.uid,
            timestamp: Timestamp.now(),
          });

          const newEntry: JournalEntry = {
            id: docRef.id,
            ...entry,
            userId: user.uid,
            timestamp: Timestamp.now().toMillis(),
          };

          setJournalEntries([newEntry, ...journalEntries]);

          // Always increment entryCount
          const updatedEntryCount = currentEntryCount + 1;
          await updateDoc(userRef, { entryCount: updatedEntryCount });
          setEntryCount(updatedEntryCount); // Update local state

          // Toggle access off if the user reaches 3 entries and hasn't purchased unlimited access
          if (!userData.hasUnlimitedAccess && updatedEntryCount >= 3) {
            setHasAccess(false);
          }

          setError(null);
        } else {
          setError(
            "You have reached the maximum of 3 entries. Please upgrade to get unlimited access."
          );
        }
      } catch (err) {
        setError("Failed to add journal entry.");
        console.error("Error adding entry:", err);
      }
    },
    [journalEntries, user?.uid]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          throw new Error("User document does not exist.");
        }

        const userData = userDoc.data();
        const currentEntryCount = userData.entryCount || 0;

        // Delete the journal entry
        await deleteDoc(doc(db, "journalEntries", id));

        // Update local state
        setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));

        // Decrement entryCount
        const newEntryCount = Math.max(currentEntryCount - 1, 0);
        await updateDoc(userRef, { entryCount: newEntryCount });
        setEntryCount(newEntryCount); // Update local state

        // If user hasn't purchased unlimited access and entryCount is now less than 3, grant access
        if (!userData.hasUnlimitedAccess && newEntryCount < 3) {
          setHasAccess(true);
        }

        setError(null);
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

        setJournalEntries((prev) =>
          prev.map((entry) =>
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
      hasUnlimitedAccess,
      entryCount,
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
      hasUnlimitedAccess,
      entryCount,
    ]
  );

  return (
    <JournalContext.Provider value={value}>{children}</JournalContext.Provider>
  );
};
