import React, { useState, useEffect } from "react";
import { useJournal } from "../../services/JournalContext";
import { useAuth } from "../../services/AuthContext";
import { usePayments } from "../../services/PaymentContext";
import "./JournalStyles.css";
import { useNavigate } from "react-router-dom";
import { Timestamp } from "firebase/firestore";

export default function Journal() {
  const { user } = useAuth();
  const userId = user?.uid;
  const { journalEntries, deleteEntry, updateEntry, fetchUserEntries, hasAccess } = useJournal();
  const { createCheckoutSession } = usePayments();
  const [editingIndex, setEditingIndex] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<string>("");

  const [filterType, setFilterType] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);

  const backgroundImage = "/assets/images/main-background.png";
  const navigate = useNavigate();

  const isFirestoreTimestamp = (timestamp: any): timestamp is Timestamp => {
    return timestamp && typeof timestamp === "object" && "seconds" in timestamp && "nanoseconds" in timestamp;
  };

  const convertTimestamp = (timestamp: any): Date => {
    return isFirestoreTimestamp(timestamp) ? timestamp.toDate() : new Date(timestamp);
  };

  useEffect(() => {
    if (userId) {
      fetchUserEntries();
    }
  }, [fetchUserEntries, userId]);

  const handleCheckout = async () => {
    try {
      const session = await createCheckoutSession("price_1QJiEmLPtdwjp995NBM99LB0");
      if (session && session.url) {
        window.location.href = session.url;
      } else {
        console.error("Failed to retrieve session URL");
      }
    } catch (error) {
      console.error("Error initiating checkout:", error);
    }
  };

  const filteredEntries = journalEntries.filter((entry) => {
    if (entry.userId !== userId) return false;
    const entryDate = convertTimestamp(entry.timestamp);

    if (filterType && entry.type !== filterType) return false;
    if (startDate && new Date(startDate) > entryDate) return false;
    if (endDate && new Date(endDate) < entryDate) return false;

    return true;
  });

  const handleEdit = (id: string, notes: string) => {
    setEditingIndex(id);
    setCurrentNote(notes);
  };

  const handleSave = async (id: string) => {
    if (editingIndex !== null) {
      await updateEntry(id, { notes: currentNote });
      setEditingIndex(null);
      setCurrentNote("");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      deleteEntry(id);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <button className="backButton" onClick={() => navigate("/")}>
        Home
      </button>

      {filteredEntries.length > 0 && (
        <button
          className="filter-button"
          onClick={() => setShowFilter(!showFilter)}
        >
          Filter Entries
        </button>
      )}

      {showFilter && (
        <div
          className="modal-overlay-journal active"
          onClick={() => setShowFilter(false)}
        />
      )}

      <div className={`filter-container ${showFilter ? "active" : ""}`}>
        <button
          className="modal-journal-close"
          onClick={() => setShowFilter(false)}
        >
          &times;
        </button>
        <div>
          <label>Type:</label>
          <select
            title="type"
            value={filterType || ""}
            onChange={(e) => setFilterType(e.target.value || null)}
          >
            <option value="">All</option>
            <option value="Card of the Day">Card of the Day</option>
            <option value="Three Card Reading">Three Card Reading</option>
            <option value="Five Card Reading">Five Card Reading</option>
          </select>
        </div>
        <div>
          <label>Start Date:</label>
          <input
            title="start date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label>End Date:</label>
          <input
            title="end date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button
          className="filterButton"
          onClick={() => {
            setFilterType(null);
            setStartDate("");
            setEndDate("");
          }}
        >
          Clear Filters
        </button>
      </div>

      <div className="journal-container">
        <h1 className="journal-title">Your Journal</h1>
        {filteredEntries.length === 0 ? (
          <p>No journal entries yet. Save a card reading to see it here!</p>
        ) : (
          filteredEntries.map((entry) => (
            <div className="journal-entry" key={entry.id}>
              <h2 className="journal-entry-title">{entry.type} Reading</h2>
              <p>
                {convertTimestamp(entry.timestamp).toLocaleDateString()}
              </p>
              <div className="card-group">
                {entry.cards?.map((card, index) => (
                  <div key={index} className="card-image-container">
                    <img src={card.image} alt={card.title} className="card-image" />
                    <p>{card.title}</p>
                  </div>
                ))}
              </div>
              {editingIndex === entry.id ? (
                <div>
                  <textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="Add notes about your reading..."
                    className="notes-textarea"
                  />
                  <button onClick={() => handleSave(entry.id!)} className="btn-save">
                    Save
                  </button>
                </div>
              ) : (
                <div className="entry">
                  <p>{entry.notes || "No notes yet."}</p>
                  <button onClick={() => handleEdit(entry.id!, entry.notes || "")} className="btn-edit">
                    Edit Notes
                  </button>
                </div>
              )}
              <button onClick={() => handleDelete(entry.id!)} className="btn-delete">
                Delete Entry
              </button>
            </div>
          ))
        )}

        {/* Show Get Access button only after the first journal entry */}
        {!hasAccess && filteredEntries.length === 1 && (
          <div className="no-access-container">
            <h2>Unlock Full Journal Access</h2>
            <p>Access more entries for $2.99 USD</p>
            <button className='btn-delete' onClick={handleCheckout}>Get Access</button>
          </div>
        )}
      </div>
    </div>
  );
}
