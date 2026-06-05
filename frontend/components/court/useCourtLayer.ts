"use client";

// Draws the static court onto Layer 1 exactly once after the canvas mounts.

import { RefObject, useEffect } from "react";
import { drawCourt } from "@/lib/courtGeometry";

export function useCourtLayer(canvasRef: RefObject<HTMLCanvasElement | null>): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawCourt(ctx);
    // Empty dependency array — runs once on mount, never again.
  }, []);
}
