// Home.tsx
import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import { useAuth } from "../../services/AuthContext";
import "../../index.css";
import Footer from "../footer/Footer";
import Login from "../login/Login";

const Home = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      className="homeContainer"
      style={{
        backgroundImage: `url(/assets/images/main-background.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Show Login modal if user is not logged in */}
      {!user && <Login />}

      {/* Render Home content only if user is logged in */}
      {user && (
        <>
          <button type="button" className="backButton" onClick={handleLogout}>
            Logout
          </button>
          <div className="overlayContainer">
            <div className="overlay">
              <h1 className="title">Pocket Tarot</h1>

              <Link to="/singleCard" className="link-text">
                <FontAwesomeIcon
                  icon={faStar}
                  size="lg"
                  color="white"
                  className="icon"
                />
                CARD OF THE DAY
              </Link>

              <Link to="/threeCard" className="link-text">
                <FontAwesomeIcon
                  icon={faStar}
                  size="lg"
                  color="white"
                  className="icon"
                />
                THREE CARD SPREAD
              </Link>

              <Link to="/fiveCard" className="link-text">
                <FontAwesomeIcon
                  icon={faStar}
                  size="lg"
                  color="white"
                  className="icon"
                />
                FIVE CARD SPREAD
              </Link>

              <Link to="/customizeDeck" className="link-text">
                <FontAwesomeIcon
                  icon={faStar}
                  size="lg"
                  color="white"
                  className="icon"
                />
                CUSTOMIZE DECK
              </Link>

              <Link to="/journal" className="link-text">
                <FontAwesomeIcon
                  icon={faStar}
                  size="lg"
                  color="white"
                  className="icon"
                />
                JOURNAL
              </Link>
            </div>
          </div>
          <Footer />
        </>
      )}
    </div>
  );
};

export default Home;
