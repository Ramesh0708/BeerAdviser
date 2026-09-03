import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="foot">
      <div>
        <h3>Beer Adviser 2026</h3>
        <p>
          A cellar of houses, a pocket arcade, and a taste map — for nights that deserve a better
          pour.
        </p>
      </div>
      <div className="foot-links">
        <a href="#advisor">Find Beer</a>
        <a href="#houses">Houses</a>
        <a href="#arcade">Games</a>
        <a href="#cards">Cards</a>
        <a href="#spin">Bottle</a>
        <a href="#quiz">Taste DNA</a>
      </div>
      <motion.p className="legal" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
        Drink responsibly. 18+ only. Brand names belong to their breweries — this is a fan
        guide, not an official store.
      </motion.p>
    </footer>
  );
}
