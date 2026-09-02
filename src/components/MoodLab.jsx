import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { beersForMood, MOODS } from "../data/beers.js";
import BeerCard from "./BeerCard.jsx";

export default function MoodLab({ favored, onFav, compare, onCompare }) {
  const [mood, setMood] = useState("match-night");
  const picks = useMemo(() => beersForMood(mood), [mood]);
  const active = MOODS.find((m) => m.id === mood);

  return (
    <section id="mood" className="section mood">
      <div className="section-head">
        <p className="eyebrow">Mood Lab</p>
        <h2>
          What’s the <em>vibe</em> tonight?
        </h2>
        <p className="lede">{active?.copy}</p>
      </div>
      <div className="mood-row">
        {MOODS.map((m) => (
          <motion.button
            key={m.id}
            className={`chip ${mood === m.id ? "on" : ""}`}
            onClick={() => setMood(m.id)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
          >
            <span>{m.emoji}</span> {m.label}
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={mood}
          className="card-grid"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
        >
          {picks.map((beer) => (
            <BeerCard
              key={beer.id}
              beer={beer}
              favored={favored(beer.id)}
              onFav={onFav}
              compared={compare.includes(beer.id)}
              onCompare={onCompare}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
