import React, { useState } from "react";
import { tarotDeck } from "../../classes/TarotDeck";
import "./FiveCardStyles.css";
import { useDeck } from "../../services/DeckContext";
import { useNavigate } from "react-router-dom";

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
  const { cardBack } = useDeck();
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
  };

  const allCardsRevealed = cards.every((card) => card.isRevealed);

  return (
    <div
      className='fiveContainer'
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <button className='backButton' onClick={() => navigate("/")}>
        ← Home
      </button>
      <div className='fiveCardWrapper'>
        {Array.from({ length: 5 }).map((_, index) => {
          const card = cards[index];
          return (
            <div
              key={index}
              className={`fiveCardContainer ${
                index === activeCardIndex ? "activeCard" : ""
              }`}
            >
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

      <div className='centeredDescriptionWrapper'>
        {activeCardIndex !== null && (
          <>
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
          </>
        )}
      </div>

      <div className='resetButtonContainer'>
        {allCardsRevealed && (
          <button onClick={resetCards} className='resetButton'>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
