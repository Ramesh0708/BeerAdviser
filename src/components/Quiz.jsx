import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { QUIZ, scoreQuiz } from "../data/beers.js";
import BeerCard from "./BeerCard.jsx";

export default function Quiz({ favored, onFav, compare, onCompare }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const done = step >= QUIZ.length;
  const result = useMemo(() => (done ? scoreQuiz(answers) : null), [done, answers]);
  const q = QUIZ[step];

  const pick = (id) => {
    const next = [...answers.slice(0, step), id];
    setAnswers(next);
    setStep(step + 1);
  };

  const reset = () => {
    setStep(0);
    setAnswers([]);
  };

  return (
    <section id="quiz" className="section quiz">
      <div className="section-head">
        <p className="eyebrow">Taste DNA</p>
        <h2>
          Five questions. <em>One destined pour.</em>
        </h2>
      </div>

      <div className="quiz-shell">
        <div className="quiz-progress">
          {QUIZ.map((_, i) => (
            <motion.span
              key={i}
              className={i < step ? "done" : i === step ? "now" : ""}
              layout
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          {!done && q && (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <h3>{q.q}</h3>
              <div className="quiz-opts">
                {q.options.map((o) => (
                  <motion.button
                    key={o.id}
                    className="opt"
                    onClick={() => pick(o.id)}
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {o.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          {done && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="quiz-result"
            >
              <p className="eyebrow">Your 2026 pour</p>
              <BeerCard
                beer={result}
                favored={favored(result.id)}
                onFav={onFav}
                compared={compare.includes(result.id)}
                onCompare={onCompare}
              />
              <button className="btn ghost" onClick={reset}>
                Remix my DNA
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
