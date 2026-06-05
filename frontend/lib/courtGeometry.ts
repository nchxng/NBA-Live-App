// Draws an NBA full court onto a 940×500 canvas context.
// All dimensions follow the 10-units-per-foot scale:
//   court = 94ft × 50ft → canvas = 940px × 500px
//
// The origin (0,0) is the top-left corner.
// Left basket: x=52.5, y=250   Right basket: x=887.5, y=250
//
// Call this once after mounting the Layer 1 canvas. Never call it again.

export function drawCourt(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, 940, 500);

  // Court surface
  ctx.fillStyle = "#c8a96e"; // hardwood tan
  ctx.fillRect(0, 0, 940, 500);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;

  // --- Outer boundary ---
  ctx.strokeRect(0, 0, 940, 500);

  // --- Half-court line ---
  ctx.beginPath();
  ctx.moveTo(470, 0);
  ctx.lineTo(470, 500);
  ctx.stroke();

  // --- Center circle (radius 60 = 6 feet) ---
  ctx.beginPath();
  ctx.arc(470, 250, 60, 0, Math.PI * 2);
  ctx.stroke();

  // --- Paint (key) boxes ---
  // NBA paint: 16ft wide (160 units), 19ft long (190 units) from baseline
  drawPaint(ctx, "left");
  drawPaint(ctx, "right");

  // --- Free throw circles ---
  drawFreeThrowCircle(ctx, "left");
  drawFreeThrowCircle(ctx, "right");

  // --- Three-point lines ---
  drawThreePointLine(ctx, "left");
  drawThreePointLine(ctx, "right");

  // --- Backboards ---
  drawBackboard(ctx, "left");
  drawBackboard(ctx, "right");

  // --- Basket rims ---
  drawBasket(ctx, "left");
  drawBasket(ctx, "right");
}

function drawPaint(ctx: CanvasRenderingContext2D, side: "left" | "right"): void {
  // Paint is 16ft wide (160 units), centred on the basket (y=250).
  // It extends 19ft (190 units) from the baseline.
  const paintWidth = 160;
  const paintLength = 190;
  const top = 250 - paintWidth / 2;   // y=170
  const bottom = 250 + paintWidth / 2; // y=330

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;

  if (side === "left") {
    ctx.strokeRect(0, top, paintLength, paintWidth);
  } else {
    ctx.strokeRect(940 - paintLength, top, paintLength, paintWidth);
  }

  // Restricted area arc (4ft radius = 40 units from basket center)
  const basketX = side === "left" ? 52.5 : 887.5;
  ctx.beginPath();
  ctx.arc(basketX, 250, 40, side === "left" ? -Math.PI / 2 : Math.PI / 2, side === "left" ? Math.PI / 2 : (3 * Math.PI) / 2, side === "left");
  ctx.stroke();
}

function drawFreeThrowCircle(ctx: CanvasRenderingContext2D, side: "left" | "right"): void {
  // Free throw line is 19ft from the baseline. Circle radius = 6ft (60 units).
  const ftX = side === "left" ? 190 : 750;
  const radius = 60;

  // Top half (solid)
  ctx.beginPath();
  ctx.arc(ftX, 250, radius, Math.PI, 0, side === "left");
  ctx.stroke();

  // Bottom half (dashed)
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.arc(ftX, 250, radius, 0, Math.PI, side === "left");
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawThreePointLine(ctx: CanvasRenderingContext2D, side: "left" | "right"): void {
  // Three-point arc: 23.75ft (237.5 units) from basket center
  // Corner three lines: run from baseline, 3ft (30 units) from each sideline
  const basketX = side === "left" ? 52.5 : 887.5;
  const radius = 237.5;
  const cornerY = 30;           // 3ft from sideline
  const cornerLineEndY = 140;   // where the straight part meets the arc (approx)

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;

  // Corner straight segments (parallel to the sidelines)
  ctx.beginPath();
  if (side === "left") {
    ctx.moveTo(0, cornerY);
    ctx.lineTo(cornerLineEndY, cornerY);
    ctx.moveTo(0, 500 - cornerY);
    ctx.lineTo(cornerLineEndY, 500 - cornerY);
  } else {
    ctx.moveTo(940, cornerY);
    ctx.lineTo(940 - cornerLineEndY, cornerY);
    ctx.moveTo(940, 500 - cornerY);
    ctx.lineTo(940 - cornerLineEndY, 500 - cornerY);
  }
  ctx.stroke();

  // Calculate the angles where the corner lines meet the arc.
  // The arc is centered at the basket. We need the angle where y = cornerY.
  // y = basketY + radius * sin(angle)  →  cornerY = 250 + 237.5 * sin(angle)
  // sin(angle) = (cornerY - 250) / 237.5
  const sinVal = (cornerY - 250) / radius; // negative value
  const startAngle = Math.asin(sinVal);    // negative angle (above center)
  const endAngle = Math.PI - startAngle;   // mirror below center

  ctx.beginPath();
  if (side === "left") {
    ctx.arc(basketX, 250, radius, startAngle, endAngle);
  } else {
    ctx.arc(basketX, 250, radius, Math.PI - endAngle, Math.PI - startAngle);
  }
  ctx.stroke();
}

function drawBackboard(ctx: CanvasRenderingContext2D, side: "left" | "right"): void {
  // Backboard: 6ft wide (60 units), 3ft from baseline
  const bx = side === "left" ? 30 : 910;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bx, 250 - 30);
  ctx.lineTo(bx, 250 + 30);
  ctx.stroke();
}

function drawBasket(ctx: CanvasRenderingContext2D, side: "left" | "right"): void {
  const basketX = side === "left" ? 52.5 : 887.5;
  ctx.strokeStyle = "#ff6600";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // Rim radius: 9 inches = 0.75ft = 7.5 units
  ctx.arc(basketX, 250, 7.5, 0, Math.PI * 2);
  ctx.stroke();
}
