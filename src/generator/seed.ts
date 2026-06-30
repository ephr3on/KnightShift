// Mulberry32 — fast, deterministic, good quality for games
export function hashString(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

export function createSeededRng(seed: string): () => number {
  let s = hashString(seed) >>> 0;
  if (s === 0) s = 0xdeadbeef;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1) >>> 0;
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSeedString(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'KS-';
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  result += '-' + new Date().getFullYear();
  return result;
}

export function getDailySeed(mode: 'no-turns' | 'with-turns'): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `KnightShift-Daily-${mode}-${y}-${m}-${d}`;
}

export function getTodayString(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
