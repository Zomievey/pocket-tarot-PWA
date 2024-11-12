import React, { useState, useEffect } from "react";
import { useJournal } from "../../services/JournalContext";
import { useAuth } from "../../services/AuthContext";
import { usePayments } from "../../services/PaymentContext";
import "./JournalStyles.css";
import { useNavigate } from "react-router-dom";
import { Timestamp } from "firebase/firestore";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

declare global {
  interface Window {
    paypal: any;
  }
}

const Journal = () => {
  const { user } = useAuth();
  const userId = user?.uid;
  const {
    journalEntries,
    deleteEntry,
    updateEntry,
    fetchUserEntries,
    hasAccess,
  } = useJournal();
  const { handlePaymentSuccess } = usePayments();
  const [editingIndex, setEditingIndex] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<string>("");

  const [filterType, setFilterType] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  const backgroundImage = "/assets/images/main-background.png";
  const navigate = useNavigate();

  const isFirestoreTimestamp = (timestamp: any): timestamp is Timestamp => {
    return (
      timestamp &&
      typeof timestamp === "object" &&
      "seconds" in timestamp &&
      "nanoseconds" in timestamp
    );
  };

  const convertTimestamp = (timestamp: any): Date => {
    return isFirestoreTimestamp(timestamp)
      ? timestamp.toDate()
      : new Date(timestamp);
  };

  useEffect(() => {
    if (userId) {
      fetchUserEntries();
    }
  }, [fetchUserEntries, userId]);

  const filteredEntries = journalEntries.filter((entry) => {
    if (entry.userId !== userId) return false;
    const entryDate = convertTimestamp(entry.timestamp);

    if (filterType && entry.type !== filterType) return false;
    if (startDate && startDate > entryDate) return false;
    if (endDate && endDate < entryDate) return false;

    return true;
  });

  useEffect(() => {
    if (!hasAccess) {
      window.paypal
        .Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    currency_code: "USD",
                    value: "2.99",
                  },
                },
              ],
            });
          },
          onApprove: async (data: any, actions: any) => {
            return actions.order.capture().then(async function (details: any) {
              alert(
                "Transaction completed by " + details.payer.name.given_name
              );
              await handlePaymentSuccess();
            });
          },
          onError: (err: any) => {
            console.error("PayPal checkout error:", err);
            alert("An error occurred during checkout. Please try again.");
          },
        })
        .render("#paypal-button-container");
    }
  }, [hasAccess, handlePaymentSuccess]);

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

  const typeOptions = [
    { value: "", label: "All" },
    { value: "Card of the Day", label: "Card of the Day" },
    { value: "Three Card Reading", label: "Three Card Reading" },
    { value: "Five Card Reading", label: "Five Card Reading" },
  ];

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
          <label htmlFor="type">Type:</label>
          <Select
            options={typeOptions}
            value={typeOptions.find((option) => option.value === filterType)}
            onChange={(option) => setFilterType(option?.value || null)}
            placeholder="Select Type"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
        <div>
          <label htmlFor="start date">Start Date:</label>
          <DatePicker
            selected={startDate}
            onChange={(date: any) => setStartDate(date)}
            dateFormat="MM/dd/yyyy"
            placeholderText="Select a start date"
            className="react-datepicker"
          />
        </div>
        <div>
          <label htmlFor="end date">End Date:</label>
          <DatePicker
            selected={endDate}
            onChange={(date: any) => setEndDate(date)}
            dateFormat="MM/dd/yyyy"
            placeholderText="Select an end date"
            className="react-datepicker"
          />
        </div>
        <button
          className="filterButton"
          onClick={() => {
            setFilterType(null);
            setStartDate(null);
            setEndDate(null);
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
              <p>{convertTimestamp(entry.timestamp).toLocaleDateString()}</p>
              <div className="card-group">
                {entry.cards?.map((card, index) => (
                  <div key={index} className="card-image-container">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="card-image"
                    />
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
                  <button
                    onClick={() => handleSave(entry.id!)}
                    className="btn-save"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="entry">
                  <p>{entry.notes || "No notes yet."}</p>
                  <button
                    onClick={() => handleEdit(entry.id!, entry.notes || "")}
                    className="btn-edit"
                  >
                    Edit Notes
                  </button>
                </div>
              )}
              <button
                onClick={() => handleDelete(entry.id!)}
                className="btn-delete"
              >
                Delete Entry
              </button>
            </div>
          ))
        )}

        {!hasAccess && (
          <div className="no-access-container">
            <h2>Unlock Full Journal Access</h2>
            <p>Access unlimited entries for $2.99 USD</p>
            <div id="paypal-button-container"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
