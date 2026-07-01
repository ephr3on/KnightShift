// Small fixed-version QR encoder for invite links.
// Version 5-L supports up to 106 UTF-8 bytes in byte mode, which is enough for
// KnightShift invite URLs like https://domain/path?room=ABCDE.

const VERSION = 5;
const SIZE = 17 + 4 * VERSION; // 37
const DATA_CODEWORDS = 108;
const ECC_CODEWORDS = 26;
const FORMAT_MASK = 0x5412;
const FORMAT_POLY = 0x537;

export type QrMatrix = boolean[][];

function utf8Bytes(text: string): number[] {
  return Array.from(new TextEncoder().encode(text));
}

function appendBits(bits: number[], value: number, length: number): void {
  for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
}

function gfTables(): { exp: number[]; log: number[] } {
  const exp = Array<number>(512).fill(0);
  const log = Array<number>(256).fill(0);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    exp[i] = x;
    log[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) exp[i] = exp[i - 255];
  return { exp, log };
}

const GF = gfTables();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF.exp[GF.log[a] + GF.log[b]];
}

function generatorPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], GF.exp[i]);
    }
    poly = next;
  }
  return poly;
}

function reedSolomonRemainder(data: number[], degree: number): number[] {
  const gen = generatorPoly(degree);
  const result = Array<number>(degree).fill(0);
  for (const b of data) {
    const factor = b ^ result[0];
    result.copyWithin(0, 1);
    result[degree - 1] = 0;
    if (factor !== 0) {
      for (let i = 0; i < degree; i++) {
        result[i] ^= gfMul(gen[i + 1], factor);
      }
    }
  }
  return result;
}

function makeCodewords(text: string): number[] {
  const bytes = utf8Bytes(text);
  if (bytes.length > DATA_CODEWORDS - 2) {
    throw new Error('Invite link is too long for the built-in QR encoder.');
  }

  const bits: number[] = [];
  appendBits(bits, 0b0100, 4); // byte mode
  appendBits(bits, bytes.length, 8); // version 1-9 byte count
  for (const b of bytes) appendBits(bits, b, 8);

  const capacityBits = DATA_CODEWORDS * 8;
  const terminator = Math.min(4, capacityBits - bits.length);
  for (let i = 0; i < terminator; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j++) value = (value << 1) | bits[i + j];
    data.push(value);
  }

  const pads = [0xec, 0x11];
  let padIndex = 0;
  while (data.length < DATA_CODEWORDS) {
    data.push(pads[padIndex % 2]);
    padIndex++;
  }

  const ecc = reedSolomonRemainder(data, ECC_CODEWORDS);
  return [...data, ...ecc];
}

function blankMatrix(): { modules: (boolean | null)[][]; reserved: boolean[][] } {
  return {
    modules: Array.from({ length: SIZE }, () => Array<boolean | null>(SIZE).fill(null)),
    reserved: Array.from({ length: SIZE }, () => Array<boolean>(SIZE).fill(false)),
  };
}

function setModule(
  modules: (boolean | null)[][],
  reserved: boolean[][],
  x: number,
  y: number,
  value: boolean,
  isFunction = true,
): void {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
  modules[y][x] = value;
  if (isFunction) reserved[y][x] = true;
}

function drawFinder(modules: (boolean | null)[][], reserved: boolean[][], x0: number, y0: number): void {
  for (let y = -1; y <= 7; y++) {
    for (let x = -1; x <= 7; x++) {
      const xx = x0 + x;
      const yy = y0 + y;
      if (xx < 0 || yy < 0 || xx >= SIZE || yy >= SIZE) continue;
      const dark = x >= 0 && x <= 6 && y >= 0 && y <= 6
        && (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4));
      setModule(modules, reserved, xx, yy, dark, true);
    }
  }
}

function drawAlignment(modules: (boolean | null)[][], reserved: boolean[][], cx: number, cy: number): void {
  for (let y = -2; y <= 2; y++) {
    for (let x = -2; x <= 2; x++) {
      const dist = Math.max(Math.abs(x), Math.abs(y));
      setModule(modules, reserved, cx + x, cy + y, dist !== 1, true);
    }
  }
}

function drawTiming(modules: (boolean | null)[][], reserved: boolean[][]): void {
  for (let i = 8; i < SIZE - 8; i++) {
    const dark = i % 2 === 0;
    setModule(modules, reserved, i, 6, dark, true);
    setModule(modules, reserved, 6, i, dark, true);
  }
}

function formatBits(mask: number): number {
  // EC level L = 01, then 3 mask bits.
  const data = (0b01 << 3) | mask;
  let value = data << 10;
  for (let i = 14; i >= 10; i--) {
    if (((value >>> i) & 1) !== 0) value ^= FORMAT_POLY << (i - 10);
  }
  return ((data << 10) | value) ^ FORMAT_MASK;
}

function getBit(value: number, i: number): boolean {
  return ((value >>> i) & 1) !== 0;
}

function drawFormat(modules: (boolean | null)[][], reserved: boolean[][], mask: number): void {
  const bits = formatBits(mask);

  for (let i = 0; i <= 5; i++) setModule(modules, reserved, 8, i, getBit(bits, i), true);
  setModule(modules, reserved, 8, 7, getBit(bits, 6), true);
  setModule(modules, reserved, 8, 8, getBit(bits, 7), true);
  setModule(modules, reserved, 7, 8, getBit(bits, 8), true);
  for (let i = 9; i < 15; i++) setModule(modules, reserved, 14 - i, 8, getBit(bits, i), true);

  for (let i = 0; i < 8; i++) setModule(modules, reserved, SIZE - 1 - i, 8, getBit(bits, i), true);
  for (let i = 8; i < 15; i++) setModule(modules, reserved, 8, SIZE - 15 + i, getBit(bits, i), true);
  setModule(modules, reserved, 8, SIZE - 8, true, true); // fixed dark module
}

function maskBit(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0: return (x + y) % 2 === 0;
    case 1: return y % 2 === 0;
    case 2: return x % 3 === 0;
    case 3: return (x + y) % 3 === 0;
    default: return false;
  }
}

function drawData(
  modules: (boolean | null)[][],
  reserved: boolean[][],
  codewords: number[],
  mask: number,
): void {
  const bits: number[] = [];
  for (const cw of codewords) appendBits(bits, cw, 8);
  let bitIndex = 0;
  let upward = true;

  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right--;
    for (let vert = 0; vert < SIZE; vert++) {
      const y = upward ? SIZE - 1 - vert : vert;
      for (let dx = 0; dx < 2; dx++) {
        const x = right - dx;
        if (reserved[y][x]) continue;
        const raw = bitIndex < bits.length ? bits[bitIndex] === 1 : false;
        const value = raw !== maskBit(mask, x, y);
        setModule(modules, reserved, x, y, value, false);
        bitIndex++;
      }
    }
    upward = !upward;
  }
}

export function createQrMatrix(text: string): QrMatrix {
  const codewords = makeCodewords(text);
  const { modules, reserved } = blankMatrix();
  const mask = 0;

  drawFinder(modules, reserved, 0, 0);
  drawFinder(modules, reserved, SIZE - 7, 0);
  drawFinder(modules, reserved, 0, SIZE - 7);
  drawAlignment(modules, reserved, 30, 30);
  drawTiming(modules, reserved);
  drawFormat(modules, reserved, mask); // reserves format cells before data placement
  drawData(modules, reserved, codewords, mask);
  drawFormat(modules, reserved, mask); // rewrite format after masking data

  return modules.map(row => row.map(Boolean));
}

export function qrMatrixToPath(matrix: QrMatrix): string {
  const parts: string[] = [];
  matrix.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) parts.push(`M${x},${y}h1v1h-1z`);
    });
  });
  return parts.join('');
}
