import ScreenHeader from './ScreenHeader';

interface Props {
  onBack: () => void;
}

export default function Credits({ onBack }: Props) {
  return (
    <div className="credits-screen">
      <ScreenHeader title="Credits" subtitle="KnightShift · design, logic, and online race system" onBack={onBack} backLabel="Menu" />
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
    </div>
  );
}
