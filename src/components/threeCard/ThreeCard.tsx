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
  const [cards, setCards] = useState<
    { card: TarotCard; isReversed: boolean }[]
  >([]);
  const { cardBack } = useDeck();
  const navigate = useNavigate();

  const [cardCount, setCardCount] = useState(0);
  const backgroundImage = "/assets/images/three.jpg";

  const isCardAlreadyDrawn = (card: TarotCard) => {
    return cards.some((drawnCard) => drawnCard.card.name === card.name);
  };

  const drawCard = () => {
    if (cards.length >= 3) return;

    let randomCard;
    let isReversed;
    do {
      randomCard = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
      isReversed = Math.random() < 0.5;
    } while (isCardAlreadyDrawn(randomCard));

    setCards([...cards, { card: randomCard, isReversed }]);
    setCardCount(cardCount + 1);
  };

  const resetCards = () => {
    setCards([]);
    setCardCount(0);
  };

  const getButtonText = () => {
    if (cardCount === 0) return "Reveal First Card";
    if (cardCount === 1) return "Reveal Second Card";
    if (cardCount === 2) return "Reveal Third Card";
    return "Reset";
  };

  return (
    <div
      className='background'
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <button className='backButton' onClick={() => navigate("/")}>
        ← Home
      </button>

      <div className='container'>
        <div className='threeCardWrapper'>
          {Array.from({ length: 3 }).map((_, index) => {
            const card = cards[index];

            return (
              <div
                key={card ? card.card.name : index}
                className='threeCardContainer'
              >
                <div className='cardImageWrapper'>
                  {/* Card Back */}
                  <img
                    src={cardBack}
                    alt='Card Back'
                    className='threeCardImage'
                    style={{ display: card ? "none" : "block" }}
                  />
                  {/* Card Front */}
                  {card && (
                    <img
                      src={card.card.image}
                      alt={card.card.name}
                      className={`threeCardImage ${
                        card.isReversed ? "reversed" : ""
                      }`}
                    />
                  )}
                </div>
                {card && (
                  <div className='descriptionWrapper'>
                    <h2 className='cardName'>
                      {card.isReversed
                        ? `${card.card.name} Reversed`
                        : card.card.name}
                    </h2>
                    <p className='cardDescription'>
                      {card.isReversed
                        ? card.card.reversedDescription
                        : card.card.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button
          onClick={cardCount < 3 ? drawCard : resetCards}
          className='drawButton'
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
}
