import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import Link from react-router-dom
import "./CustomizeDeckStyles.css"; // Import the converted CSS file for styles
import { useDeck } from "../../services/DeckContext"; // Assume DeckContext is adapted for web
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons"; // Import faArrowLeft for the home button

export default function CustomizeDeck() {
  const { cardBack, setCardBack } = useDeck(); // Access the card back and setter
  const [customImage, setCustomImage] = useState<string | null>(null); // State for uploaded image
  const [isButtonPressed, setIsButtonPressed] = useState(false); // Track button press state
  const backgroundImage = "/assets/images/main-background.png";
  const titleFont = "Cinzel Decorative"; // Ensure this font is loaded via CSS or index.html
  const navigate = useNavigate();

  const backCardImages = React.useMemo(
    () => ["/assets/images/back-card.png", "/assets/images/back-two.png"],
    []
  );

  useEffect(() => {
    // Fetch the custom image and card back from localStorage when the app starts
    const loadCustomImage = () => {
      const savedCustomImage = localStorage.getItem("customImage");
      if (savedCustomImage) {
        setCustomImage(savedCustomImage); // Restore the saved image URI from localStorage
      }
    };

    const checkAndSetDefaultCardBack = () => {
      if (!cardBack) {
        setCardBack(backCardImages[0]);
      }
    };

    loadCustomImage();
    checkAndSetDefaultCardBack();
  }, [backCardImages, cardBack, setCardBack]);

  const handleSelectCardBack = (newCardBack: string) => {
    setCardBack(newCardBack);
  };

  const pickImage = () => {
    // Simulating an image upload since expo-image-picker is unavailable for web
    const newImage = prompt("Enter the URL of your custom card image:");
    if (newImage) {
      setCustomImage(newImage);
      localStorage.setItem("customImage", newImage); // Save image URL to localStorage
    }
  };

  const deleteImage = () => {
    const confirmDeletion = window.confirm(
      "Are you sure you want to delete your custom card design?"
    );
    if (confirmDeletion) {
      setCustomImage(null);
      localStorage.removeItem("customImage");
    }
  };

  return (
    <div
      className='containerCustom'
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
       {/* Back Button */}
       <button className="backButton" onClick={() => navigate("/")}>
        ← Home
      </button>

      <div className='overlayContainer'>
        <div className='overlayCustom'>
          <h1 className='titleCustom' style={{ fontFamily: titleFont }}>
            Customize Deck
          </h1>
          <h2 className='subtitleCustom' style={{ fontFamily: titleFont }}>
            Select A CARD DESIGN:
          </h2>

          <div className='imageContainer'>
            {backCardImages.map((backImage, index) => (
              <button
                key={backImage}
                onClick={() => handleSelectCardBack(backImage)}
                style={{
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: 0,
                }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelectCardBack(backImage);
                  }
                }}
              >
                <img
                  src={backImage}
                  alt={`Back card ${index + 1}`}
                  className={`dynamicImageSize ${
                    backImage === cardBack ? "selectedCard" : ""
                  }`}
                />
              </button>
            ))}

            {customImage && (
              <div className='customImageWrapper'>
                <button
                  onClick={() => handleSelectCardBack(customImage)}
                  style={{
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSelectCardBack(customImage);
                    }
                  }}
                >
                  <img
                    src={customImage}
                    alt='Custom card back'
                    className={`dynamicImageSize ${
                      customImage === cardBack ? "selectedCard" : ""
                    }`}
                  />
                </button>
                <FontAwesomeIcon
                  icon={faTimesCircle}
                  className='deleteIcon'
                  onClick={deleteImage}
                />
              </div>
            )}
          </div>

          <button
            className={`uploadButton ${
              isButtonPressed ? "uploadButtonHover" : ""
            }`}
            onMouseDown={() => setIsButtonPressed(true)}
            onMouseUp={() => setIsButtonPressed(false)}
            onClick={pickImage}
          >
            UPLOAD NEW DESIGN
          </button>

          <div className='centeredContainer'>
            <h2 className='subtitleCustom' style={{ fontFamily: titleFont }}>
              Current Design:
            </h2>
            <img
              src={cardBack}
              alt='Current card back'
              className='dynamicImageSize'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
