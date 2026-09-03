import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { beersForHouse, HOUSES } from "../data/beers.js";
import PourGlass from "./PourGlass.jsx";

export default function BrandLore() {
  const [id, setId] = useState(HOUSES[0].id);
  const house = HOUSES.find((h) => h.id === id) || HOUSES[0];
  const pours = beersForHouse(house.id);

  return (
    <section id="houses" className="section lore">
      <div className="section-head">
        <p className="eyebrow">House histories</p>
        <h2>
          Brands, lore, and <em>why the glass looks like that</em>
        </h2>
        <p className="lede">
          Twelve houses. Leases, yeasts, lime wedges, and a bird that owned cricket nights.
        </p>
      </div>
      <div className="lore-pills">
        {HOUSES.map((h) => (
          <button
            key={h.id}
            className={`chip ${id === h.id ? "on" : ""}`}
            onClick={() => setId(h.id)}
          >
            {h.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.article
          key={house.id}
          className="lore-card"
          style={{ "--accent": house.accent, "--glow": house.glow }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
        >
          <div className="lore-hero" style={{ background: house.gradient }}>
            <PourGlass fill={68} color={house.accent} size={90} />
            <div>
              <p className="eyebrow">{house.origin} · {house.since}</p>
              <h3>{house.name}</h3>
              <p className="lede">{house.story}</p>
            </div>
          </div>
          <ol className="timeline">
            {house.timeline?.map((t) => (
              <li key={t.year}>
                <strong>{t.year}</strong>
                <span>{t.event}</span>
              </li>
            ))}
          </ol>
          <p className="eyebrow">In the cellar</p>
          <ul className="lore-pours">
            {pours.map((b) => (
              <li key={b.id}>
                <b>{b.name}</b>
                <span>
                  {b.style} · {b.abv}% · {b.temp}
                </span>
              </li>
            ))}
          </ul>
        </motion.article>
      </AnimatePresence>
    </section>
  );
}
