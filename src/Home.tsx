import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import "./index.css";

const Home = () => {
  const backgroundImage = "/assets/images/main-background.png";

  return (
    <div
      className="container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="overlayContainer">
        <div className="overlay">
          <h1 className="title">Pocket Tarot</h1>

          <Link to="/singleCard" className="link-text">
            <FontAwesomeIcon icon={faStar} size="lg" color="white" className="icon" /> 
            CARD OF THE DAY
          </Link>

          <Link to="/threeCard" className="link-text">
            <FontAwesomeIcon icon={faStar} size="lg" color="white" className="icon" /> 
            THREE CARD SPREAD
          </Link>

          <Link to="/fiveCard" className="link-text">
            <FontAwesomeIcon icon={faStar} size="lg" color="white" className="icon" /> 
            FIVE CARD SPREAD
          </Link>

          <Link to="/customizeDeck" className="link-text">
            <FontAwesomeIcon icon={faStar} size="lg" color="white" className="icon" /> 
            CUSTOMIZE DECK
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
