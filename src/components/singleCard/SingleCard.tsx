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
      className="container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {/* Back Button */}
      <button className="backButton" onClick={() => navigate("/")}>
        ← Home
      </button>

      <div className="singleCardWrapper">
        <div className="cardWrapper">
          {/* Card Back */}
          <div className="cardImageWrapper">
            <img src={cardBack} alt="Card Back" className="cardImage" />
          </div>
          {/* Card Front */}
          {card.card && (
            <div className="cardImageWrapper front">
              <img
                src={card.card.image}
                alt={card.card.name}
                className={`cardImage ${card.isReversed ? "reversed" : ""}`}
              />
            </div>
          )}
        </div>

        {/* Card Description */}
        {card.card && (
          <div className="descriptionWrapper">
            <h2 className="cardName">
              {card.isReversed ? `${card.card.name} Reversed` : card.card.name}
            </h2>
            <p className="cardDescription">
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
