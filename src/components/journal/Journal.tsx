import React, { useState } from "react";
import { useJournal } from "../../services/JournalContext";
import "./JournalStyles.css";
import { useNavigate } from "react-router-dom";
import { Timestamp } from "firebase/firestore";

export default function Journal() {
  const { journalEntries, deleteEntry, updateEntry } = useJournal();
  const [editingIndex, setEditingIndex] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<string>("");

  // Filter state
  const [filterType, setFilterType] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [showFilter, setShowFilter] = useState(false); // State for toggling modal visibility

  const backgroundImage = "/assets/images/main-background.png";
  const navigate = useNavigate();

  // Helper function to check if a value is a Firestore Timestamp
  const isFirestoreTimestamp = (value: any): value is Timestamp => {
    return value instanceof Timestamp;
  };

  // Convert entry timestamp to a JavaScript Date for comparison
  const convertTimestamp = (timestamp: number | Timestamp) =>
    isFirestoreTimestamp(timestamp) ? timestamp.toDate() : new Date(timestamp);

  // Apply filters to journal entries
  const filteredEntries = journalEntries.filter((entry) => {
    const entryDate = convertTimestamp(entry.timestamp);

    // Check type filter
    if (filterType && entry.type !== filterType) return false;

    // Check date range filter
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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this entry?"
    );
    if (confirmDelete) {
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
      <button className='backButton' onClick={() => navigate("/")}>
        Home
      </button>

      {/* Conditionally render the filter button only if there are entries */}
      {journalEntries.length > 0 && (
        <button
          className='filter-button'
          onClick={() => setShowFilter(!showFilter)}
        >
          Filter<br/>Entries
        </button>
      )}

      {/* Modal overlay */}
      <div
        className={`modal-overlay ${showFilter ? "active" : ""}`}
        onClick={() => setShowFilter(false)} // Close modal when clicking on overlay
      />

      {/* Filter modal container */}
      <div className={`filter-container ${showFilter ? "active" : ""}`}>
        {/* Close button */}
        <button className='modal-close' onClick={() => setShowFilter(false)}>
          &times;
        </button>

        <div>
          <label>Type:</label>
          <select
            title='type'
            value={filterType || ""}
            onChange={(e) => setFilterType(e.target.value || null)}
          >
            <option value=''>All</option>
            <option value='Card of the Day'>Card of the Day</option>
            <option value='Three Card Reading'>Three Card Reading</option>
            <option value='Five Card Reading'>Five Card Reading</option>
          </select>
        </div>
        <div>
          <label>Start Date:</label>
          <input
            title='start date'
            type='date'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label>End Date:</label>
          <input
            title='end date'
            type='date'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button
          className='filterButton'
          onClick={() => {
            setFilterType(null);
            setStartDate("");
            setEndDate("");
          }}
        >
          Clear Filters
        </button>
      </div>

      <div className='journal-container'>
        <h1 className='journal-title'>Your Journal</h1>
        {filteredEntries.length === 0 ? (
          <p>No journal entries yet. Save a card reading to see it here!</p>
        ) : (
          filteredEntries.map((entry) => (
            <div className='journal-entry'>
              <h2 className='journal-entry-title'>{entry.type} Reading</h2>
              <p>
                {(isFirestoreTimestamp(entry.timestamp)
                  ? entry.timestamp.toDate()
                  : new Date(entry.timestamp)
                ).toLocaleDateString()}{" "}
                {(isFirestoreTimestamp(entry.timestamp)
                  ? entry.timestamp.toDate()
                  : new Date(entry.timestamp)
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <div className='card-group'>
                {entry.cards &&
                  entry.cards.map((card, index) => (
                    <div key={index} className='card-image-container'>
                      <img
                        src={card.image}
                        alt={card.title}
                        className='card-image'
                      />
                      <p>{card.title}</p>
                    </div>
                  ))}
              </div>

              {/* Notes and buttons */}
              {editingIndex === entry.id ? (
                <div>
                  <textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder='Add notes about your reading...'
                    className='notes-textarea'
                  />
                  <button
                    onClick={() => handleSave(entry.id!)}
                    className='btn-save'
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className='entry'>
                  <p>{entry.notes || "No notes yet."}</p>
                  <button
                    onClick={() => handleEdit(entry.id!, entry.notes || "")}
                    className='btn-edit'
                  >
                    Edit Notes
                  </button>
                </div>
              )}
              <button
                onClick={() => handleDelete(entry.id!)}
                className='btn-delete'
              >
                Delete Entry
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
