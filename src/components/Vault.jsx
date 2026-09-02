import { AnimatePresence, motion } from "framer-motion";
import { BEERS, houseById } from "../data/beers.js";
import BeerCard from "./BeerCard.jsx";

export default function Vault({ ids, favored, onFav, compare, onCompare }) {
  const beers = BEERS.filter((b) => ids.includes(b.id));
  const comparedBeers = BEERS.filter((b) => compare.includes(b.id));

  return (
    <section id="vault" className="section vault">
      <div className="section-head">
        <p className="eyebrow">Personal vault</p>
        <h2>
          Saved pours &amp; <em>head-to-head</em>
        </h2>
      </div>
      {comparedBeers.length > 0 && (
        <div className="compare-table">
          {comparedBeers.map((b) => {
            const h = houseById(b.house);
            return (
              <motion.div layout key={b.id} className="compare-col">
                <p className="eyebrow">{h?.name}</p>
                <h3>{b.name}</h3>
                <ul>
                  <li>ABV {b.abv}%</li>
                  <li>IBU {b.ibu}</li>
                  <li>{b.style}</li>
                  <li>{b.strength}</li>
                  <li>{b.temp}</li>
                </ul>
                <button className="ghost" onClick={() => onCompare(b.id)}>
                  Remove
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
      <AnimatePresence>
        {beers.length === 0 ? (
          <p className="empty">Vault’s dry. Star a beer to stash it here.</p>
        ) : (
          <div className="card-grid">
            {beers.map((beer) => (
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
        )}
      </AnimatePresence>
    </section>
  );
}
