// NBA live API coordinate system (full-court, verified against shotDistance field):
//   x: 0–100, percentage of court LENGTH (94 feet), left baseline → right baseline
//   y: 0–100, percentage of court WIDTH  (50 feet), one sideline → other sideline
//
// Canvas is 940×500 px — 1 px per 0.1 foot, exactly proportional to a real NBA court.
//
// No team-based flipping needed — coordinates are already full-court positioned.
// Shots naturally cluster near the basket each team is attacking.
//
// Basket positions (5.25ft from each baseline, centered on width):
//   Left basket:  x_api ≈ 5.585,  y_api = 50  → canvas (52.5, 250)
//   Right basket: x_api ≈ 94.415, y_api = 50  → canvas (887.5, 250)

export const CANVAS_WIDTH = 940;
export const CANVAS_HEIGHT = 500;

export const HOME_BASKET = { cx: 52.5,  cy: 250 };
export const AWAY_BASKET = { cx: 887.5, cy: 250 };

export function mapShot(x: number, y: number): { cx: number; cy: number } {
  return {
    cx: (x / 100) * CANVAS_WIDTH,
    cy: (y / 100) * CANVAS_HEIGHT,
  };
}

// Returns which basket a shot was aimed at, based on which side of court it came from.
// Used by the animation layer to pick the correct target.
export function targetBasket(x: number): { cx: number; cy: number } {
  return x < 50 ? HOME_BASKET : AWAY_BASKET;
}
