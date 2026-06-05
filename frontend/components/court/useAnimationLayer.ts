"use client";

// Animates a basketball traveling from the shot location to the basket on Layer 3.
// Uses requestAnimationFrame for smooth 60fps animation.
// Layer 3 is cleared and redrawn on every frame — it's the only layer that does this.

import { RefObject, useEffect } from "react";
import { ShotEvent } from "@/types/game";
import { mapShot, targetBasket } from "@/lib/coordinateMapper";

interface Props {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  incomingShot: ShotEvent | null;
}

const DURATION_MS = 650;
const ARC_HEIGHT = 80; // how high the ball peaks above the straight-line path

export function useAnimationLayer({ canvasRef, incomingShot }: Props): void {
  useEffect(() => {
    if (!incomingShot) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const start = mapShot(incomingShot.x, incomingShot.y);
    const end = targetBasket(incomingShot.x);

    const startTime = performance.now();
    let rafId: number;

    function frame(now: number) {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / DURATION_MS, 1);

      // Ease-out cubic: starts fast, decelerates toward the basket.
      // t goes 0 → 1, with deceleration near the end.
      const t = 1 - Math.pow(1 - rawProgress, 3);

      // Linear interpolation for x
      const cx = start.cx + (end.cx - start.cx) * t;

      // Linear interpolation for y, minus a parabolic arc term.
      // The term "arcHeight * 4 * t * (1 - t)" peaks at t=0.5 (the midpoint).
      const cy =
        start.cy +
        (end.cy - start.cy) * t -
        ARC_HEIGHT * 4 * t * (1 - t);

      ctx!.clearRect(0, 0, 940, 500);

      // Draw the ball as an orange circle
      ctx!.beginPath();
      ctx!.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx!.fillStyle = "#f97316";
      ctx!.fill();
      ctx!.strokeStyle = "#c2410c";
      ctx!.lineWidth = 1.5;
      ctx!.stroke();

      if (rawProgress < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        // Animation complete — clear Layer 3. The shot dot on Layer 2 remains.
        ctx!.clearRect(0, 0, 940, 500);
      }
    }

    rafId = requestAnimationFrame(frame);

    // If a new shot arrives before this one finishes, cancel the old animation.
    return () => {
      cancelAnimationFrame(rafId);
      ctx.clearRect(0, 0, 940, 500);
    };
  }, [incomingShot]); // re-runs each time a new shot arrives
}
