// App.tsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import FiveCard from "./components/fiveCard/FiveCard";
import SingleCard from "./components/singleCard/SingleCard";
import ThreeCard from "./components/threeCard/ThreeCard";
import CustomizeDeck from "./components/customizeDeck/CustomizeDeck";
import { DeckProvider } from "./services/DeckContext";
import { Analytics } from "@vercel/analytics/react";
import Journal from "./components/journal/Journal";
import { JournalProvider } from "./services/JournalContext";
import { AuthProvider } from "./services/AuthContext";
import { PaymentProvider } from "./services/PaymentContext"; // Import PaymentProvider
import Home from "./components/home/Home";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/singleCard" element={<SingleCard />} />
      <Route path="/threeCard" element={<ThreeCard />} />
      <Route path="/fiveCard" element={<FiveCard />} />
      <Route path="/customizeDeck" element={<CustomizeDeck />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

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
      })
      .catch((error) => console.error("Error loading fonts:", error));
  }, []);

  if (!fontsLoaded)
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>Loading...</div>
    );

  return (
    <Router>
      <AuthProvider>
        <PaymentProvider> {/* Wrap PaymentProvider here */}
          <JournalProvider>
            <DeckProvider>
              <main style={{ flex: 1 }}>
                <AppRoutes />
              </main>
              <Analytics />
            </DeckProvider>
          </JournalProvider>
        </PaymentProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
