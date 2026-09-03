import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { HOUSES } from "../data/beers.js";
import { shuffle } from "../lib/lastCard.js";

const BOARD_KEY = "ba26-pairs-board";

function readBoard() {
  try {
    return JSON.parse(localStorage.getItem(BOARD_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeScore(moves, ms) {
  const board = readBoard();
  board.push({ name: "You", wins: 1, moves, ms, last: Date.now() });
  board.sort((a, b) => a.moves - b.moves || a.ms - b.ms);
  const next = board.slice(0, 8);
  localStorage.setItem(BOARD_KEY, JSON.stringify(next));
  return next;
}

function deal() {
  const houses = HOUSES.slice(0, 8);
  return shuffle(
    houses.flatMap((h) => [
      { key: `${h.id}-a`, house: h.id, name: h.name, accent: h.accent },
      { key: `${h.id}-b`, house: h.id, name: h.name, accent: h.accent },
    ])
  );
}

export default function HousePairs() {
  const [cards, setCards] = useState(deal);
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [started, setStarted] = useState(0);
  const [board, setBoard] = useState(readBoard);
  const done = matched.length === 8;

  const flip = (key) => {
    if (lock || open.includes(key) || matched.some((id) => cards.find((c) => c.key === key)?.house === id)) return;
    const card = cards.find((c) => c.key === key);
    if (!card || matched.includes(card.house)) return;
    const nextOpen = [...open, key];
    if (!started) setStarted(Date.now());
    if (nextOpen.length === 1) {
      setOpen(nextOpen);
      return;
    }
    setMoves((m) => m + 1);
    const a = cards.find((c) => c.key === nextOpen[0]);
    const b = cards.find((c) => c.key === nextOpen[1]);
    if (a.house === b.house) {
      const nextMatched = [...matched, a.house];
      setMatched(nextMatched);
      setOpen([]);
      if (nextMatched.length === 8) {
        setBoard(writeScore(moves + 1, Date.now() - (started || Date.now())));
      }
    } else {
      setOpen(nextOpen);
      setLock(true);
      window.setTimeout(() => {
        setOpen([]);
        setLock(false);
      }, 700);
    }
  };

  const reset = () => {
    setCards(deal());
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setLock(false);
    setStarted(0);
  };

  const best = useMemo(() => board[0], [board]);

  return (
    <div className="game-panel pairs-panel">
      <p className="eyebrow">House Pairs · a quick memory round</p>
      <h3>Flip two cards. Match the houses. Beat your own board.</h3>
      <p className="game-meta">
        {moves} moves{best ? ` · hall best ${best.moves} moves` : ""}
        {done ? " · cellar cleared" : ""}
      </p>
      <div className="pairs-grid">
        {cards.map((card) => {
          const face = open.includes(card.key) || matched.includes(card.house);
          return (
            <motion.button
              key={card.key}
              type="button"
              className={`pair-card ${face ? "up" : ""} ${matched.includes(card.house) ? "got" : ""}`}
              onClick={() => flip(card.key)}
              whileTap={{ scale: 0.96 }}
              style={face ? { borderColor: card.accent } : undefined}
            >
              {face ? card.name : "🂠"}
            </motion.button>
          );
        })}
      </div>
      <button className="btn primary" onClick={reset}>
        Shuffle again
      </button>
      {board.length > 0 && (
        <div className="scoreboard">
          <p className="eyebrow">Fastest cellars</p>
          <ol>
            {board.map((r, i) => (
              <li key={`${r.last}-${i}`}>
                <strong>Run {i + 1}</strong>
                <span>
                  {r.moves} moves · {(r.ms / 1000).toFixed(1)}s
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
