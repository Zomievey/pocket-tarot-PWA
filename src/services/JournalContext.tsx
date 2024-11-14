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

  // Check user access and set initial entry count on component mount
  useEffect(() => {
    const checkUserAccess = async () => {
      if (user?.uid) {
        setLoading(true);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setHasAccess(userData.hasJournalAccess === true);
            setUserEntryCount(userData.entryCount || 0); // Set the initial entry count
          }
        } catch (error) {
          console.error("Error fetching user access data:", error);
          setError("Failed to verify user access.");
        } finally {
          setLoading(false);
        }
      }
    };
    checkUserAccess();
  }, [user]);

  // Fetch user's journal entries only when access has been verified
  const fetchUserEntries = useCallback(async () => {
    if (!user?.uid) return;
    console.log(user.uid); // Debugging log
    console.log(hasAccess); // Debugging log

    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "journalEntries"));
      const userEntries = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as JournalEntry),
        }))
        .filter((entry) => entry.userId === user.uid);

      console.log("Fetched entries:", userEntries); // Debugging log
      setJournalEntries(userEntries);
      setUserEntryCount(userEntries.length);
      setError(null);
    } catch (err) {
      setError("Failed to load journal entries.");
      console.error("Error fetching entries:", err);
    } finally {
      setLoading(false);
    }
  }, [hasAccess, user?.uid]);

  // Trigger fetching journal entries only after access is confirmed
  useEffect(() => {
    if (user?.uid && hasAccess) {
      fetchUserEntries();
    }
  }, [fetchUserEntries, user?.uid, hasAccess]);

  // Add a journal entry
  const addEntry = useCallback(
    async (entry: Omit<JournalEntry, "timestamp" | "userId" | "id">) => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        const currentEntryCount = userEntryCount || userData?.entryCount || 0;

        // Check access and limit
        if (userData?.hasJournalAccess || currentEntryCount < 3) {
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

          // Update client-side state
          setJournalEntries([newEntry, ...journalEntries]);

          // Update entry count in Firestore and locally
          const updatedEntryCount = currentEntryCount + 1;
          await updateDoc(userRef, { entryCount: updatedEntryCount });
          setUserEntryCount(updatedEntryCount);
          setError(null);
        } else {
          setError("Please upgrade to add more entries.");
        }
      } catch (err) {
        setError("Failed to add journal entry.");
        console.error("Error adding entry:", err);
      }
    },
    [journalEntries, user?.uid, userEntryCount]
  );

  // Delete a journal entry
  const deleteEntry = useCallback(
    async (id: string) => {
      if (!user?.uid) return;

      try {
        // Fetch the user document to get the current entry count
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        // Delete the journal entry
        await deleteDoc(doc(db, "journalEntries", id));

        // Update client-side state
        setJournalEntries((prevEntries) =>
          prevEntries.filter((entry) => entry.id !== id)
        );

        // Decrement entry count in Firestore
        const newEntryCount = Math.max((userData?.entryCount ?? 1) - 1, 0);
        await updateDoc(userRef, {
          entryCount: newEntryCount,
        });

        // Update local state to reflect the new entry count
        setUserEntryCount(newEntryCount);
        setError(null);
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
