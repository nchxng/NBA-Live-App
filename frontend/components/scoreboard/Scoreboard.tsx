"use client";

import { GameState } from "@/types/game";
import { parseClock } from "@/lib/clockParser";
import { ConnectionStatus } from "@/hooks/useGameSocket";

interface Props {
  gameState: GameState | null;
  connectionStatus: ConnectionStatus;
}

const STATUS_COLORS: Record<ConnectionStatus, string> = {
  connected: "bg-green-500",
  connecting: "bg-yellow-500 animate-pulse",
  disconnected: "bg-red-500",
};

export default function Scoreboard({ gameState, connectionStatus }: Props) {
  return (
    <div className="flex items-center justify-between w-full bg-gray-900 rounded-xl px-6 py-3 mb-4">
      {/* Away team score */}
      <div className="text-center w-24">
        <div className="text-gray-400 text-xs uppercase tracking-widest mb-1">
          {gameState?.away_team ?? "—"}
        </div>
        <div className="text-4xl font-mono font-bold text-white">
          {gameState?.score_away ?? "0"}
        </div>
      </div>

      {/* Center: period + clock + status indicator */}
      <div className="text-center flex flex-col items-center gap-1">
        <div className="text-gray-500 text-xs">
          {gameState ? `Q${gameState.period}` : "—"}
        </div>
        <div className="text-2xl font-mono text-white">
          {gameState ? parseClock(gameState.clock) : "--:--"}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[connectionStatus]}`} />
          <span className="text-gray-600 text-xs capitalize">{connectionStatus}</span>
        </div>
      </div>

      {/* Home team score */}
      <div className="text-center w-24">
        <div className="text-gray-400 text-xs uppercase tracking-widest mb-1">
          {gameState?.home_team ?? "—"}
        </div>
        <div className="text-4xl font-mono font-bold text-white">
          {gameState?.score_home ?? "0"}
        </div>
      </div>
    </div>
  );
}
