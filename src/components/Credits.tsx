import PixelButton from './PixelButton';

interface Props {
  onBack: () => void;
}

export default function Credits({ onBack }: Props) {
  return (
    <div className="credits-screen">
      <h1 className="credits-title">KnightShift</h1>
      <div className="panel" style={{ padding: 32, maxWidth: 560 }}>
        <p className="credits-text">
          KnightShift<br /><br />
          A modern knight-swap logic puzzle built around clean moves, verified solutions,
          endless generated levels, and fast online races.<br /><br />
          The solver checks the shortest path, the hint system follows the current board,
          and every generated level is validated before play.<br /><br />
          Good luck shifting the board.
        </p>
      </div>
      <PixelButton variant="ghost" onClick={onBack}>← Main Menu</PixelButton>
    </div>
  );
}
