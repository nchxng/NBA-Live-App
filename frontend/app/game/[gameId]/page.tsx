"use client";

import { use } from "react";
import { useGameSocket } from "@/hooks/useGameSocket";
import CourtCanvas from "@/components/court/CourtCanvas";
import RosterPanel from "@/components/roster/RosterPanel";
import Scoreboard from "@/components/scoreboard/Scoreboard";
import Link from "next/link";

export default function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = use(params);
  const {
    shots,
    players,
    gameState,
    incomingShot,
    activeShotPlayerId,
    connectionStatus,
  } = useGameSocket(gameId);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        {/* Back link */}
        <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm mb-4 inline-block">
          ← All games
        </Link>

        {/* Scoreboard */}
        <Scoreboard gameState={gameState} connectionStatus={connectionStatus} />

        {/* Court */}
        <div className="w-full overflow-x-auto mb-4">
          <CourtCanvas
            shots={shots}
            incomingShot={incomingShot}
            homeTeamId={gameState?.home_team_id ?? 0}
          />
        </div>

        {/* Roster */}
        {gameState && (
          <RosterPanel
            players={players}
            homeTeamId={gameState.home_team_id}
            awayTeamId={gameState.away_team_id}
            homeTeam={gameState.home_team}
            awayTeam={gameState.away_team}
            activeShotPlayerId={activeShotPlayerId}
          />
        )}

        {/* Shot count footer */}
        <div className="mt-4 text-center text-gray-600 text-xs">
          {shots.length} shot{shots.length !== 1 ? "s" : ""} tracked
        </div>
      </div>
    </main>
  );
}
