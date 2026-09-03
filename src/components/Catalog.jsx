import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { BEERS, HOUSES } from "../data/beers.js";
import BeerCard from "./BeerCard.jsx";

export default function Catalog({ favored, onFav, compare, onCompare }) {
  const [q, setQ] = useState("");
  const [house, setHouse] = useState("all");
  const [strength, setStrength] = useState("all");
  const [surprise, setSurprise] = useState(null);

  const list = useMemo(() => {
    return BEERS.filter((b) => {
      const text = `${b.name} ${b.style} ${b.notes} ${b.original}`.toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (house !== "all" && b.house !== house) return false;
      if (strength !== "all" && b.strength !== strength) return false;
      return true;
    });
  }, [q, house, strength]);

  const roll = () => {
    const pool = list.length ? list : BEERS;
    setSurprise(pool[Math.floor(Math.random() * pool.length)]);
    document.getElementById("surprise")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="catalog" className="section catalog">
      <div className="section-head">
        <p className="eyebrow">The cellar</p>
        <h2>
          Every pour in the <em>cellar</em>
        </h2>
      </div>
      <div className="filters">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search hops, malt, magnum…"
        />
        <select value={house} onChange={(e) => setHouse(e.target.value)}>
          <option value="all">All houses</option>
          {HOUSES.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
        <select value={strength} onChange={(e) => setStrength(e.target.value)}>
          <option value="all">Any strength</option>
          <option value="session">Session</option>
          <option value="strong">Strong</option>
        </select>
        <motion.button className="btn primary" onClick={roll} whileTap={{ rotate: 8 }}>
          Surprise me
        </motion.button>
      </div>
      {surprise && (
        <div id="surprise" className="surprise">
          <p className="eyebrow">Tonight’s wild card</p>
          <BeerCard
            beer={surprise}
            favored={favored(surprise.id)}
            onFav={onFav}
            compared={compare.includes(surprise.id)}
            onCompare={onCompare}
          />
        </div>
      )}
      <div className="card-grid">
        {list.map((beer) => (
          <BeerCard
            key={beer.id}
            beer={beer}
            favored={favored(beer.id)}
            onFav={onFav}
            compared={compare.includes(beer.id)}
            onCompare={onCompare}
          />
        ))}
      </div>
      {list.length === 0 && <p className="empty">The cellar’s empty. Loosen the filters.</p>}
    </section>
  );
}
