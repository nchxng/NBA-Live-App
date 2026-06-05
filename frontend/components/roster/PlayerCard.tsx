"use client";

import { PlayerState } from "@/types/game";

interface Props {
  player: PlayerState;
  isHighlighted: boolean;
}

// Team color map — tricode to Tailwind border color class
const TEAM_COLORS: Record<string, string> = {
  BOS: "border-green-500",
  NYK: "border-blue-600",
  GSW: "border-yellow-400",
  LAL: "border-yellow-500",
  MIA: "border-red-600",
  CHI: "border-red-700",
  MIL: "border-green-700",
  PHX: "border-orange-600",
  DEN: "border-yellow-600",
  MEM: "border-sky-600",
  SAS: "border-gray-400",
  DAL: "border-blue-500",
  OKC: "border-orange-500",
  CLE: "border-red-800",
  IND: "border-yellow-600",
  MIN: "border-green-800",
  ORL: "border-blue-500",
  SAC: "border-purple-600",
  ATL: "border-red-500",
  CHA: "border-teal-500",
  DET: "border-red-600",
  HOU: "border-red-600",
  LAC: "border-red-500",
  NOP: "border-yellow-700",
  PHI: "border-blue-700",
  POR: "border-red-700",
  TOR: "border-red-600",
  UTA: "border-yellow-500",
  WAS: "border-blue-800",
  BKN: "border-gray-300",
};

export default function PlayerCard({ player, isHighlighted }: Props) {
  const teamColor = TEAM_COLORS[player.team] ?? "border-gray-600";

  return (
    <div
      className={`
        rounded-lg p-2 border-l-4 bg-gray-800 transition-all duration-300
        ${teamColor}
        ${isHighlighted ? "ring-2 ring-yellow-400 bg-gray-700 scale-105" : ""}
        ${!player.oncourt ? "opacity-40" : ""}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-xs font-mono w-5 text-right">
          {player.jersey}
        </span>
        <span className="text-white text-sm font-medium truncate">
          {player.name}
        </span>
      </div>
      <div className="text-gray-500 text-xs ml-7">{player.position}</div>
    </div>
  );
}
