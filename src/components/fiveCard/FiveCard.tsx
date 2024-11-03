import React, { useState } from "react";
import { tarotDeck } from "../../classes/TarotDeck";
import "./FiveCardStyles.css";
import "../../index.css";
import { useDeck } from "../../services/DeckContext";
import { useNavigate } from "react-router-dom";

type TarotCard = {
  name: string;
  image: string;
  description: string;
  reversedDescription: string;
};

type AnimatedCard = {
  card: TarotCard;
  isReversed: boolean;
  flipped: boolean;
};

export default function FiveCard() {
  const [cards, setCards] = useState<AnimatedCard[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [cardCount, setCardCount] = useState(0);
  const { cardBack } = useDeck();
  const backgroundImage = "/assets/images/five.jpg";
  const navigate = useNavigate();

  const isCardAlreadyDrawn = (card: TarotCard) => {
    return cards.some((drawnCard) => drawnCard.card.name === card.name);
  };

  const drawCard = () => {
    if (cardCount >= 5) return;

    let randomCard;
    let isReversed;

    do {
      randomCard = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
      isReversed = Math.random() < 0.5;
    } while (isCardAlreadyDrawn(randomCard));

    const newCard: AnimatedCard = {
      card: randomCard,
      isReversed,
      flipped: true,
    };

    setCards([...cards, newCard]);
    setActiveCardIndex(cards.length);
    setCardCount(cardCount + 1);
  };

  const resetCards = () => {
    setCards([]);
    setActiveCardIndex(null);
    setCardCount(0);
  };

  const handleCardPress = (index: number) => {
    setActiveCardIndex(index);
  };

  const getButtonText = () => {
    if (cardCount === 0) return "Reveal First Card";
    if (cardCount === 1) return "Reveal Second Card";
    if (cardCount === 2) return "Reveal Third Card";
    if (cardCount === 3) return "Reveal Fourth Card";
    if (cardCount === 4) return "Reveal Fifth Card";
    return "Reset";
  };

  return (
    <div
      className="fiveCardBackground"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <button className="backButton" onClick={() => navigate("/")}>
        ← Home
      </button>
      <div className="fiveCardWrapper">
        {Array.from({ length: 5 }).map((_, index) => {
          const card = cards[index];
          const isActive = index === activeCardIndex;

          return (
            <button
              key={card ? card.card.name : index}
              onClick={() => handleCardPress(index)}
              disabled={!card?.flipped}
              className={`fiveCardContainer ${isActive ? "activeCard" : ""}`}
            >
              <div className="fiveCardImageWrapper">
                {/* Card Back */}
                <img
                  src={cardBack}
                  alt="Card Back"
                  className="fiveCardImage"
                  style={{ display: card ? "none" : "block" }}
                />
                {/* Card Front */}
                {card && (
                  <img
                    src={card.card.image}
                    alt={card.card.name}
                    className="fiveCardImage"
                    style={{
                      transform: card.isReversed ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                )}
              </div>

              {/* Description below the card image */}
              {card && isActive && (
                <div className="fiveDescriptionWrapper">
                  <h3 className="fiveCardName">
                    {card.isReversed ? `${card.card.name} Reversed` : card.card.name}
                  </h3>
                  <p className="fiveCardDescription">
                    {card.isReversed ? card.card.reversedDescription : card.card.description}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button onClick={cardCount < 5 ? drawCard : resetCards} className="drawButton">
        {getButtonText()}
      </button>
    </div>
  );
}
