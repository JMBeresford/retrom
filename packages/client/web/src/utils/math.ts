export function clamp(opts: { value: number; min: number; max: number }) {
  const { value, min, max } = opts;
  return Math.max(Math.min(value, max), min);
}
