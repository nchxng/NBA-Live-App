"use client";

import { useEffect, useRef, useState } from "react";
import { GameState, PlayerState, ShotEvent } from "@/types/game";
import { WSMessage } from "@/types/messages";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export interface GameSocketState {
  shots: ShotEvent[];
  players: PlayerState[];
  gameState: GameState | null;
  incomingShot: ShotEvent | null;     // set briefly when a new shot arrives → triggers animation
  activeShotPlayerId: number | null;  // set briefly when a player shoots → triggers card highlight
  connectionStatus: ConnectionStatus;
}

export function useGameSocket(gameId: string): GameSocketState {
  const [shots, setShots] = useState<ShotEvent[]>([]);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [incomingShot, setIncomingShot] = useState<ShotEvent | null>(null);
  const [activeShotPlayerId, setActiveShotPlayerId] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");

  // useRef stores a mutable value that doesn't trigger re-renders when changed.
  // We use it to track the reconnect attempt count across renders without
  // causing extra re-renders.
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let cancelled = false; // prevents reconnect after intentional unmount

    function connect() {
      if (cancelled) return;
      setConnectionStatus("connecting");
      ws = new WebSocket(`${WS_BASE}/ws/${gameId}`);

      ws.onopen = () => {
        reconnectCount.current = 0;
        setConnectionStatus("connected");
      };

      ws.onmessage = (event: MessageEvent) => {
        // Parse the raw JSON string into a typed WSMessage.
        const msg: WSMessage = JSON.parse(event.data as string);

        // TypeScript narrows the type in each case branch — msg.shots is only
        // accessible inside "game_init" and "shot_update", not "roster_update".
        switch (msg.type) {
          case "game_init":
            setShots(msg.shots);
            setPlayers(msg.players);
            setGameState(msg.game_state);
            break;

          case "shot_update":
            setShots((prev) => [...prev, ...msg.shots]);
            setGameState(msg.game_state);
            // Trigger the ball animation and player card highlight for the latest shot.
            if (msg.shots.length > 0) {
              const latest = msg.shots[msg.shots.length - 1];
              setIncomingShot(latest);
              setActiveShotPlayerId(latest.person_id);

              // Clear the animation trigger after 800ms so the next shot can re-trigger it.
              setTimeout(() => setIncomingShot(null), 800);
              setTimeout(() => setActiveShotPlayerId(null), 2000);
            }
            break;

          case "roster_update":
            setPlayers(msg.players);
            break;
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        setConnectionStatus("disconnected");
        // Exponential backoff: 1s, 2s, 4s, 8s, max 30s.
        const delay = Math.min(1000 * Math.pow(2, reconnectCount.current), 30000);
        reconnectCount.current += 1;
        reconnectTimer.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close(); // triggers onclose, which handles reconnect
      };
    }

    connect();

    // Cleanup: runs when the component unmounts or gameId changes.
    // Setting cancelled = true prevents the reconnect timer from firing after unmount.
    return () => {
      cancelled = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      ws?.close();
    };
  }, [gameId]); // re-runs only if gameId changes

  return {
    shots,
    players,
    gameState,
    incomingShot,
    activeShotPlayerId,
    connectionStatus,
  };
}
