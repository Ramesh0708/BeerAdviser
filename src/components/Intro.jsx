import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function Intro({ onEnter }) {
  const [step, setStep] = useState("age");
  const [denied, setDenied] = useState(false);

  const enter = () => {
    setStep("pour");
    setTimeout(onEnter, 1600);
  };

  return (
    <motion.div
      className="intro"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 0.6 }}
    >
      <div className="intro-grain" />
      <motion.div
        className="intro-orb"
        animate={{ scale: [1, 1.15, 1], x: [0, 30, -20, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <AnimatePresence mode="wait">
        {step === "age" && (
          <motion.div
            key="age"
            className="intro-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
          >
            <p className="eyebrow">Beer Adviser · Cellar 2026</p>
            <h1>
              Are you old enough
              <br />
              <em>to pull the tap?</em>
            </h1>
            <p className="lede">
              This pour is for adults. Confirm you are 18+ to enter the house.
            </p>
            {denied && (
              <motion.p className="deny" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Come back when the bartender nods. Enjoy a lime soda for now.
              </motion.p>
            )}
            <div className="intro-actions">
              <motion.button
                className="btn primary"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={enter}
              >
                I’m 18+ · Pour it
              </motion.button>
              <button className="btn ghost" onClick={() => setDenied(true)}>
                Not yet
              </button>
            </div>
          </motion.div>
        )}
        {step === "pour" && (
          <motion.div
            key="pour"
            className="intro-card pour-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="tap-stream"
              initial={{ height: 0 }}
              animate={{ height: 180 }}
              transition={{ duration: 0.8, ease: "easeIn" }}
            />
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Finding the foam…
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
