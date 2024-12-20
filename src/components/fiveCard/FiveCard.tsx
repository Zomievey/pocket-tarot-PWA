import React, { useState } from "react";
import { tarotDeck } from "../../classes/TarotDeck";
import "./FiveCardStyles.css";
import { useDeck } from "../../services/DeckContext";
import { useNavigate } from "react-router-dom";
import { useJournal } from "../../services/JournalContext"; // Import useJournal

type TarotCard = {
  name: string;
  image: string;
  description: string;
  reversedDescription: string;
};

export default function FiveCard() {
  const placeholderCard: TarotCard = {
    name: "Placeholder",
    image: "",
    description: "",
    reversedDescription: "",
  };

  const [cards, setCards] = useState<
    {
      card: TarotCard;
      isReversed: boolean;
      isRevealed: boolean;
      blurReveal: boolean;
    }[]
  >([
    {
      card: placeholderCard,
      isReversed: false,
      isRevealed: false,
      blurReveal: false,
    },
    {
      card: placeholderCard,
      isReversed: false,
      isRevealed: false,
      blurReveal: false,
    },
    {
      card: placeholderCard,
      isReversed: false,
      isRevealed: false,
      blurReveal: false,
    },
    {
      card: placeholderCard,
      isReversed: false,
      isRevealed: false,
      blurReveal: false,
    },
    {
      card: placeholderCard,
      isReversed: false,
      isRevealed: false,
      blurReveal: false,
    },
  ]);

  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false); // Track if the reading is saved
  const { cardBack } = useDeck();
  const { addEntry, hasUnlimitedAccess, entryCount } = useJournal(); // Access hasUnlimitedAccess and entryCount
  const navigate = useNavigate();
  const backgroundImage = "/assets/images/five.jpg";

  const isCardAlreadyDrawn = (card: TarotCard) => {
    return cards.some((drawnCard) => drawnCard.card.name === card.name);
  };

  const drawCard = (index: number) => {
    const updatedCards = [...cards];

    if (updatedCards[index].isRevealed) {
      setActiveCardIndex(index);
      updatedCards[index].blurReveal = false;
      setCards([...updatedCards]);

      setTimeout(() => {
        updatedCards[index].blurReveal = true;
        setCards([...updatedCards]);
      }, 10);

      return;
    }

    let randomCard: TarotCard;
    let isReversed: boolean;

    do {
      randomCard = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
      isReversed = Math.random() < 0.5;
    } while (isCardAlreadyDrawn(randomCard));

    updatedCards[index] = {
      card: randomCard,
      isReversed,
      isRevealed: true,
      blurReveal: true,
    };
    setCards(updatedCards);
    setActiveCardIndex(index);
  };

  const resetCards = () => {
    setCards([
      {
        card: placeholderCard,
        isReversed: false,
        isRevealed: false,
        blurReveal: false,
      },
      {
        card: placeholderCard,
        isReversed: false,
        isRevealed: false,
        blurReveal: false,
      },
      {
        card: placeholderCard,
        isReversed: false,
        isRevealed: false,
        blurReveal: false,
      },
      {
        card: placeholderCard,
        isReversed: false,
        isRevealed: false,
        blurReveal: false,
      },
      {
        card: placeholderCard,
        isReversed: false,
        isRevealed: false,
        blurReveal: false,
      },
    ]);
    setActiveCardIndex(null);
    setIsSaved(false); // Reset save status on reset
  };

  const allCardsRevealed = cards.every((card) => card.isRevealed);

  const saveToJournal = () => {
    addEntry({
      type: "Five Card Reading",
      cards: cards.map(({ card, isReversed }) => ({
        title: isReversed ? `${card.name} Reversed` : card.name,
        image: card.image,
        description: isReversed ? card.reversedDescription : card.description,
      })),
      notes: "",
    });

    setIsSaved(true);
  };

  // Determine if the "Save to Journal" button should be displayed
  const canSaveToJournal = hasUnlimitedAccess || entryCount < 3;

  return (
    <div
      className='fiveContainer'
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
      <div className='fiveCardWrapper'>
        {Array.from({ length: 5 }).map((_, index) => {
          const card = cards[index];
          return (
            <div key={index} className='fiveCardContainer'>
              <div
                className={`fiveCardImageWrapper ${
                  card?.isRevealed ? "revealed" : "clickable"
                }`}
                onClick={() => drawCard(index)}
              >
                {!card?.isRevealed ? (
                  <img
                    src={cardBack}
                    alt='Card Back'
                    className='fiveCardBackImage'
                  />
                ) : (
                  card.card && (
                    <img
                      key={index}
                      src={card.card.image}
                      alt={card.card.name}
                      className={`fiveCardImage ${
                        card.isReversed ? "fiveReversed" : ""
                      } ${card.blurReveal ? "blurRevealAnimation" : ""}`}
                      onAnimationEnd={() => {
                        const updatedCards = [...cards];
                        updatedCards[index].blurReveal = false;
                        setCards(updatedCards);
                      }}
                    />
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeCardIndex !== null && (
        <div className='centeredDescriptionWrapper'>
          <h2 className='fiveCardName'>
            {cards[activeCardIndex].isReversed
              ? `${cards[activeCardIndex].card.name} Reversed`
              : cards[activeCardIndex].card.name}
          </h2>
          <p className='fiveCardDescription'>
            {cards[activeCardIndex].isReversed
              ? cards[activeCardIndex].card.reversedDescription
              : cards[activeCardIndex].card.description}
          </p>
        </div>
      )}

      {allCardsRevealed && (
        <div>
          {!canSaveToJournal && (
            <div className='no-entries-warning'>
              <p className='saveLimitMessage'>
                You’ve reached the limit of 3 free journal entries. Delete an
                entry, or upgrade to save more!
              </p>
            </div>
          )}
          <div className='reset-save-buttons'>
            {canSaveToJournal && (
              <button
                className='saveToJournalButton'
                onClick={saveToJournal}
                disabled={isSaved} // Disable if saved
              >
                {isSaved ? "Saved to Journal" : "Save to Journal"}
              </button>
            )}
            <button className='resetButton' onClick={resetCards}>
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
