import { useEffect, useMemo, useRef, useState } from "react";
import { usePeerRoom } from "../hooks/usePeerRoom.js";
import {
  applyAction,
  addPlayer,
  botAction,
  cardLabel,
  canPlay,
  createLobby,
  dealRound,
  publicView,
  readBoard,
  roomCode,
  writeBoardWin,
} from "../lib/lastCard.js";

function parseRoom() {
  const m = location.hash.replace("#", "").match(/^cards\/([A-Z0-9]{4,8})$/i);
  return m ? m[1].toUpperCase() : "";
}

function shareLink(code) {
  return `${location.origin}${location.pathname}#cards/${code}`;
}

function CardFace({ card, selected, disabled, onClick }) {
  if (card.hidden) {
    return <div className="lc-card back" aria-hidden="true" />;
  }
  return (
    <button
      type="button"
      className={`lc-card ${card.color} ${selected ? "sel" : ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span>{cardLabel(card)}</span>
    </button>
  );
}

export default function LastCard() {
  const [name, setName] = useState(() => localStorage.getItem("ba26-name") || "");
  const [joinCode, setJoinCode] = useState(() => parseRoom());
  const [room, setRoom] = useState("");
  const [host, setHost] = useState(false);
  const [state, setState] = useState(null);
  const [picked, setPicked] = useState(null);
  const [needColor, setNeedColor] = useState(false);
  const [copied, setCopied] = useState(false);
  const [board, setBoard] = useState(() => readBoard());
  const stateRef = useRef(null);
  const myIdRef = useRef("");
  const hostRef = useRef(false);

  const seated = Boolean(room && name);
  const peer = usePeerRoom({ room: seated ? room : "", name, host });

  useEffect(() => {
    hostRef.current = host;
  }, [host]);

  useEffect(() => {
    const onHash = () => {
      const code = parseRoom();
      if (code) setJoinCode(code);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const fanout = (next) => {
    stateRef.current = next;
    setState(next);
    if (!hostRef.current) return;
    peer.sendEach((remoteId) => ({
      type: "state",
      you: remoteId,
      state: publicView(next, remoteId),
    }));
  };

  useEffect(() => {
    peer.setHandlers({
      onMessage: (data, fromId) => {
        if (data.type === "hello" && hostRef.current) {
          const next = addPlayer(stateRef.current, { id: fromId, name: data.name });
          fanout(next);
          peer.send({ type: "welcome", you: fromId, state: publicView(next, fromId) }, fromId);
        }
        if (data.type === "welcome" && !hostRef.current) {
          myIdRef.current = data.you;
          setState(data.state);
        }
        if (data.type === "state" && !hostRef.current) {
          if (data.you) myIdRef.current = data.you;
          setState(data.state);
        }
        if (data.type === "action" && hostRef.current) {
          runAction(fromId, data.action);
        }
      },
      onLeave: (id) => {
        if (!hostRef.current) return;
        const cur = stateRef.current;
        if (!cur || cur.phase !== "lobby") return;
        if (!cur.players[id]) return;
        const { [id]: _gone, ...players } = cur.players;
        fanout({
          ...cur,
          order: cur.order.filter((pid) => pid !== id),
          players,
          log: [`${cur.players[id].name} left.`, ...cur.log].slice(0, 8),
        });
      },
    });
  }, [peer.status]);

  const runAction = (playerId, action) => {
    if (!hostRef.current) {
      peer.send({ type: "action", action });
      return;
    }
    let next = applyAction(stateRef.current, playerId, action);
    if (next.phase === "roundOver" && next.winner && next.lastPot) {
      const champ = next.players[next.winner];
      setBoard(writeBoardWin(champ.name, next.lastPot));
    }
    fanout(next);
    maybeBot(next);
  };

  const maybeBot = (next) => {
    if (!hostRef.current || next.phase !== "play") return;
    const actor = next.players[next.turn];
    if (!actor?.bot) return;
    window.setTimeout(() => {
      const cur = stateRef.current;
      if (!cur || cur.turn !== actor.id || cur.phase !== "play") return;
      runAction(actor.id, botAction(cur, actor.id));
    }, 700);
  };

  const startTable = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem("ba26-name", trimmed);
    const code = roomCode();
    myIdRef.current = "host";
    setHost(true);
    setRoom(code);
    setState(createLobby({ id: "host", name: trimmed }));
    location.hash = `cards/${code}`;
  };

  const joinTable = () => {
    const trimmed = name.trim();
    const code = joinCode.trim().toUpperCase();
    if (!trimmed || code.length < 4) return;
    localStorage.setItem("ba26-name", trimmed);
    setHost(false);
    setRoom(code);
    location.hash = `cards/${code}`;
  };

  const leaveTable = () => {
    setRoom("");
    setHost(false);
    setState(null);
    setPicked(null);
    setNeedColor(false);
    myIdRef.current = "";
    if (/^#cards\//i.test(location.hash)) location.hash = "cards";
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink(room));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const myId = host ? "host" : myIdRef.current;
  const hand = state?.hands?.[myId]?.filter((c) => !c.hidden) || [];
  const top = state?.discard?.[0];
  const myTurn = state?.turn === myId && state?.phase === "play";
  const deckCount = state?.deck?.length ?? state?.deckCount ?? 0;

  const playable = useMemo(() => {
    if (!state || !myTurn) return new Set();
    return new Set(hand.filter((c) => canPlay(c, top, state.color, state.pendingDraw)).map((c) => c.id));
  }, [hand, myTurn, state, top]);

  const play = (card) => {
    if (!myTurn || !playable.has(card.id)) return;
    if (card.color === "wild") {
      setPicked(card.id);
      setNeedColor(true);
      return;
    }
    runAction(myId, { type: "play", cardId: card.id });
    setPicked(null);
  };

  const chooseColor = (color) => {
    const cardId = picked;
    setNeedColor(false);
    setPicked(null);
    if (cardId) runAction(myId, { type: "play", cardId, color });
    else runAction(myId, { type: "color", color });
  };

  const invited = Boolean(joinCode) && !seated;

  if (!seated) {
    return (
      <div className="game-panel cards-gate">
        <p className="eyebrow">Last Card · share a link, pile in</p>
        <h3>Color-match like the classic. 2–6 players, one table on this site.</h3>
        <p className="game-meta">
          One person starts a table, copies the link, and everyone else joins in this tab. Match
          color or rank, dump your hand, and the scoreboard keeps the bragging rights.
        </p>
        {invited && (
          <p className="invite-banner">
            You’re invited to table <strong>{joinCode}</strong>. Type a name and sit down.
          </p>
        )}
        <label className="field">
          Your name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="What do we call you?" />
        </label>
        <div className="card-actions">
          <button className="btn primary" onClick={startTable} disabled={!name.trim()}>
            Start a table
          </button>
        </div>
        <p className="game-meta">Or jump into a friend’s table</p>
        <label className="field">
          Table code
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="F7K2Q"
          />
        </label>
        <button className="btn ghost" onClick={joinTable} disabled={!name.trim() || joinCode.length < 4}>
          Join table
        </button>
        <Scoreboard board={board} />
      </div>
    );
  }

  if (!state) {
    return (
      <div className="game-panel">
        <p className="eyebrow">Table {room}</p>
        <h3>{peer.status === "error" ? "Couldn’t sit down" : "Pulling up a chair…"}</h3>
        {peer.error && <p className="deny">{peer.error}</p>}
        <p className="game-meta">Share {shareLink(room)}</p>
        <button className="btn ghost" onClick={leaveTable}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="game-panel last-card">
      <header className="lc-head">
        <div>
          <p className="eyebrow">Last Card · {room}</p>
          <h3>{state.phase === "lobby" ? "Waiting on the crew" : "Match color or rank"}</h3>
        </div>
        <div className="lc-share">
          <code>{shareLink(room)}</code>
          <button className="btn tiny" onClick={copyLink}>
            {copied ? "Copied" : "Copy link"}
          </button>
          <button className="btn tiny ghost" onClick={leaveTable}>
            Leave
          </button>
        </div>
      </header>
      {peer.error && <p className="deny">{peer.error} You can still play with house bots on this device.</p>}

      <ol className="lc-board">
        {state.order.map((id) => {
          const p = state.players[id];
          const count = (state.hands[id] || []).length;
          return (
            <li key={id} className={state.turn === id ? "on" : ""}>
              <strong>{p.name}</strong>
              <span>{state.phase === "play" ? `${count} cards` : "ready"}</span>
              <em>
                {p.score} pts · {p.wins} wins
              </em>
            </li>
          );
        })}
      </ol>

      {state.phase === "lobby" && host && (
        <div className="card-actions">
          <button
            className="btn ghost"
            onClick={() =>
              fanout(
                addPlayer(state, {
                  id: `bot-${Date.now()}`,
                  name: `House Bot ${state.order.length}`,
                  bot: true,
                })
              )
            }
          >
            Add a house bot
          </button>
          <button
            className="btn primary"
            disabled={state.order.length < 2}
            onClick={() => {
              const next = dealRound(state);
              fanout(next);
              maybeBot(next);
            }}
          >
            Deal
          </button>
        </div>
      )}
      {state.phase === "lobby" && !host && <p className="game-meta">Waiting for the host to deal.</p>}

      {state.phase === "play" && (
        <>
          <div className="lc-table">
            <div className={`lc-card ${state.color} pile`} aria-hidden>
              <span>DECK {deckCount}</span>
            </div>
            {top && <CardFace card={top} disabled />}
            <p className="game-meta">
              Color <b style={{ color: "var(--foam)" }}>{state.color}</b>
              {state.pendingDraw ? ` · next draws ${state.pendingDraw}` : ""}
              {myTurn ? " · your turn" : ` · ${state.players[state.turn]?.name}'s turn`}
            </p>
          </div>
          <div className="lc-hand">
            {hand.map((card) => (
              <CardFace
                key={card.id}
                card={card}
                selected={picked === card.id}
                disabled={!myTurn || !playable.has(card.id)}
                onClick={() => play(card)}
              />
            ))}
          </div>
          {myTurn && (
            <button className="btn ghost" onClick={() => runAction(myId, { type: "draw" })}>
              Draw {state.pendingDraw || 1}
            </button>
          )}
          {needColor && (
            <div className="color-pick">
              {["red", "yellow", "green", "blue"].map((c) => (
                <button key={c} className={`swatch ${c}`} onClick={() => chooseColor(c)}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {state.phase === "roundOver" && (
        <div className="game-end">
          <h3>{state.players[state.winner]?.name} takes the round.</h3>
          {host && (
            <button
              className="btn primary"
              onClick={() => {
                const next = dealRound(state);
                fanout(next);
                maybeBot(next);
              }}
            >
              Deal again
            </button>
          )}
        </div>
      )}

      <ul className="lc-log">
        {state.log.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      <Scoreboard board={board} live={state.players} />
    </div>
  );
}

function Scoreboard({ board, live }) {
  const rows = live
    ? Object.values(live).sort((a, b) => b.wins - a.wins || b.score - a.score)
    : board;
  if (!rows?.length) return null;
  return (
    <div className="scoreboard">
      <p className="eyebrow">{live ? "This table" : "Hall of foam"}</p>
      <ol>
        {rows.map((r) => (
          <li key={r.name}>
            <strong>{r.name}</strong>
            <span>
              {r.wins} wins
              {r.score != null ? ` · ${r.score} pts` : r.points != null ? ` · ${r.points} pts` : ""}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
