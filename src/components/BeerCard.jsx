import { motion } from "framer-motion";
import PourGlass from "./PourGlass.jsx";
import { houseById } from "../data/beers.js";

export default function BeerCard({ beer, favored, onFav, onCompare, compared, compact = false }) {
  const house = houseById(beer.house);
  return (
    <motion.article
      layout
      className={`beer-card ${compact ? "compact" : ""}`}
      style={{ "--accent": house?.accent || "#f5c542", "--glow": house?.glow }}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -8, rotate: -0.4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className="card-shine" />
      <header className="card-head">
        <PourGlass fill={Math.min(92, 30 + beer.abv * 7)} color={beer.color} size={compact ? 54 : 72} />
        <div>
          <p className="eyebrow">{house?.name} · {beer.style}</p>
          <h3>{beer.name}</h3>
          <p className="orig">{beer.original}</p>
        </div>
      </header>
      {!compact && <p className="notes">{beer.notes}</p>}
      <div className="meters">
        <label>
          ABV <strong>{beer.abv.toFixed(1)}%</strong>
          <span className="bar">
            <motion.i
              initial={{ width: 0 }}
              whileInView={{ width: `${(beer.abv / 9) * 100}%` }}
              viewport={{ once: true }}
            />
          </span>
        </label>
        <label>
          IBU <strong>{beer.ibu}</strong>
          <span className="bar ibu">
            <motion.i
              initial={{ width: 0 }}
              whileInView={{ width: `${(beer.ibu / 40) * 100}%` }}
              viewport={{ once: true }}
            />
          </span>
        </label>
      </div>
      <p className="pair">
        <span>Pair with</span> {beer.pairing}
      </p>
      <p className="temp">Serve {beer.temp}</p>
      <footer className="card-actions">
        <button className={`ghost ${favored ? "on" : ""}`} onClick={() => onFav(beer.id)}>
          {favored ? "In the vault ★" : "Vault it ☆"}
        </button>
        {onCompare && (
          <button className={`ghost ${compared ? "on" : ""}`} onClick={() => onCompare(beer.id)}>
            {compared ? "Comparing" : "Compare"}
          </button>
        )}
      </footer>
    </motion.article>
  );
}
