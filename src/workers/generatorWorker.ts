import type { GeneratorOptions, GeneratorResult } from '../generator/puzzleGenerator';
import { generatePuzzle } from '../generator/puzzleGenerator';

export type GeneratorWorkerRequest = {
  type: 'generate';
  options: GeneratorOptions;
};

export type GeneratorWorkerResponse =
  | { type: 'progress'; message: string; attempt: number; maxAttempts: number }
  | { type: 'result'; result: GeneratorResult }
  | { type: 'error'; message: string };

self.onmessage = (e: MessageEvent<GeneratorWorkerRequest>) => {
  const req = e.data;
  if (req.type !== 'generate') return;

  try {
    const result = generatePuzzle(req.options, (message, attempt, maxAttempts) => {
      const resp: GeneratorWorkerResponse = { type: 'progress', message, attempt, maxAttempts };
      self.postMessage(resp);
    });
    const resp: GeneratorWorkerResponse = { type: 'result', result };
    self.postMessage(resp);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const resp: GeneratorWorkerResponse = { type: 'error', message };
    self.postMessage(resp);
  }
};
