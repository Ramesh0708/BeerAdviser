import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

const PREFIX = "fndbeer-lc-";

export function usePeerRoom({ room, name, host }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [selfId, setSelfId] = useState("");
  const peerRef = useRef(null);
  const connsRef = useRef(new Map());
  const handlers = useRef({ onMessage: null, onPeer: null, onLeave: null });

  const send = (payload, toId) => {
    if (toId) {
      const conn = connsRef.current.get(toId);
      if (conn?.open) conn.send(payload);
      return;
    }
    connsRef.current.forEach((conn) => {
      if (conn.open) conn.send(payload);
    });
  };

  const sendEach = (factory) => {
    connsRef.current.forEach((conn, id) => {
      if (conn.open) conn.send(factory(id));
    });
  };

  useEffect(() => {
    if (!room || !name) {
      setStatus("idle");
      setError("");
      return undefined;
    }
    let dead = false;
    setStatus("connecting");
    setError("");
    const peer = host ? new Peer(`${PREFIX}${room}`, { debug: 0 }) : new Peer({ debug: 0 });
    peerRef.current = peer;

    const attach = (conn, remoteId) => {
      connsRef.current.set(remoteId, conn);
      conn.on("data", (data) => handlers.current.onMessage?.(data, remoteId));
      conn.on("close", () => {
        connsRef.current.delete(remoteId);
        handlers.current.onLeave?.(remoteId);
      });
      handlers.current.onPeer?.(remoteId, conn);
    };

    const joinTimer = host
      ? null
      : window.setTimeout(() => {
          if (dead) return;
          setError("Couldn’t reach the table. Ask the host to keep this tab open.");
          setStatus("error");
        }, 14000);

    peer.on("open", (id) => {
      if (dead) return;
      setSelfId(id);
      if (host) {
        setStatus("ready");
        return;
      }
      const conn = peer.connect(`${PREFIX}${room}`, { reliable: true });
      conn.on("open", () => {
        if (dead) return;
        window.clearTimeout(joinTimer);
        attach(conn, `${PREFIX}${room}`);
        setStatus("ready");
        conn.send({ type: "hello", name });
      });
      conn.on("error", (err) => {
        window.clearTimeout(joinTimer);
        setError(err.message || "Could not join table");
        setStatus("error");
      });
    });

    peer.on("connection", (conn) => {
      conn.on("open", () => attach(conn, conn.peer));
    });

    peer.on("error", (err) => {
      window.clearTimeout(joinTimer);
      const taken = err.type === "unavailable-id";
      setError(taken ? "That table code is already live. Start a new table." : err.message || "Network error");
      setStatus("error");
    });

    return () => {
      dead = true;
      window.clearTimeout(joinTimer);
      connsRef.current.forEach((c) => c.close());
      connsRef.current.clear();
      peer.destroy();
      peerRef.current = null;
    };
  }, [room, name, host]);

  return {
    status,
    error,
    selfId,
    send,
    sendEach,
    setHandlers: (next) => {
      handlers.current = { ...handlers.current, ...next };
    },
  };
}
