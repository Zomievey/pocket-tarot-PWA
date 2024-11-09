import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CustomizeDeckStyles.css";
import { useDeck } from "../../services/DeckContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

export default function CustomizeDeck() {
  const { cardBack, setCardBack } = useDeck();
  const [customImage, setCustomImage] = useState<string | null>(null);
  const backgroundImage = "/assets/images/main-background.png";
  const titleFont = "Cinzel Decorative";
  const navigate = useNavigate();

  const backCardImages = React.useMemo(
    () => ["/assets/images/back-card.png", "/assets/images/back-two.png"],
    []
  );

  useEffect(() => {
    const savedCustomImage = localStorage.getItem("customImage");
    if (savedCustomImage) {
      setCustomImage(savedCustomImage);
    }
    if (!cardBack) {
      setCardBack(backCardImages[0]);
    }
  }, [backCardImages, cardBack, setCardBack]);

  const handleSelectCardBack = (newCardBack: string) => {
    setCardBack(newCardBack);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomImage(result);
        localStorage.setItem("customImage", result); // Save the uploaded image as a base64 string in localStorage
        setCardBack(result); // Set it as the current card back
      };
      reader.readAsDataURL(file);
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
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Back Button */}
      <button className='backButton' onClick={() => navigate("/")}>
        Home
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

          <label className='uploadButton' htmlFor='fileUpload'>
            UPLOAD NEW DESIGN
          </label>
          <input
            type='file'
            id='fileUpload'
            style={{ display: "none" }}
            accept='image/*'
            onChange={handleFileUpload}
          />

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
