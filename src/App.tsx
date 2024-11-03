import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FiveCard from "./components/fiveCard/FiveCard";
import SingleCard from "./components/singleCard/SingleCard";
import ThreeCard from "./components/threeCard/ThreeCard";
import CustomizeDeck from "./components/customizeDeck/CustomizeDeck";
import Footer from "./components/footer/Footer";
import Home from "./Home";
import { DeckProvider } from "./services/DeckContext";

function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load fonts using FontFace API
  useEffect(() => {
    const cinzelFont = new FontFace(
      "Cinzel Decorative",
      "url(./assets/fonts/CinzelDecorative-Regular.ttf)"
    );
    const spaceMonoFont = new FontFace(
      "Space Mono",
      "url(./assets/fonts/SpaceMono-Regular.ttf)"
    );

    Promise.all([cinzelFont.load(), spaceMonoFont.load()])
      .then(() => {
        document.fonts.add(cinzelFont);
        document.fonts.add(spaceMonoFont);
        setFontsLoaded(true);
        console.log("Fonts loaded successfully");
      })
      .catch((error) => console.error("Error loading fonts:", error));
  }, []);

  if (!fontsLoaded) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>Loading...</div>
    );
  }

  return (
    <DeckProvider>
      <Router>
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/singleCard' element={<SingleCard />} />
            <Route path='/threeCard' element={<ThreeCard />} />
            <Route path='/fiveCard' element={<FiveCard />} />
            <Route path='/customizeDeck' element={<CustomizeDeck />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </DeckProvider>
  );
}

export default App;
