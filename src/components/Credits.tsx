import ScreenHeader from './ScreenHeader';

interface Props {
  onBack: () => void;
}

export default function Credits({ onBack }: Props) {
  return (
    <div className="credits-screen">
      <ScreenHeader title="Credits" onBack={onBack} backLabel="Menu" />
      <div className="panel" style={{ padding: 32, maxWidth: 560 }}>
        <div className="credits-text">KnightShift</div>
      </div>
    </div>
  );
}
