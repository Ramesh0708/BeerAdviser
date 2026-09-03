import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ADSENSE_SLOTS } from "./ads.config.js";
import Advisor from "./components/Advisor.jsx";
import AdSlot, { AdSenseBoot } from "./components/AdSlot.jsx";
import BrandLore from "./components/BrandLore.jsx";
import Catalog from "./components/Catalog.jsx";
import Footer from "./components/Footer.jsx";
import Games from "./components/Games.jsx";
import Hero from "./components/Hero.jsx";
import Intro from "./components/Intro.jsx";
import MoodLab from "./components/MoodLab.jsx";
import Nav from "./components/Nav.jsx";
import Quiz from "./components/Quiz.jsx";
import Vault from "./components/Vault.jsx";
import { useFavorites } from "./hooks/useFavorites.js";

export default function App() {
  const [ready, setReady] = useState(() => sessionStorage.getItem("ba26-in") === "1");
  const { ids, toggle, has } = useFavorites();
  const [compare, setCompare] = useState([]);

  useEffect(() => {
    document.body.classList.toggle("locked", !ready);
  }, [ready]);

  const onEnter = () => {
    sessionStorage.setItem("ba26-in", "1");
    setReady(true);
  };

  const onCompare = (id) => {
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  return (
    <>
      <AdSenseBoot />
      <AnimatePresence>{!ready && <Intro onEnter={onEnter} />}</AnimatePresence>
      {ready && (
        <>
          <Nav vaultCount={ids.length} />
          <main>
            <Hero />
            <AdSlot slot={ADSENSE_SLOTS.banner} className="ad-banner" />
            <Advisor favored={has} onFav={toggle} compare={compare} onCompare={onCompare} />
            <BrandLore />
            <Games />
            <AdSlot slot={ADSENSE_SLOTS.inline} className="ad-inline" />
            <MoodLab favored={has} onFav={toggle} compare={compare} onCompare={onCompare} />
            <Quiz favored={has} onFav={toggle} compare={compare} onCompare={onCompare} />
            <Catalog favored={has} onFav={toggle} compare={compare} onCompare={onCompare} />
            <Vault
              ids={ids}
              favored={has}
              onFav={toggle}
              compare={compare}
              onCompare={onCompare}
            />
          </main>
          <Footer />
        </>
      )}
    </>
  );
}
