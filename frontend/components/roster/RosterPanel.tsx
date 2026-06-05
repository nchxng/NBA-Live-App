"use client";

import { PlayerState } from "@/types/game";
import PlayerCard from "./PlayerCard";

interface Props {
  players: PlayerState[];
  homeTeamId: number;
  awayTeamId: number;
  homeTeam: string;
  awayTeam: string;
  activeShotPlayerId: number | null;
}

export default function RosterPanel({
  players,
  homeTeamId,
  awayTeamId,
  homeTeam,
  awayTeam,
  activeShotPlayerId,
}: Props) {
  const homePlayers = players.filter((p) => p.team_id === homeTeamId);
  const awayPlayers = players.filter((p) => p.team_id === awayTeamId);

  return (
    <div className="flex gap-4 w-full">
      <TeamColumn
        label={homeTeam}
        players={homePlayers}
        activeShotPlayerId={activeShotPlayerId}
        align="left"
      />
      <TeamColumn
        label={awayTeam}
        players={awayPlayers}
        activeShotPlayerId={activeShotPlayerId}
        align="right"
      />
    </div>
  );
}

function TeamColumn({
  label,
  players,
  activeShotPlayerId,
  align,
}: {
  label: string;
  players: PlayerState[];
  activeShotPlayerId: number | null;
  align: "left" | "right";
}) {
  return (
    <div className="flex-1">
      <h3
        className={`text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ${
          align === "right" ? "text-right" : ""
        }`}
      >
        {label}
      </h3>
      <div className="flex flex-col gap-1">
        {players.map((player) => (
          <PlayerCard
            key={player.person_id}
            player={player}
            isHighlighted={player.person_id === activeShotPlayerId}
          />
        ))}
        {players.length === 0 && (
          <p className="text-gray-600 text-xs italic">Waiting for lineup…</p>
        )}
      </div>
    </div>
  );
}
