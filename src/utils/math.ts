export function clamp(val: number, min: number, max: number): number {
  if (isNaN(val)) return min;
  return Math.min(Math.max(val, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

export function sum(arr: number[]): number {
  return arr.reduce((acc, curr) => acc + curr, 0);
}

export function safeDivide(numerator: number, denominator: number, fallback: number = 0): number {
  if (denominator === 0 || isNaN(denominator) || !isFinite(denominator)) {
    return fallback;
  }
  const res = numerator / denominator;
  return isNaN(res) || !isFinite(res) ? fallback : res;
}
