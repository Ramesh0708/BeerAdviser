import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { BEERS, HOUSES } from "../data/beers.js";
import PourGlass from "./PourGlass.jsx";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="top" className="hero" ref={ref}>
      <motion.div className="hero-copy" style={{ y, opacity }}>
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Cellar · arcade · taste DNA · 2026
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 120 }}
        >
          Pick a house.
          <br />
          <em>We’ll pick the pour.</em>
        </motion.h1>
        <motion.p
          className="lede"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Twelve houses from Kingfisher to Guinness, with histories, food pairings, mood matching,
          a taste quiz, Last Card with friends, and a bottle that deals truth or dare.
        </motion.p>
        <div className="hero-cta">
          <motion.a
            className="btn primary"
            href="#advisor"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            Find Beer!
          </motion.a>
          <a className="btn ghost" href="#arcade">
            Play the arcade
          </a>
        </div>
        <ul className="stats">
          {[
            [String(HOUSES.length), "houses"],
            [String(BEERS.length), "pours"],
            ["6", "games"],
            ["∞", "nights"],
          ].map(([n, l]) => (
            <li key={l}>
              <strong>{n}</strong>
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </motion.div>
      <motion.div
        className="hero-stage"
        initial={{ opacity: 0, scale: 0.9, rotate: 6 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 80, delay: 0.15 }}
      >
        <div className="hero-ring" />
        <PourGlass fill={74} color="#f0c75e" size={180} pouring />
        <motion.div
          className="float-chip"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3.2, repeat: Infinity }}
        >
          Histories, hops, and high scores
        </motion.div>
      </motion.div>
    </section>
  );
}
