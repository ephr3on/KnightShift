import PixelButton from './PixelButton';

interface Props {
  moves: number;
  optimalMoves: number;
  personalBest: number | null;
  isNewBest: boolean;
  onRestart: () => void;
  onBack: () => void;
}

export default function WinModal({ moves, optimalMoves, personalBest, isNewBest, onRestart, onBack }: Props) {
  return (
    <div className="modal-overlay">
      <div className="panel modal-box">
        <div className="modal-title">Puzzle Solved!</div>
        {isNewBest && <div className="modal-subtitle">New Personal Best!</div>}
        <div className="modal-stat">
          Moves Made: {moves}<br />
          Optimal Moves: {optimalMoves > 0 ? optimalMoves : '?'}<br />
          {personalBest !== null && <>Personal Best: {personalBest}</>}
        </div>
        <div className="modal-buttons">
          <PixelButton variant="primary" onClick={onRestart}>Restart</PixelButton>
          <PixelButton variant="secondary" onClick={onBack}>Back to Puzzles</PixelButton>
        </div>
      </div>
    </div>
  );
}
