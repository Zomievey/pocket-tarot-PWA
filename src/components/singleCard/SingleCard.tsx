import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { tarotDeck } from "../../classes/TarotDeck";
import "./SingleCardStyles.css";
import { useDeck } from "../../services/DeckContext";

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
  }>({ card: null, isReversed: false });

  const { cardBack } = useDeck();
  const navigate = useNavigate(); 

  const drawCard = () => {
    const randomCard = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
    const isReversed = Math.random() < 0.5;

    setCard({
      card: {
        ...randomCard,
        reversedDescription: randomCard.reversedDescription ?? "",
      },
      isReversed,
    });
  };

  const backgroundImage = "/assets/images/single.png";

  return (
    <div
      className="singleContainer"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <button className="backButton" onClick={() => navigate("/")}>
        ← Home
      </button>

      <div className="singleCardWrapper">
        <div className="singleCardContainer">
          {/* Card Back */}
          {!card.card && (
            <div className="singleCardImageWrapper">
              <img src={cardBack} alt="Card Back" className="singleCardImage" />
            </div>
          )}
          {/* Card Front */}
          {card.card && (
            <div className="singleCardImageWrapper">
              <img
                src={card.card.image}
                alt={card.card.name}
                className={`singleCardImage ${
                  card.isReversed ? "singleReversed" : ""
                }`}
              />
            </div>
          )}
        </div>

        {/* Card Description */}
        {card.card && (
          <div className="singleDescriptionWrapper">
            <h2 className="singleCardName">
              {card.isReversed ? `${card.card.name} Reversed` : card.card.name}
            </h2>
            <p className="singleCardDescription">
              {card.isReversed
                ? card.card.reversedDescription
                : card.card.description}
            </p>
          </div>
        )}
      </div>

      <button onClick={drawCard} className="drawButton">
        Reveal Your Card
      </button>
    </div>
  );
}
