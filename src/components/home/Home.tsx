import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../services/AuthContext";
import "../../index.css";
import "./HomeStyles.css";
import Footer from "../footer/Footer";
import Login from "../login/Login";

const Home = () => {
  const { user, logout } = useAuth();
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const toggleInfoVisibility = () => {
    setIsInfoVisible((prev) => !prev);
  };

  return (
    <div
      className='homeContainer'
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
          {/* Logout Button */}
          <button type='button' className='backButton' onClick={handleLogout}>
            Logout
          </button>

          <div className='info-icon-container'>
            <FontAwesomeIcon
              icon={faCircleInfo}
              size='1x'
              color='white'
              className='info-icon'
              onClick={toggleInfoVisibility}
            />
            {isInfoVisible && (
              <div className='home-info-box'>
                <h3>New Feature: Journal</h3>
                <p>
                  Keep track of your readings with our new Journal feature!
                  <br /> You can:
                </p>
                <ul>
                  <li>Log your card readings.</li>
                  <li>Save notes and insights for each journal entry.</li>
                  <li>
                    Tap each card in your journal entry to get reveal the card's
                    description.
                  </li>
                  <li>
                    Filter and search through past entries by the type of entry
                    or the date of the when the entry was created.
                  </li>
                  <li>
                    You can log 3 free journal entries, to unlock unlimited entries there is a one-time payment of $2.99.
                  </li>
                </ul>
                <p>Start journaling today and reflect on your tarot journey!</p>
              </div>
            )}
          </div>

          {/* Main Navigation Links */}
          <div className='overlayContainer'>
            <div className='overlay'>
              <h1 className='title'>Pocket Tarot</h1>

              <Link to='/singleCard' className='link-text'>
                <FontAwesomeIcon
                  icon={faStar}
                  size='lg'
                  color='white'
                  className='icon'
                />
                CARD OF THE DAY
              </Link>

              <Link to='/threeCard' className='link-text'>
                <FontAwesomeIcon
                  icon={faStar}
                  size='lg'
                  color='white'
                  className='icon'
                />
                THREE CARD SPREAD
              </Link>

              <Link to='/fiveCard' className='link-text'>
                <FontAwesomeIcon
                  icon={faStar}
                  size='lg'
                  color='white'
                  className='icon'
                />
                FIVE CARD SPREAD
              </Link>

              <Link to='/customizeDeck' className='link-text'>
                <FontAwesomeIcon
                  icon={faStar}
                  size='lg'
                  color='white'
                  className='icon'
                />
                CUSTOMIZE DECK
              </Link>

              <Link to='/journal' className='link-text'>
                <FontAwesomeIcon
                  icon={faStar}
                  size='lg'
                  color='white'
                  className='icon'
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
