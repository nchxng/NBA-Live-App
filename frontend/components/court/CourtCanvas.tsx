"use client";

// Composes the 3 canvas layers:
//   Layer 1 (courtRef)  — static court, drawn once
//   Layer 2 (shotsRef)  — append-only shot history
//   Layer 3 (animRef)   — ball animation, cleared each frame

import { useRef } from "react";
import { ShotEvent } from "@/types/game";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/coordinateMapper";
import { useCourtLayer } from "./useCourtLayer";
import { useShotLayer } from "./useShotLayer";
import { useAnimationLayer } from "./useAnimationLayer";

interface Props {
  shots: ShotEvent[];
  incomingShot: ShotEvent | null;
  homeTeamId: number;
}

export default function CourtCanvas({ shots, incomingShot, homeTeamId }: Props) {
  const courtRef = useRef<HTMLCanvasElement>(null);
  const shotsRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<HTMLCanvasElement>(null);

  useCourtLayer(courtRef);
  useShotLayer({ canvasRef: shotsRef, shots, homeTeamId });
  useAnimationLayer({ canvasRef: animRef, incomingShot, homeTeamId });

  const style: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
  };

  return (
    <div
      style={{
        position: "relative",
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        maxWidth: "100%",
      }}
    >
      <canvas ref={courtRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      <canvas ref={shotsRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={style} />
      <canvas ref={animRef}  width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={style} />
    </div>
  );
}
