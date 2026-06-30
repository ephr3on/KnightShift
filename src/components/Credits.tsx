import PixelButton from './PixelButton';

interface Props {
  onBack: () => void;
}

export default function Credits({ onBack }: Props) {
  return (
    <div className="credits-screen">
      <h1 className="credits-title">Credits</h1>
      <div className="panel" style={{ padding: 32, maxWidth: 520 }}>
        <p className="credits-text">
          The Four Knights Puzzle<br /><br />
          Game inspired by the classic<br />
          Four Knights chess puzzle concept.<br /><br />
          Built as a retro pixel-art<br />
          logic puzzle game.<br /><br />
          The "With Turns" version of the<br />
          original puzzle is mathematically<br />
          impossible — verified by BFS search.<br /><br />
          Good luck solving the rest!
        </p>
      </div>
      <PixelButton onClick={onBack}>&lt;- Main Menu</PixelButton>
    </div>
  );
}
