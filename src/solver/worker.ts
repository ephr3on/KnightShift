import type { WorkerRequest, WorkerResponse } from './types';
import { solvePuzzleWithAllAlgorithms } from './solverComparison';

// Web Worker entry point — runs in a background thread so the UI stays responsive.
self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const req = e.data;
  if (req.type !== 'solve') return;

  try {
    const result = await solvePuzzleWithAllAlgorithms(
      req.cells,
      req.initialPieces,
      req.goalPieces,
      req.options,
      (message, algorithm) => {
        const response: WorkerResponse = { type: 'progress', message, algorithm };
        self.postMessage(response);
      }
    );

    const response: WorkerResponse = { type: 'result', result };
    self.postMessage(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const response: WorkerResponse = { type: 'error', message };
    self.postMessage(response);
  }
};
