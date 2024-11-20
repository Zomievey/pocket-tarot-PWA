import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tarotDeck } from "../../classes/TarotDeck";
import "./SingleCardStyles.css";
import { useDeck } from "../../services/DeckContext";
import { useJournal } from "../../services/JournalContext";

type TarotCard = {
  name: string;
  image: string;
  description: string;
  reversedDescription: string;
};

export default function SingleCard() {
  const [card, setCard] = useState<{
    card: TarotCard | null;
    isReversed: boolean;
  }>({
    card: null,
    isReversed: false,
  });
  const [isCardDrawn, setIsCardDrawn] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // Track if the card is saved to journal

  const { cardBack } = useDeck();
  const { addEntry, hasUnlimitedAccess, entryCount } = useJournal(); // Access addEntry, hasUnlimitedAccess, and entryCount
  const navigate = useNavigate();

  const drawCard = () => {
    if (isCardDrawn) {
      // Reset to show the card back again
      setCard({ card: null, isReversed: false });
      setIsCardDrawn(false);
      setIsSaved(false); // Reset save status
    } else {
      // Draw a new card
      const randomCard =
        tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
      const isReversed = Math.random() < 0.5;

      setCard({
        card: {
          ...randomCard,
          reversedDescription: randomCard.reversedDescription ?? "",
        },
        isReversed,
      });
      setIsCardDrawn(true);
    }
  };

  const saveToJournal = () => {
    if (card.card) {
      addEntry({
        type: "Card of the Day",
        cards: [
          {
            image: card.card.image,
            title: card.isReversed
              ? `${card.card.name} Reversed`
              : card.card.name,
            description: card.isReversed
              ? card.card.reversedDescription
              : card.card.description,
          },
        ],
        notes: "",
      });

      setIsSaved(true);
    }
  };

  const backgroundImage = "/assets/images/single.png";

  // Determine if the "Save to Journal" button should be displayed
  const canSaveToJournal = hasUnlimitedAccess || entryCount < 3;

  return (
    <div className="scrollWrapper">
      <div
        className="singleContainer"
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
        <div className="singleCardWrapper">
          <div className="singleCardContainer">
            <div className="singleCardImageContainer">
              <div
                className={`singleCardImageWrapper ${
                  isCardDrawn ? "revealed" : "clickable"
                }`}
                onClick={drawCard}
              >
                {!isCardDrawn ? (
                  <img
                    src={cardBack}
                    alt="Card Back"
                    className="singleCardBackImage"
                  />
                ) : (
                  card.card && (
                    <img
                      src={card.card.image}
                      alt={card.card.name}
                      className={`singleCardImage ${
                        card.isReversed ? "singleReversed" : ""
                      }`}
                    />
                  )
                )}
              </div>
            </div>
          </div>
          {card.card && isCardDrawn && (
            <div className="singleDescriptionWrapper">
              <h2 className="singleCardName">
                {card.isReversed
                  ? `${card.card.name} Reversed`
                  : card.card.name}
              </h2>
              <p className="singleCardDescription">
                {card.isReversed
                  ? card.card.reversedDescription
                  : card.card.description}
              </p>
              {/* Conditionally render Save to Journal Button */}
              {canSaveToJournal && (
                <button
                  className="saveToJournalButton"
                  onClick={saveToJournal}
                  disabled={isSaved}
                >
                  {isSaved ? "Saved to Journal" : "Save to Journal"}
                </button>
              )}
              {!canSaveToJournal && (
                <p className="saveLimitMessage">
                  You’ve reached the limit of 3 free journal entries. Delete an entry, or upgrade to save
                  more!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
