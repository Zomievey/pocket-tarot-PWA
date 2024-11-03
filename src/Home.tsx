import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import "./index.css";
import Footer from './components/footer/Footer';

const Home = () => {
  const backgroundImage = "/assets/images/main-background.png";

  return (
    <div
      className="homeContainer" // Change container class name to avoid CSS conflicts
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
      <Footer />
    </div>
  );
};

export default Home;
