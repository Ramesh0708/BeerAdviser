import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { beersForHouse, HOUSES } from "../data/beers.js";
import BeerCard from "./BeerCard.jsx";
import PourGlass from "./PourGlass.jsx";

export default function Advisor({ favored, onFav, compare, onCompare }) {
  const [house, setHouse] = useState("Kingfisher");
  const [poured, setPoured] = useState(false);
  const [pouring, setPouring] = useState(false);
  const picks = useMemo(() => beersForHouse(house), [house]);
  const active = HOUSES.find((h) => h.id === house);

  const findBeer = () => {
    setPouring(true);
    setPoured(false);
    setTimeout(() => {
      setPouring(false);
      setPoured(true);
    }, 700);
  };

  return (
    <section id="advisor" className="section advisor">
      <div className="section-head">
        <p className="eyebrow">The move</p>
        <h2>
          Choose a house, then hit <em>Find Beer!</em>
        </h2>
        <p className="lede">
          Twelve houses on the tap list — pick one and we’ll line up the pours, pairings, and
          strength.
        </p>
      </div>

      <div className="house-grid">
        {HOUSES.map((h) => (
          <motion.button
            key={h.id}
            className={`house ${house === h.id ? "active" : ""}`}
            style={{ "--accent": h.accent, "--glow": h.glow, background: h.gradient }}
            onClick={() => {
              setHouse(h.id);
              setPoured(false);
            }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            layout
          >
            {house === h.id && (
              <motion.span
                layoutId="house-glow"
                className="house-glow"
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              />
            )}
            <span className="house-tag">{h.tag}</span>
            <strong>{h.name}</strong>
            <span className="house-meta">
              {h.origin} · since {h.since}
            </span>
            <em>{h.blurb}</em>
          </motion.button>
        ))}
      </div>

      <div className="find-row">
        <PourGlass
          fill={pouring ? 90 : poured ? 70 : 28}
          color={active?.accent}
          size={70}
          pouring={pouring}
        />
        <div>
          <p className="eyebrow">The cellar says</p>
          <h3>{active?.name}</h3>
          <p>{active?.vibe}</p>
        </div>
        <motion.button
          className="btn primary big"
          onClick={findBeer}
          whileHover={{ scale: 1.05, rotate: -1 }}
          whileTap={{ scale: 0.95 }}
        >
          Find Beer!
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {!poured && (
          <motion.p key="empty" className="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            No beers selected — tap Find Beer! and we’ll pour the list.
          </motion.p>
        )}
        {poured && (
          <motion.div
            key={house}
            className="card-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {picks.map((beer, i) => (
              <motion.div
                key={beer.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <BeerCard
                  beer={beer}
                  favored={favored(beer.id)}
                  onFav={onFav}
                  compared={compare.includes(beer.id)}
                  onCompare={onCompare}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
