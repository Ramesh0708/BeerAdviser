export const COLORS = ["red", "yellow", "green", "blue"];

export function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function makeDeck() {
  const cards = [];
  let id = 1;
  for (const color of COLORS) {
    cards.push({ id: id++, color, rank: "0" });
    for (let n = 1; n <= 9; n += 1) {
      cards.push({ id: id++, color, rank: String(n) });
      cards.push({ id: id++, color, rank: String(n) });
    }
    for (const rank of ["skip", "reverse", "plus2"]) {
      cards.push({ id: id++, color, rank });
      cards.push({ id: id++, color, rank });
    }
  }
  for (let i = 0; i < 4; i += 1) {
    cards.push({ id: id++, color: "wild", rank: "wild" });
    cards.push({ id: id++, color: "wild", rank: "plus4" });
  }
  return shuffle(cards);
}

export function cardLabel(card) {
  if (card.rank === "plus2") return "+2";
  if (card.rank === "plus4") return "+4";
  if (card.rank === "skip") return "⊘";
  if (card.rank === "reverse") return "↺";
  if (card.rank === "wild") return "W";
  return card.rank;
}

export function cardValue(card) {
  if (card.rank === "wild" || card.rank === "plus4") return 50;
  if (["skip", "reverse", "plus2"].includes(card.rank)) return 20;
  return Number(card.rank) || 0;
}

export function canPlay(card, top, color, pendingDraw = 0) {
  if (!top) return true;
  if (pendingDraw) return card.rank === "plus2" || card.rank === "plus4";
  if (card.rank === "wild" || card.rank === "plus4") return true;
  return card.color === color || card.rank === top.rank;
}

export function roomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 5; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function nextIndex(state, from, skip = 0) {
  const n = state.order.length;
  let i = from;
  for (let s = 0; s <= skip; s += 1) {
    i = (i + state.direction + n) % n;
  }
  return i;
}

export function createLobby(host) {
  return {
    phase: "lobby",
    order: [host.id],
    players: {
      [host.id]: { id: host.id, name: host.name, bot: !!host.bot, score: 0, wins: 0 },
    },
    hands: {},
    deck: [],
    discard: [],
    color: "red",
    turn: host.id,
    direction: 1,
    pendingDraw: 0,
    winner: null,
    lastPot: 0,
    log: ["Table opened. Share the link."],
    choosingColor: null,
  };
}

export function addPlayer(state, player) {
  if (state.players[player.id] || state.order.length >= 6) return state;
  return {
    ...state,
    order: [...state.order, player.id],
    players: {
      ...state.players,
      [player.id]: { id: player.id, name: player.name, bot: !!player.bot, score: 0, wins: 0 },
    },
    log: [`${player.name} sat down.`, ...state.log].slice(0, 8),
  };
}

export function dealRound(state) {
  let deck = makeDeck();
  const hands = {};
  state.order.forEach((id) => {
    hands[id] = deck.slice(0, 7);
    deck = deck.slice(7);
  });
  let top = deck[0];
  deck = deck.slice(1);
  let color = top.color === "wild" ? COLORS[Math.floor(Math.random() * 4)] : top.color;
  if (top.rank === "wild" || top.rank === "plus4") {
    top = { ...top, color };
  }
  return {
    ...state,
    phase: "play",
    hands,
    deck,
    discard: [top],
    color,
    turn: state.order[0],
    direction: 1,
    pendingDraw: 0,
    winner: null,
    lastPot: 0,
    choosingColor: null,
    log: ["Cards dealt. Match color or rank.", ...state.log].slice(0, 8),
  };
}

function drawFromDeck(state, n) {
  let deck = [...state.deck];
  let discard = [...state.discard];
  if (deck.length < n) {
    const keep = discard[0];
    deck = shuffle([...deck, ...discard.slice(1)]);
    discard = [keep];
  }
  const taken = deck.slice(0, n);
  return { deck: deck.slice(n), discard, taken };
}

export function applyAction(state, playerId, action) {
  if (state.phase !== "play") return state;
  if (state.turn !== playerId) return state;
  if (state.choosingColor && action.type !== "color") return state;

  if (action.type === "draw") {
    const need = state.pendingDraw || 1;
    const { deck, discard, taken } = drawFromDeck(state, need);
    const hand = [...state.hands[playerId], ...taken];
    const nxt = state.order[nextIndex(state, state.order.indexOf(playerId))];
    return {
      ...state,
      deck,
      discard,
      hands: { ...state.hands, [playerId]: hand },
      pendingDraw: 0,
      turn: nxt,
      log: [`${state.players[playerId].name} drew ${need}.`, ...state.log].slice(0, 8),
    };
  }

  if (action.type === "color") {
    const nxt = state.order[nextIndex(state, state.order.indexOf(playerId))];
    return {
      ...state,
      color: action.color,
      choosingColor: null,
      turn: nxt,
      log: [`Color is ${action.color}.`, ...state.log].slice(0, 8),
    };
  }

  if (action.type === "play") {
    const hand = state.hands[playerId] || [];
    const card = hand.find((c) => c.id === action.cardId);
    const top = state.discard[0];
    if (!card || !canPlay(card, top, state.color, state.pendingDraw)) return state;

    const nextHand = hand.filter((c) => c.id !== action.cardId);
    let color = card.color === "wild" ? state.color : card.color;
    let pendingDraw = state.pendingDraw;
    let skip = 0;
    let direction = state.direction;
    let choosingColor = null;

    if (card.rank === "plus2") pendingDraw += 2;
    if (card.rank === "plus4") pendingDraw += 4;
    if (card.rank === "skip") skip = 1;
    if (card.rank === "reverse") {
      direction *= -1;
      if (state.order.length === 2) skip = 1;
    }
    if (card.rank === "wild" || card.rank === "plus4") {
      if (action.color) color = action.color;
      else choosingColor = playerId;
    }

    const played = { ...card, color: card.color === "wild" ? color : card.color };
    let winner = null;
    let phase = "play";
    let lastPot = 0;
    const players = { ...state.players };
    if (nextHand.length === 0) {
      winner = playerId;
      phase = "roundOver";
      lastPot = state.order
        .filter((id) => id !== playerId)
        .reduce((s, id) => s + (state.hands[id] || []).reduce((a, c) => a + cardValue(c), 0), 0) + 50;
      players[playerId] = {
        ...players[playerId],
        score: players[playerId].score + lastPot,
        wins: players[playerId].wins + 1,
      };
    }

    const from = state.order.indexOf(playerId);
    const turn =
      choosingColor || phase === "roundOver"
        ? playerId
        : state.order[nextIndex({ ...state, direction }, from, skip)];

    return {
      ...state,
      hands: { ...state.hands, [playerId]: nextHand },
      discard: [played, ...state.discard],
      color,
      pendingDraw: choosingColor ? pendingDraw : pendingDraw,
      direction,
      turn,
      choosingColor,
      winner,
      lastPot,
      phase,
      players,
      log: [
        winner
          ? `${players[playerId].name} wins the round!`
          : `${state.players[playerId].name} played ${cardLabel(card)}.`,
        ...state.log,
      ].slice(0, 8),
    };
  }

  return state;
}

export function botAction(state, botId) {
  const hand = state.hands[botId] || [];
  if (state.choosingColor === botId) {
    return { type: "color", color: COLORS[Math.floor(Math.random() * 4)] };
  }
  if (state.pendingDraw) return { type: "draw" };
  const playable = hand.filter((c) => canPlay(c, state.discard[0], state.color, state.pendingDraw));
  if (!playable.length) return { type: "draw" };
  const card = playable[0];
  const color = card.color === "wild" ? COLORS[Math.floor(Math.random() * 4)] : undefined;
  return { type: "play", cardId: card.id, color };
}

export function publicView(state, viewerId) {
  const hands = state.hands || {};
  const discard = state.discard || [];
  return {
    ...state,
    deck: undefined,
    hands: Object.fromEntries(
      Object.entries(hands).map(([id, cards]) => [
        id,
        id === viewerId ? cards : cards.map((c) => ({ id: c.id, hidden: true })),
      ])
    ),
    discard: discard.slice(0, 3),
    deckCount: state.deck?.length ?? state.deckCount ?? 0,
  };
}

const BOARD_KEY = "ba26-lastcard-board";

export function readBoard() {
  try {
    return JSON.parse(localStorage.getItem(BOARD_KEY) || "[]");
  } catch {
    return [];
  }
}

export function writeBoardWin(name, points) {
  const board = readBoard();
  const i = board.findIndex((r) => r.name.toLowerCase() === name.toLowerCase());
  if (i >= 0) {
    board[i] = {
      ...board[i],
      wins: board[i].wins + 1,
      points: board[i].points + points,
      last: Date.now(),
    };
  } else {
    board.push({ name, wins: 1, points, last: Date.now() });
  }
  board.sort((a, b) => b.wins - a.wins || b.points - a.points);
  localStorage.setItem(BOARD_KEY, JSON.stringify(board.slice(0, 20)));
  return board;
}
