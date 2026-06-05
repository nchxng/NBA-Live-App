// Parses ISO 8601 duration strings from the NBA API into "M:SS" display format.
//
// Examples:
//   "PT11M58.00S" → "11:58"
//   "PT08M04.00S" → "8:04"
//   "PT00M00.00S" → "0:00"
//   ""            → "--"

export function parseClock(clock: string): string {
  if (!clock) return "--";

  // Match the minutes and seconds out of the ISO 8601 duration string.
  const match = clock.match(/PT(\d+)M([\d.]+)S/);
  if (!match) return clock;

  const minutes = parseInt(match[1], 10);
  const seconds = Math.floor(parseFloat(match[2]));
  // padStart ensures seconds are always 2 digits: "8:04" not "8:4"
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
