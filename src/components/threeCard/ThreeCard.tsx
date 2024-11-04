import React, { useState } from "react";
import { tarotDeck } from "../../classes/TarotDeck";
import "./ThreeCardStyles.css";
import { useDeck } from "../../services/DeckContext";
import { useNavigate } from "react-router-dom";

type TarotCard = {
  name: string;
  image: string;
  description: string;
  reversedDescription: string;
};

export default function ThreeCard() {
  // Placeholder card for initial state
  const placeholderCard: TarotCard = {
    name: "Placeholder",
    image: "",
    description: "",
    reversedDescription: "",
  };

  const [cards, setCards] = useState<
    { card: TarotCard; isReversed: boolean; isRevealed: boolean; blurReveal: boolean }[]
  >([
    { card: placeholderCard, isReversed: false, isRevealed: false, blurReveal: false },
    { card: placeholderCard, isReversed: false, isRevealed: false, blurReveal: false },
    { card: placeholderCard, isReversed: false, isRevealed: false, blurReveal: false },
  ]);

  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null); // Active card index
  const { cardBack } = useDeck();
  const navigate = useNavigate();
  const backgroundImage = "/assets/images/three.jpg";

  const isCardAlreadyDrawn = (card: TarotCard) => {
    return cards.some((drawnCard) => drawnCard.card.name === card.name);
  };

  // Draw or activate a card
  const drawCard = (index: number) => {
    const updatedCards = [...cards];

    // If the card is already revealed, toggle the blur reveal animation
    if (updatedCards[index].isRevealed) {
      setActiveCardIndex(index);
      
      // Reset blurReveal briefly to retrigger the animation
      updatedCards[index].blurReveal = false;
      setCards([...updatedCards]); // Trigger re-render without blurReveal

      // Toggle blurReveal back to true with a timeout to restart animation
      setTimeout(() => {
        updatedCards[index].blurReveal = true;
        setCards([...updatedCards]);
      }, 10); // A slight delay to reapply the animation class

      return;
    }

    // If not revealed, draw a new card
    let randomCard: TarotCard;
    let isReversed: boolean;

    do {
      randomCard = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
      isReversed = Math.random() < 0.5;
    } while (isCardAlreadyDrawn(randomCard));

    // Update the card with the new drawn card details and reveal it
    updatedCards[index] = {
      card: randomCard,
      isReversed,
      isRevealed: true,
      blurReveal: true, // Start with blur reveal
    };
    setCards(updatedCards);
    setActiveCardIndex(index);
  };

  // Reset all cards and clear the active card
  const resetCards = () => {
    setCards([
      { card: placeholderCard, isReversed: false, isRevealed: false, blurReveal: false },
      { card: placeholderCard, isReversed: false, isRevealed: false, blurReveal: false },
      { card: placeholderCard, isReversed: false, isRevealed: false, blurReveal: false },
    ]);
    setActiveCardIndex(null); // Clear active card on reset
  };

  // Check if all cards have been revealed
  const allCardsRevealed = cards.every((card) => card.isRevealed);

  return (
    <div
      className="threeContainer"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <button className="backButton" onClick={() => navigate("/")}>
        ← Home
      </button>
      <div className="threeCardWrapper">
        {Array.from({ length: 3 }).map((_, index) => {
          const card = cards[index];
          return (
            <div key={index} className="threeCardContainer">
              <div
                className={`threeCardImageWrapper ${
                  card?.isRevealed ? "revealed" : "clickable"
                }`}
                onClick={() => drawCard(index)}
              >
                {/* Card Back */}
                {!card?.isRevealed ? (
                  <img
                    src={cardBack}
                    alt="Card Back"
                    className="threeCardBackImage"
                  />
                ) : (
                  // Card Front with conditional blur reveal animation for active card
                  card.card && (
                    <img
                      key={index}
                      src={card.card.image}
                      alt={card.card.name}
                      className={`threeCardImage ${
                        card.isReversed ? "threeReversed" : ""
                      } ${card.blurReveal ? "blurRevealAnimation" : ""}`} // Apply blur reveal only if blurReveal is true
                      onAnimationEnd={() => {
                        // Remove blurReveal after animation completes
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

      {/* Centered description area for the active card */}
      {activeCardIndex !== null && (
        <div className="centeredDescriptionWrapper">
          <h2 className="threeCardName">
            {cards[activeCardIndex].isReversed
              ? `${cards[activeCardIndex].card.name} Reversed`
              : cards[activeCardIndex].card.name}
          </h2>
          <p className="threeCardDescription">
            {cards[activeCardIndex].isReversed
              ? cards[activeCardIndex].card.reversedDescription
              : cards[activeCardIndex].card.description}
          </p>
        </div>
      )}

      {/* Reset button that only appears when all three cards are revealed */}
      {allCardsRevealed && (
        <button onClick={resetCards} className="resetButton">
          Reset
        </button>
      )}
    </div>
  );
}
