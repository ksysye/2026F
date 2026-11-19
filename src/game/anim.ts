export type Ease = (t: number) => number;
export const linear: Ease = (t) => t;
export const easeInOut: Ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeIn: Ease = (t) => t * t;
export const easeOut: Ease = (t) => 1 - (1 - t) * (1 - t);
export const easeOutBounce: Ease = (t) => {
  const n = 7.5625, d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
};

/** requestAnimationFrame 기반 트윈. alive()가 false가 되면 즉시 종료(언마운트 안전). */
export function tween(ms: number, ease: Ease, step: (v: number) => void, alive: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const frame = (now: number) => {
      if (!alive()) return resolve();
      const t = Math.min(1, (now - start) / ms);
      step(ease(t));
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
