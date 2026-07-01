import Board from './Board';
import PixelButton from './PixelButton';
import { CAMPAIGN_PUZZLES } from '../campaignPuzzles';
import { getCampaignProgress, getUnlockedCampaignLevelLimit } from '../storage';

interface Props {
  onNoTurn: () => void;
  onCredits: () => void;
  onCampaign: () => void;
  onUnlimited: () => void;
  onDaily: () => void;
  onSaved: () => void;
  onOnline: () => void;
}

export default function MainMenu({ onNoTurn, onCredits, onCampaign, onUnlimited, onDaily, onSaved, onOnline }: Props) {
  const progress = typeof window !== 'undefined' ? getCampaignProgress() : null;
  const completedCount = progress?.completedLevels.length ?? 0;
  const unlockedLimit = typeof window !== 'undefined' ? getUnlockedCampaignLevelLimit(CAMPAIGN_PUZZLES.length) : 3;
  const nextLevel = Math.min(CAMPAIGN_PUZZLES.length, Math.max(1, completedCount + 1));
  const PREVIEW = CAMPAIGN_PUZZLES[Math.max(0, nextLevel - 1)] ?? CAMPAIGN_PUZZLES[0];
  return (
    <main className="menu-screen menu-screen-redesigned" aria-label="KnightShift main menu">
      <section className="menu-hero panel">
        <div className="menu-hero-copy">
          <div className="brand-pill">♞ 120-level Journey · Smart progression</div>
          <h1 className="menu-title">KnightShift</h1>
          <p className="menu-subtitle">
            The main game is now a locked level journey: curated boards, rising difficulty,
            and late levels that open only when your skill gets close enough.
          </p>

          <div className="menu-primary-actions">
            <PixelButton variant="primary" className="menu-main-cta" onClick={onCampaign}>
              Start Journey
            </PixelButton>
            <PixelButton variant="secondary" className="menu-main-cta" onClick={onDaily}>
              Daily Challenge
            </PixelButton>
          </div>
        </div>

        <div className="menu-preview-shell" aria-hidden="true">
          <div className="menu-preview-badge">Next level</div>
          <Board cells={PREVIEW.cells} pieces={PREVIEW.initialPieces} goalPieces={PREVIEW.goalPieces} size="small" />
          <div className="menu-preview-meta">
            <span>Level {PREVIEW.campaignLevel}</span>
            <span>{PREVIEW.optimalMoves} optimal</span>
            <span>{completedCount}/{CAMPAIGN_PUZZLES.length}</span>
            <span>Open to {unlockedLimit}</span>
          </div>
        </div>
      </section>

      <section className="menu-mode-grid" aria-label="Game modes">
        <button type="button" className="mode-card mode-card-online panel" onClick={onOnline}>
          <span className="mode-card-icon">⚡</span>
          <strong>Online Race</strong>
          <small>Same board, same pressure, faster mind wins.</small>
        </button>
        <button type="button" className="mode-card panel" onClick={onUnlimited}>
          <span className="mode-card-icon">⚙</span>
          <strong>Custom Puzzle</strong>
          <small>Build a special puzzle by difficulty, seed, and board size.</small>
        </button>
        <button type="button" className="mode-card panel" onClick={onNoTurn}>
          <span className="mode-card-icon">♜</span>
          <strong>Training Archive</strong>
          <small>Classic hand-made puzzles and turn-rule practice.</small>
        </button>
      </section>

      <section className="menu-utility-row" aria-label="Extra options">
        <PixelButton variant="ghost" onClick={onSaved}>Saved</PixelButton>
        <PixelButton variant="ghost" onClick={onCredits}>Credits</PixelButton>
      </section>
    </main>
  );
}
