import type { Move } from './types';
import type { SolverState } from './state';
import type { GoalGroup } from '../types';
import { computeHeuristic } from './graph';

/**
 * Generate a short, human-readable explanation for a single move.
 * The explanation is heuristic-based and focuses on observable facts
 * (distance to goal, freeing space, turn requirements).
 */
export function explainMove(
  move: Move,
  beforeState: SolverState,
  afterState: SolverState,
  goalPieces: GoalGroup[],
  distances: Map<string, Map<string, number>>,
  moveIndex: number
): string {
  const colorName = move.pieceColor === 'white' ? 'White' : 'Black';
  const oppColor = move.pieceColor === 'white' ? 'Black' : 'White';
  const symbol = move.pieceColor === 'white' ? '♘' : '♞';

  const whiteGoals = goalPieces.filter(g => g.color === 'white').flatMap(g => g.cells).sort();
  const blackGoals = goalPieces.filter(g => g.color === 'black').flatMap(g => g.cells).sort();

  const hBefore = computeHeuristic(beforeState, whiteGoals, blackGoals, distances);
  const hAfter  = computeHeuristic(afterState,  whiteGoals, blackGoals, distances);

  // Distance moved toward goal
  const distBefore = distances.get(move.from)?.get(bestGoalFor(move.from, move.pieceColor, goalPieces, distances)) ?? Infinity;
  const distAfter  = distances.get(move.to)?.get(bestGoalFor(move.to,   move.pieceColor, goalPieces, distances)) ?? Infinity;
  const delta = distBefore - distAfter;

  const parts: string[] = [`Move ${moveIndex + 1}: ${symbol} ${colorName} knight ${move.from} → ${move.to}.`];

  if (delta > 0) {
    parts.push(`This brings the knight ${delta} step${delta > 1 ? 's' : ''} closer to a target square.`);
  } else if (delta < 0) {
    parts.push(`This temporarily moves the knight away from its direct goal — likely to clear a path or avoid a deadlock.`);
  } else {
    parts.push(`The knight repositions without changing its direct distance to the goal.`);
  }

  if (hAfter < hBefore) {
    parts.push(`The overall estimated remaining work decreased by ${hBefore - hAfter}.`);
  } else if (hAfter > hBefore) {
    parts.push(`The heuristic distance increased slightly; this move helps unlock other pieces.`);
  }

  // Check if the source cell becomes useful for the opponent color
  const oppGoals = move.pieceColor === 'white' ? blackGoals : whiteGoals;
  const srcIsOppGoal = oppGoals.includes(move.from);
  if (srcIsOppGoal) {
    parts.push(`The vacated cell ${move.from} is a target square for a ${oppColor} knight.`);
  }

  // Check if the destination is a goal cell for this piece
  const ownGoals = move.pieceColor === 'white' ? whiteGoals : blackGoals;
  if (ownGoals.includes(move.to)) {
    parts.push(`The knight has arrived on its target square ${move.to}! ✓`);
  }

  // Turn alternation note
  if (afterState.turn !== null) {
    parts.push(`It is now ${afterState.turn === 'white' ? '♘ White' : '♞ Black'}'s turn.`);
  }

  return parts.join(' ');
}

function bestGoalFor(
  cell: string,
  color: 'white' | 'black',
  goalPieces: GoalGroup[],
  distances: Map<string, Map<string, number>>
): string {
  const goals = goalPieces.filter(g => g.color === color).flatMap(g => g.cells);
  let best = goals[0] ?? cell;
  let bestDist = Infinity;
  for (const g of goals) {
    const d = distances.get(cell)?.get(g) ?? Infinity;
    if (d < bestDist) { bestDist = d; best = g; }
  }
  return best;
}

/** Generate a preamble explanation of the puzzle and the winning strategy. */
export function generatePuzzleExplanation(
  withTurns: boolean,
  solvable: boolean,
  reachableStates: number,
  optimalMoves: number | null
): string[] {
  const lines: string[] = [];

  lines.push('🎯 Puzzle Goal');
  lines.push('Swap the white and black knights: white knights must end on the original black positions, and vice versa.');

  lines.push('♞ Knight Movement');
  lines.push('A chess knight moves in an "L-shape": 2 squares in one direction, then 1 square perpendicular — and can jump over other pieces.');

  lines.push('📦 What is a "State"?');
  lines.push('A state is a snapshot of the board: which cells are occupied by which color. Two states with the same piece positions (regardless of piece IDs) are the same state.');

  if (withTurns) {
    lines.push('🔄 Turn Restriction');
    lines.push('In this mode, White and Black must alternate moves. The current turn is part of the state. Two positions that look identical but have different turns are different states.');
  }

  if (solvable && optimalMoves !== null) {
    lines.push('✅ Solvability');
    lines.push(`This puzzle IS solvable. The shortest solution requires exactly ${optimalMoves} moves. BFS guarantees this is the minimum.`);
  } else if (!solvable) {
    lines.push('❌ Impossible Puzzle');
    lines.push(
      `The solver explored all ${reachableStates.toLocaleString()} reachable states and never reached the goal configuration. ` +
      (withTurns
        ? 'With alternating turns, the turn constraint splits the state space. Many states that are reachable without turns become unreachable when turns must alternate — this is why the "With Turns" original puzzle is impossible while the "No Turns" version is solvable.'
        : 'The board topology (which cells are connected by knight moves) does not allow the pieces to swap positions under the current rules.')
    );
  }

  lines.push('🔍 Why BFS Guarantees Shortest Solution');
  lines.push('BFS (Breadth-First Search) explores all states reachable in 1 move before exploring states reachable in 2 moves, and so on. The first time it encounters the goal state, it must have arrived via the shortest possible path.');

  lines.push('⚡ Why Bidirectional BFS Can Be Faster');
  lines.push('BiDir BFS searches from both ends simultaneously. When the two frontiers meet, the total path is optimal. The number of states explored is roughly O(b^(d/2)) instead of O(b^d), which is exponentially smaller for large solutions.');

  lines.push('🧭 Why A* Uses a Heuristic');
  lines.push('A* adds an estimate h(n) of the remaining cost. By expanding states with the smallest f = g + h first, it focuses the search toward the goal and skips many irrelevant states. The heuristic here is the minimum knight-move assignment between current positions and goal positions on an empty board.');

  lines.push('📏 Why the Heuristic Does Not Overestimate');
  lines.push('The heuristic uses precomputed BFS distances on an empty board (the "relaxed problem" — pieces cannot block each other). Real moves can only be longer than relaxed-problem moves. Therefore h(n) ≤ actual cost, making it admissible and A* optimal.');

  return lines;
}
