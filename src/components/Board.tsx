import type { Piece, GoalGroup } from '../types';
import { parseCell, toCell } from '../gameLogic';
import KnightPiece from './KnightPiece';

interface Props {
  cells: string[];
  pieces: Piece[];
  selectedPieceId?: string | null;
  possibleMoves?: string[];
  goalPieces?: GoalGroup[];
  onCellClick?: (cell: string) => void;
  size?: 'normal' | 'medium' | 'small' | 'tiny';
  showCoords?: boolean;
  maxWidth?: number;
}

export default function Board({
  cells,
  pieces,
  selectedPieceId = null,
  possibleMoves = [],
  goalPieces = [],
  onCellClick,
  size = 'normal' as 'normal' | 'medium' | 'small' | 'tiny',
  showCoords = false,
  // maxWidth,
}: Props) {
  if (cells.length === 0) return null;

  // Compute grid bounds
  const coords = cells.map(parseCell);
  const minX = Math.min(...coords.map(c => c.x));
  const maxX = Math.max(...coords.map(c => c.x));
  const minY = Math.min(...coords.map(c => c.y));
  const maxY = Math.max(...coords.map(c => c.y));
  const cols = maxX - minX + 1;
  const rows = maxY - minY + 1;

  const cellSet = new Set(cells);
  const pieceMap = new Map(pieces.map(p => [p.cell, p]));
  const possibleSet = new Set(possibleMoves);

  const goalWhiteCells = new Set(
    goalPieces.filter(g => g.color === 'white').flatMap(g => g.cells)
  );
  const goalBlackCells = new Set(
    goalPieces.filter(g => g.color === 'black').flatMap(g => g.cells)
  );

  const cellPx = size === 'normal' ? 100 : size === 'medium' ? 52 : size === 'small' ? 26 : 18;

  // Build grid: row 0 = top (maxY), row last = bottom (minY)
  const gridRows: Array<Array<string | null>> = [];
  for (let row = 0; row < rows; row++) {
    const y = maxY - row;
    const rowCells: Array<string | null> = [];
    for (let col = 0; col < cols; col++) {
      const x = minX + col;
      const cell = toCell(x, y);
      rowCells.push(cellSet.has(cell) ? cell : null);
    }
    gridRows.push(rowCells);
  }

  return (
    <div className="board-wrapper">
      <div
        className="chess-board"
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${rows}, ${cellPx}px)`,
          gridTemplateColumns: `repeat(${cols}, ${cellPx}px)`,
        }}
      >
        {gridRows.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            if (!cell) {
              return (
                <div
                  key={`empty-${rowIdx}-${colIdx}`}
                  className={`chess-cell empty-slot${size === 'medium' ? ' medium' : ''}`}
                  style={{ width: cellPx, height: cellPx }}
                />
              );
            }

            const { x, y } = parseCell(cell);
            const isLight = (x + y) % 2 === 0;
            const piece = pieceMap.get(cell);
            const isSelected = piece?.id === selectedPieceId;
            const isPossible = possibleSet.has(cell);
            const isGoalW = goalWhiteCells.has(cell);
            const isGoalB = goalBlackCells.has(cell);

            const classes = [
              'chess-cell',
              size === 'small' ? 'small' : size === 'tiny' ? 'tiny' : '',
              isLight ? 'light' : 'dark',
              isSelected ? 'selected' : '',
              isPossible ? 'possible' : '',
              isGoalW ? 'goal-w' : '',
              isGoalB ? 'goal-b' : '',
            ].filter(Boolean).join(' ');

            return (
              <div
                key={cell}
                className={classes + (size === 'medium' ? ' medium' : '')}
                style={{ width: cellPx, height: cellPx }}
                onClick={() => onCellClick?.(cell)}
              >
                {piece && (
                  <KnightPiece
                    color={piece.color}
                    size={size === 'normal' ? 'normal' : size === 'medium' ? 'medium' : size === 'small' ? 'small' : 'tiny'}
                  />
                )}
                {isPossible && !piece && (
                  <div style={{
                    position: 'absolute',
                    width: cellPx * 0.28,
                    height: cellPx * 0.28,
                    borderRadius: '50%',
                    background: 'rgba(52,211,153,0.55)',
                    zIndex: 1,
                  }} />
                )}
              </div>
            );
          })
        )}
      </div>

      {showCoords && (
        <>
          {/* Row numbers — right side */}
          <div
            className="board-row-coords"
            style={{
              position: 'absolute',
              right: -36,
              top: 0,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'none',
            }}
          >
            {Array.from({ length: rows }, (_, i) => {
              const y = maxY - i;
              return (
                <div
                  key={y}
                  className="coord-num"
                  style={{ height: cellPx, lineHeight: `${cellPx}px` }}
                >
                  {y + 1}
                </div>
              );
            })}
          </div>

          {/* Column letters — bottom */}
          <div
            className="board-col-coords"
            style={{ display: 'flex', marginTop: 6 }}
          >
            {Array.from({ length: cols }, (_, i) => {
              const x = minX + i;
              return (
                <div
                  key={x}
                  className="coord-letter"
                  style={{ width: cellPx, textAlign: 'center' }}
                >
                  {String.fromCharCode(97 + x)}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
