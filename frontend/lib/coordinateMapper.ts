// NBA API coordinate system (half-court, normalized per-team):
//   x ∈ [0, 500]  — sideline to sideline (50 feet × 10 units/foot)
//   y ∈ [0, 470]  — baseline to half-court (47 feet × 10 units/foot)
//   basket sits at approximately (250, 52.5)
//
// Our canvas is 940 × 500 pixels — exactly proportional to a real NBA court:
//   canvas x ∈ [0, 940]  — left baseline to right baseline
//   canvas y ∈ [0, 500]  — north sideline to south sideline
//
// Home team attacks the LEFT basket (canvas x ≈ 52.5).
// Away team attacks the RIGHT basket (canvas x ≈ 887.5).
//
// Transformation:
//   home:  cx = y_api,           cy = 500 - x_api
//   away:  cx = 940 - y_api,     cy = 500 - x_api
//
// Verification — basket at API (250, 52.5):
//   home → cx=52.5, cy=250  ✓
//   away → cx=887.5, cy=250 ✓

export const CANVAS_WIDTH = 940;
export const CANVAS_HEIGHT = 500;

// Basket positions in canvas space (used for ball animation target)
export const HOME_BASKET = { cx: 52.5, cy: 250 };
export const AWAY_BASKET = { cx: 887.5, cy: 250 };

export function mapShot(
  x: number,
  y: number,
  isHomeTeam: boolean
): { cx: number; cy: number } {
  if (isHomeTeam) {
    return { cx: y, cy: CANVAS_HEIGHT - x };
  } else {
    return { cx: CANVAS_WIDTH - y, cy: CANVAS_HEIGHT - x };
  }
}
