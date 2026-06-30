import Board from './Board';
import PixelButton from './PixelButton';
import { PUZZLES_NO_TURN } from '../puzzles';

interface Props {
  onNoTurn: () => void;
  onWithTurn: () => void;
  onCredits: () => void;
  onUnlimited: () => void;
  onDaily: () => void;
  onSaved: () => void;
  onOnline: () => void;
}

const PREVIEW = PUZZLES_NO_TURN[0];

export default function MainMenu({ onNoTurn, onWithTurn, onCredits, onUnlimited, onDaily, onSaved, onOnline }: Props) {
  return (
    <div className="menu-screen">
      <h1 className="menu-title">The Four Knights Puzzle</h1>

      <div className="menu-board-preview">
        <Board cells={PREVIEW.cells} pieces={PREVIEW.initialPieces} size="small" />
      </div>

      <div className="menu-divider">Classic Puzzles</div>
      <div className="menu-buttons">
        <PixelButton onClick={onNoTurn}>Without Turns</PixelButton>
        <PixelButton onClick={onWithTurn}>With Turns</PixelButton>
      </div>

      <div className="menu-divider">Unlimited</div>
      <div className="menu-buttons">
        <PixelButton onClick={onUnlimited}>Unlimited Mode</PixelButton>
        <PixelButton onClick={onDaily}>Daily Puzzle</PixelButton>
      </div>

      <div className="menu-divider">Online</div>
      <div className="menu-buttons">
        <PixelButton onClick={onOnline}>Play Online</PixelButton>
      </div>

      <div className="menu-divider">Collection</div>
      <div className="menu-buttons">
        <PixelButton onClick={onSaved}>Saved Puzzles</PixelButton>
      </div>

      <div className="menu-divider">More</div>
      <div className="menu-buttons">
        <PixelButton onClick={onCredits}>Credits</PixelButton>
      </div>

      <div className="menu-bottom" />
    </div>
  );
}
