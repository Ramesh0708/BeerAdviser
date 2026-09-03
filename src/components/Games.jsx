import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SPIN_SLICES, TRIVIA } from "../data/beers.js";
import PourGlass from "./PourGlass.jsx";

const GAMES = [
  { id: "pour", label: "Perfect Pour", emoji: "🍺" },
  { id: "bubbles", label: "Bubble Rush", emoji: "🫧" },
  { id: "trivia", label: "Pub Trivia", emoji: "🧠" },
  { id: "spin", label: "Spin the Tap", emoji: "🎡" },
];

function bestKey(id) {
  return `ba26-best-${id}`;
}

function readBest(id) {
  return Number(localStorage.getItem(bestKey(id)) || 0);
}

function writeBest(id, score) {
  const prev = readBest(id);
  if (score > prev) localStorage.setItem(bestKey(id), String(score));
}

function PerfectPour() {
  const [fill, setFill] = useState(8);
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [last, setLast] = useState(null);
  const [done, setDone] = useState(false);
  const raf = useRef(0);
  const fillRef = useRef(8);

  useEffect(() => {
    if (!running) return undefined;
    const start = performance.now();
    const from = fillRef.current;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 2200);
      const next = from + (100 - from) * t;
      fillRef.current = next;
      setFill(next);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);

  const stop = () => {
    if (!running) return;
    setRunning(false);
    cancelAnimationFrame(raf.current);
    const current = fillRef.current;
    const miss = Math.abs(current - 72);
    const gained = Math.max(0, Math.round(100 - miss * 4));
    const nextScore = score + gained;
    setScore(nextScore);
    setLast({ fill: Math.round(current), gained });
    if (round >= 5) {
      setDone(true);
      writeBest("pour", nextScore);
    } else {
      setRound(round + 1);
      fillRef.current = 8;
      setFill(8);
    }
  };

  const reset = () => {
    setFill(8);
    setRunning(false);
    setRound(1);
    setScore(0);
    setLast(null);
    setDone(false);
  };

  return (
    <div className="game-panel">
      <p className="eyebrow">Stop the pour on the gold band</p>
      <div className="pour-arena">
        <div className="pour-target" />
        <PourGlass fill={fill} color="#f0c75e" size={130} pouring={running} />
      </div>
      <p className="game-meta">
        Round {Math.min(round, 5)} / 5 · Score {score} · Best {readBest("pour")}
      </p>
      {last && <p className="game-flash">Hit {last.fill}% · +{last.gained}</p>}
      {done ? (
        <div className="game-end">
          <h3>{score >= 400 ? "Bartender material." : "Foam happened."}</h3>
          <button className="btn primary" onClick={reset}>
            Pour again
          </button>
        </div>
      ) : (
        <button
          className="btn primary big"
          onClick={() => (running ? stop() : setRunning(true))}
        >
          {running ? "Tap to stop" : "Start pour"}
        </button>
      )}
    </div>
  );
}

function BubbleRush() {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(20);
  const [live, setLive] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    if (!live) return undefined;
    const spawn = setInterval(() => {
      idRef.current += 1;
      setBubbles((prev) => [
        ...prev.slice(-14),
        {
          id: idRef.current,
          x: 8 + Math.random() * 84,
          gold: Math.random() > 0.82,
          size: 28 + Math.random() * 28,
        },
      ]);
    }, 380);
    const clock = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          setLive(false);
          writeBest("bubbles", score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      clearInterval(spawn);
      clearInterval(clock);
    };
  }, [live, score]);

  const pop = (id, gold) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setScore((s) => s + (gold ? 5 : 1));
  };

  const start = () => {
    setBubbles([]);
    setScore(0);
    setTime(20);
    setLive(true);
  };

  return (
    <div className="game-panel">
      <p className="eyebrow">Pop the foam. Gold bubbles are worth 5.</p>
      <p className="game-meta">
        {time}s · {score} pts · Best {readBest("bubbles")}
      </p>
      <div className="bubble-arena">
        {!live && time === 20 && <p className="empty">Tap start. Don’t let the foam win.</p>}
        {!live && time === 0 && (
          <div className="game-end">
            <h3>{score} pops</h3>
            <button className="btn primary" onClick={start}>
              Rush again
            </button>
          </div>
        )}
        {bubbles.map((b) => (
          <motion.button
            key={b.id}
            className={`foam-dot ${b.gold ? "gold" : ""}`}
            style={{ left: `${b.x}%`, width: b.size, height: b.size }}
            initial={{ y: 220, opacity: 0 }}
            animate={{ y: -40, opacity: 1 }}
            transition={{ duration: 2.4, ease: "linear" }}
            onClick={() => pop(b.id, b.gold)}
          />
        ))}
      </div>
      {!live && time !== 0 && (
        <button className="btn primary big" onClick={start}>
          Start rush
        </button>
      )}
    </div>
  );
}

function PubTrivia() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const q = TRIVIA[i];
  const finished = i >= TRIVIA.length;

  const choose = (idx) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    setPicked(null);
    setI((n) => n + 1);
  };

  useEffect(() => {
    if (finished) writeBest("trivia", score);
  }, [finished, score]);

  const reset = () => {
    setI(0);
    setPicked(null);
    setScore(0);
  };

  if (finished) {
    return (
      <div className="game-panel">
        <h3>
          {score}/{TRIVIA.length} — {score >= 8 ? "Pub champion." : "Another round, bartender."}
        </h3>
        <p className="game-meta">Best {readBest("trivia")}/{TRIVIA.length}</p>
        <button className="btn primary" onClick={reset}>
          Play again
        </button>
      </div>
    );
  }

  return (
    <div className="game-panel">
      <p className="eyebrow">
        Question {i + 1} / {TRIVIA.length} · {score} correct
      </p>
      <h3>{q.q}</h3>
      <div className="quiz-opts">
        {q.options.map((opt, idx) => {
          let cls = "opt";
          if (picked !== null) {
            if (idx === q.answer) cls += " good";
            else if (idx === picked) cls += " bad";
          }
          return (
            <button key={opt} className={cls} onClick={() => choose(idx)}>
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <button className="btn primary" onClick={next}>
          {i === TRIVIA.length - 1 ? "See score" : "Next"}
        </button>
      )}
    </div>
  );
}

function SpinTap() {
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState(null);

  const spin = () => {
    if (spinning) return;
    const idx = Math.floor(Math.random() * SPIN_SLICES.length);
    const extra = 360 * (5 + Math.floor(Math.random() * 3));
    const slice = 360 / SPIN_SLICES.length;
    const next = extra + (360 - idx * slice) - slice / 2;
    setSpinning(true);
    setLanded(null);
    setRot((r) => r + next);
    setTimeout(() => {
      setLanded(SPIN_SLICES[idx]);
      setSpinning(false);
    }, 2800);
  };

  return (
    <div className="game-panel">
      <p className="eyebrow">Party wheel. Hydrate slices count double in real life.</p>
      <div className="wheel-wrap">
        <div className="wheel-pointer" />
        <motion.div
          className="wheel"
          animate={{ rotate: rot }}
          transition={{ duration: 2.7, ease: [0.15, 0.8, 0.1, 1] }}
        >
          {SPIN_SLICES.map((s, i) => (
            <span
              key={s.label}
              className="wheel-slice"
              style={{ transform: `rotate(${i * (360 / SPIN_SLICES.length)}deg)` }}
            >
              {s.label}
            </span>
          ))}
        </motion.div>
      </div>
      <button className="btn primary big" onClick={spin} disabled={spinning}>
        {spinning ? "Spinning…" : "Spin the tap"}
      </button>
      {landed && (
        <motion.p className="game-flash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <strong>{landed.label}.</strong> {landed.copy}
        </motion.p>
      )}
    </div>
  );
}

export default function Games() {
  const [tab, setTab] = useState("pour");
  return (
    <section id="arcade" className="section arcade">
      <div className="section-head">
        <p className="eyebrow">Arcade</p>
        <h2>
          Games for the <em>table, the group chat, the wait</em>
        </h2>
        <p className="lede">
          Perfect pours, bubble rushes, pub trivia, and a tap wheel. Scores live in this browser.
        </p>
      </div>
      <div className="mood-row">
        {GAMES.map((g) => (
          <button key={g.id} className={`chip ${tab === g.id ? "on" : ""}`} onClick={() => setTab(g.id)}>
            {g.emoji} {g.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
        >
          {tab === "pour" && <PerfectPour />}
          {tab === "bubbles" && <BubbleRush />}
          {tab === "trivia" && <PubTrivia />}
          {tab === "spin" && <SpinTap />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
