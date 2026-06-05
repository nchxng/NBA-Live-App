"use client";

// Append-only shot painting on Layer 2.
// Runs only when shots.length increases — never clears the canvas.
// Old dots persist naturally because canvas pixels don't disappear unless you clearRect().

import { RefObject, useEffect, useRef } from "react";
import { ShotEvent } from "@/types/game";
import { mapShot, CANVAS_HEIGHT, CANVAS_WIDTH } from "@/lib/coordinateMapper";

interface Props {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  shots: ShotEvent[];
  homeTeamId: number;
}

export function useShotLayer({ canvasRef, shots, homeTeamId }: Props): void {
  // Track how many shots we've already drawn so we only paint new ones.
  const drawnCount = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Only draw shots we haven't painted yet.
    const newShots = shots.slice(drawnCount.current);
    if (newShots.length === 0) return;

    for (const shot of newShots) {
      const isHome = shot.team_id === homeTeamId;
      const { cx, cy } = mapShot(shot.x, shot.y, isHome);
      paintShot(ctx, cx, cy, shot.made);
    }

    drawnCount.current = shots.length;
  }, [shots.length]); // re-runs only when the count changes, not on every render
}

function paintShot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  made: boolean
): void {
  ctx.globalAlpha = 0.45;

  if (made) {
    // Green filled circle for makes
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Red X for misses
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    const size = 5;
    ctx.beginPath();
    ctx.moveTo(cx - size, cy - size);
    ctx.lineTo(cx + size, cy + size);
    ctx.moveTo(cx + size, cy - size);
    ctx.lineTo(cx - size, cy + size);
    ctx.stroke();
  }

  ctx.globalAlpha = 1.0; // reset so nothing else is affected
}
