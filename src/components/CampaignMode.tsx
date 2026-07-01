import { useMemo, useState } from 'react';
import type { Puzzle } from '../types';
import { CAMPAIGN_PUZZLES, CAMPAIGN_TOTAL_LEVELS, CAMPAIGN_ZONES } from '../campaignPuzzles';
import {
  getCampaignProgress,
  getUnlockedCampaignLevelLimit,
  isCampaignLevelUnlocked,
  resetCampaignProgress,
} from '../storage';
import Board from './Board';
import PixelButton from './PixelButton';

interface Props {
  onPlay: (puzzle: Puzzle) => void;
  onBack: () => void;
}

function diffClass(d: string) {
  const map: Record<string, string> = {
    Easy: 'diff-easy',
    Medium: 'diff-medium',
    Hard: 'diff-hard',
    'Very Hard': 'diff-veryhard',
    Genius: 'diff-genius',
  };
  return map[d] ?? '';
}

function firstPlayableLevel(unlockedLimit: number, completed: Set<number>): number {
  for (let level = 1; level <= unlockedLimit; level++) {
    if (!completed.has(level)) return level;
  }
  return Math.min(CAMPAIGN_TOTAL_LEVELS, unlockedLimit);
}

export default function CampaignMode({ onPlay, onBack }: Props) {
  const [progress, setProgress] = useState(() => getCampaignProgress());
  const [showReset, setShowReset] = useState(false);
  const completed = useMemo(() => new Set(progress.completedLevels), [progress.completedLevels]);
  const unlockedLimit = getUnlockedCampaignLevelLimit(CAMPAIGN_TOTAL_LEVELS);
  const completedCount = completed.size;
  const completionPct = Math.round((completedCount / CAMPAIGN_TOTAL_LEVELS) * 100);
  const nextLevel = firstPlayableLevel(unlockedLimit, completed);
  const nextPuzzle = CAMPAIGN_PUZZLES.find(p => p.campaignLevel === nextLevel) ?? CAMPAIGN_PUZZLES[0];

  const zones = CAMPAIGN_ZONES.map(zone => {
    const puzzles = CAMPAIGN_PUZZLES.filter(p => p.campaignZone === zone.id);
    const zoneCompleted = puzzles.filter(p => completed.has(p.campaignLevel ?? 0)).length;
    const zoneUnlocked = puzzles.some(p => isCampaignLevelUnlocked(p.campaignLevel ?? 0, CAMPAIGN_TOTAL_LEVELS));
    return { ...zone, puzzles, completed: zoneCompleted, unlocked: zoneUnlocked };
  });

  const handleReset = () => {
    resetCampaignProgress();
    setShowReset(false);
    setProgress(getCampaignProgress());
  };

  return (
    <main className="campaign-screen" aria-label="KnightShift level journey">
      <header className="campaign-hero panel">
        <div className="campaign-hero-copy">
          <div className="brand-pill">♞ Main Journey · 120 curated levels</div>
          <h1 className="campaign-title">Level Journey</h1>
          <p className="campaign-subtitle">
            A handcrafted progression path where each level opens only when you are close enough.
            The custom generator is still there, but this is the main game.
          </p>

          <div className="campaign-progress-shell" aria-label="Campaign progress">
            <div className="campaign-progress-meta">
              <strong>{completedCount}/{CAMPAIGN_TOTAL_LEVELS}</strong>
              <span>{completionPct}% complete</span>
              <span>Unlocked to level {unlockedLimit}</span>
            </div>
            <div className="campaign-progress-track">
              <div style={{ width: `${completionPct}%` }} />
            </div>
          </div>

          <div className="campaign-actions">
            <PixelButton variant="primary" onClick={() => onPlay(nextPuzzle)}>
              Continue Level {nextPuzzle.campaignLevel}
            </PixelButton>
            <PixelButton variant="ghost" onClick={onBack}>← Main Menu</PixelButton>
          </div>
        </div>

        <div className="campaign-next-card" aria-label="Next level preview">
          <div className="campaign-next-kicker">Next Board</div>
          <div className="campaign-next-name">{nextPuzzle.name}</div>
          <Board
            cells={nextPuzzle.cells}
            pieces={nextPuzzle.initialPieces}
            goalPieces={nextPuzzle.goalPieces}
            size="small"
          />
          <div className="campaign-next-stats">
            <span className={`card-difficulty ${diffClass(nextPuzzle.difficulty)}`}>{nextPuzzle.difficulty}</span>
            <span>{nextPuzzle.optimalMoves} optimal</span>
          </div>
        </div>
      </header>

      <section className="campaign-zones" aria-label="Level zones">
        {zones.map(zone => (
          <article key={zone.id} className={`campaign-zone panel ${zone.unlocked ? 'is-unlocked' : 'is-locked'}`}>
            <div className="campaign-zone-header">
              <div>
                <div className="campaign-zone-range">{zone.range}</div>
                <h2>{zone.title}</h2>
                <p>{zone.description}</p>
              </div>
              <div className="campaign-zone-count">
                {zone.completed}/{zone.puzzles.length}
              </div>
            </div>

            <div className="campaign-level-grid">
              {zone.puzzles.map(puzzle => {
                const level = puzzle.campaignLevel ?? 0;
                const unlocked = isCampaignLevelUnlocked(level, CAMPAIGN_TOTAL_LEVELS);
                const isDone = completed.has(level);
                const best = progress.bestMovesByLevel[String(level)];
                return (
                  <button
                    key={puzzle.id}
                    type="button"
                    className={`campaign-level-card ${unlocked ? 'is-unlocked' : 'is-locked'} ${isDone ? 'is-complete' : ''}`}
                    disabled={!unlocked}
                    onClick={() => onPlay(puzzle)}
                  >
                    <span className="campaign-level-num">{level}</span>
                    <strong>{puzzle.name.replace(/^Level \d+: /, '')}</strong>
                    <small>
                      {unlocked ? `${puzzle.optimalMoves} moves · ${puzzle.difficulty}` : 'Locked'}
                    </small>
                    {unlocked && (
                      <span className="campaign-level-mini-board">
                        <Board cells={puzzle.cells} pieces={puzzle.initialPieces} size="tiny" />
                      </span>
                    )}
                    <span className="campaign-level-status">
                      {isDone ? `✓ Best ${best ?? '-'}` : unlocked ? 'Play' : '🔒'}
                    </span>
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </section>

      <footer className="campaign-footer panel">
        <div>
          <strong>Custom puzzles moved.</strong>
          <span> Use Custom Puzzle from the main menu when you want to build a board with a specific difficulty.</span>
        </div>
        <PixelButton variant="ghost" className="btn-compact" onClick={() => setShowReset(v => !v)}>
          Progress options
        </PixelButton>
        {showReset && (
          <div className="campaign-reset-row">
            <span>Reset only the Journey progress saved on this device.</span>
            <PixelButton variant="danger" className="btn-compact" onClick={handleReset}>Reset Journey</PixelButton>
          </div>
        )}
      </footer>
    </main>
  );
}
