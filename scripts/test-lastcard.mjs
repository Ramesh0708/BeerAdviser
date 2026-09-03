import {
  addPlayer,
  applyAction,
  canPlay,
  createLobby,
  dealRound,
  publicView,
} from "../src/lib/lastCard.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const lobby = addPlayer(createLobby({ id: "host", name: "Ada" }), { id: "p2", name: "Bo" });
assert(lobby.order.length === 2, "lobby seats two");

const dealt = dealRound(lobby);
assert(dealt.hands.host.length === 7, "host has 7");
assert(dealt.hands.p2.length === 7, "guest has 7");

const view = publicView(dealt, "p2");
assert(view.hands.p2.every((c) => !c.hidden), "viewer sees own cards");
assert(view.hands.host.every((c) => c.hidden), "viewer does not see host cards");
assert(view.deck === undefined, "deck stripped from public view");

const forced = {
  ...dealt,
  color: "red",
  pendingDraw: 2,
  discard: [{ id: 999, color: "red", rank: "plus2" }],
  hands: {
    host: [{ id: 1, color: "red", rank: "5" }, { id: 2, color: "red", rank: "plus2" }],
    p2: dealt.hands.p2,
  },
};
assert(!canPlay(forced.hands.host[0], forced.discard[0], "red", 2), "cannot dump a 5 under +2");
assert(canPlay(forced.hands.host[1], forced.discard[0], "red", 2), "can stack +2");

const afterDraw = applyAction(forced, "host", { type: "draw" });
assert(afterDraw.hands.host.length === 4, "host drew the pending two");
assert(afterDraw.turn === "p2", "turn passed after draw");

const winState = {
  ...dealt,
  color: "blue",
  pendingDraw: 0,
  discard: [{ id: 8, color: "blue", rank: "3" }],
  hands: {
    host: [{ id: 3, color: "blue", rank: "9" }],
    p2: [
      { id: 4, color: "red", rank: "1" },
      { id: 5, color: "wild", rank: "wild" },
    ],
  },
};
const won = applyAction(winState, "host", { type: "play", cardId: 3 });
assert(won.phase === "roundOver", "empty hand ends the round");
assert(won.winner === "host", "host wins");
assert(won.lastPot === 51 + 50, "pot is leftover values plus 50");
assert(won.players.host.wins === 1, "win recorded");

console.log("lastcard engine ok");
