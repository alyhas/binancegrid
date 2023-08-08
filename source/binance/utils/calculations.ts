export function calcPercentageOffset(
  base: number,
  offsetPercentage: number
): number {
  const offset = base * (Math.abs(offsetPercentage) / 100);
  return base + (offsetPercentage >= 0 ? offset : -offset);
}
