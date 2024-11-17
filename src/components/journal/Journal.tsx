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
import { RiseLoader } from "react-spinners";
import { toast } from "react-toastify";

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
    hasUnlimitedAccess,
    loading,
    entryCount,
  } = useJournal();
  const { handlePaymentSuccess } = usePayments();
  const [editingIndex, setEditingIndex] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<string>("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  const [activeCardDescription, setActiveCardDescription] = useState<{
    [entryId: string]: { [cardIndex: number]: boolean };
  }>({});

  // Pagination state variables
  const [currentPage, setCurrentPage] = useState<number>(1);
  const entriesPerPage = 2;

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
      console.log("Fetching user entries...", userId); // Debugging
    }
  }, [fetchUserEntries, userId]);

  useEffect(() => {
    console.log("Journal Entries State:", journalEntries); // Debugging
  }, [journalEntries]);

  // Filtered entries based on user ID and applied filters
  const filteredEntries = journalEntries.filter((entry) => {
    if (entry.userId !== userId) return false;
    const entryDate = convertTimestamp(entry.timestamp);

    if (filterType && entry.type !== filterType) return false;
    if (startDate && startDate > entryDate) return false;
    if (endDate && endDate < entryDate) return false;

    return true;
  });

  // Sort entries by date (newest first)
  const sortedEntries = filteredEntries.sort((a, b) => {
    const dateA = convertTimestamp(a.timestamp);
    const dateB = convertTimestamp(b.timestamp);
    return dateB.getTime() - dateA.getTime();
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedEntries.length / entriesPerPage);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = sortedEntries.slice(indexOfFirstEntry, indexOfLastEntry);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, startDate, endDate]);

  // Only render the PayPal button once
  useEffect(() => {
    const paypalContainer = document.getElementById("paypal-button-container");

    // If we should render the PayPal button
    if (!hasUnlimitedAccess && entryCount >= 3 && !loading) {
      if (paypalContainer && paypalContainer.innerHTML.trim() === "") {
        window.paypal
          .Buttons({
            createOrder: (data: Record<string, unknown>, actions: any) => {
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
            onApprove: async (data: Record<string, unknown>, actions: any) => {
              return actions.order
                .capture()
                .then(
                  async (details: {
                    payer: { name: { given_name: string } };
                  }) => {
                    await handlePaymentSuccess();
                  }
                );
            },
            onError: (err: any) => {
              console.error("PayPal checkout error:", err);
              toast.error(
                "An error occurred during checkout. Please try again."
              );
            },
            onCancel: (data: any) => {
              console.warn("PayPal payment cancelled:", data);
              toast.info("Payment was cancelled.");
            },
          })
          .render("#paypal-button-container")
          .catch((error: any) => {
            console.error("PayPal Button Render Error:", error);
          });
      }
    } else {
      if (paypalContainer) {
        paypalContainer.innerHTML = "";
      }
    }
  }, [hasUnlimitedAccess, entryCount, loading, handlePaymentSuccess]);

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

  const toggleCardDescription = (entryId: string, cardIndex: number) => {
    setActiveCardDescription(
      (prevState: { [entryId: string]: { [cardIndex: number]: boolean } }) => ({
        ...prevState,
        [entryId]: {
          ...(prevState[entryId] || {}),
          [cardIndex]: !prevState[entryId]?.[cardIndex],
        },
      })
    );
  };

  const typeOptions = [
    { value: "", label: "All" },
    { value: "Card of the Day", label: "Card of the Day" },
    { value: "Three Card Reading", label: "Three Card Reading" },
    { value: "Five Card Reading", label: "Five Card Reading" },
  ];

  useEffect(() => {
    console.log("hasUnlimitedAccess:", hasUnlimitedAccess);
  }, [hasUnlimitedAccess]);

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "scroll",
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
          Filter
          <br /> Entries
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
          className="clear-filter"
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

        {loading && <RiseLoader color="#ffffff" />}
        {!loading && currentEntries.length === 0 && (
          <p>No journal entries yet. Save a card reading to see it here!</p>
        )}
        {!loading &&
          currentEntries.length > 0 &&
          currentEntries.map((entry) => {
            if (!entry.id) return null;
            const entryId = entry.id;

            return (
              <div className="journal-entry" key={entryId}>
                <h2 className="journal-entry-title">{entry.type}</h2>
                <p>{convertTimestamp(entry.timestamp).toLocaleDateString()}</p>
                <div className="card-group">
                  {entry.cards?.map((card, index) => {
                    const isDescriptionVisible =
                      activeCardDescription[entryId]?.[index] || false;

                    return (
                      <div
                        key={index}
                        className="card-image-container"
                        onClick={() => toggleCardDescription(entryId, index)}
                      >
                        {isDescriptionVisible ? (
                          <div className="card-description">
                            <p>{card.description}</p>
                          </div>
                        ) : (
                          <img
                            src={card.image}
                            alt={card.title}
                            className="card-image"
                          />
                        )}
                        <p className="card-title">{card.title}</p>
                      </div>
                    );
                  })}
                </div>
                {editingIndex === entryId ? (
                  <div>
                    <textarea
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      placeholder="Add notes about your reading..."
                      className="notes-textarea"
                    />
                    <button
                      onClick={() => handleSave(entryId)}
                      className="btn-save"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="entry">
                    <p>{entry.notes || "No notes yet."}</p>
                    <button
                      onClick={() => handleEdit(entryId, entry.notes || "")}
                      className="btn-edit"
                    >
                      Edit Notes
                    </button>
                  </div>
                )}
                <button
                  onClick={() => handleDelete(entryId)}
                  className="btn-delete"
                >
                  Delete Entry
                </button>
              </div>
            );
          })}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              className="pagination-button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            <button
              className="pagination-button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>
        )}

        {!hasUnlimitedAccess && entryCount >= 3 && !loading ? (
          <div className="no-access-container">
            <h2>Unlock Full Journal Access</h2>
            <p>Access unlimited entries for $2.99 USD</p>
            <div id="paypal-button-container"></div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Journal;
