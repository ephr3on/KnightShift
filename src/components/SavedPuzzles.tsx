import { useState } from 'react';
import type { Puzzle } from '../types';
import { getSavedPuzzles, deleteSavedPuzzle, getPersonalBest } from '../storage';
import { decodePuzzleCode } from '../generator/puzzleGenerator';
import Board from './Board';
import PixelButton from './PixelButton';
import ScreenHeader from './ScreenHeader';

interface Props {
  onPlay: (puzzle: Puzzle) => void;
  onBack: () => void;
}

function diffClass(d: string) {
  const map: Record<string, string> = {
    Easy: 'diff-easy', Medium: 'diff-medium', Hard: 'diff-hard',
    'Very Hard': 'diff-veryhard', Genius: 'diff-genius',
  };
  return map[d] ?? '';
}

export default function SavedPuzzles({ onPlay, onBack }: Props) {
  const [puzzles, setPuzzles] = useState(() => getSavedPuzzles());
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');
  const [importedPuzzle, setImportedPuzzle] = useState<Puzzle | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const reload = () => setPuzzles(getSavedPuzzles());

  const handleDelete = (id: string) => {
    deleteSavedPuzzle(id);
    reload();
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleImport = () => {
    setImportError('');
    setImportedPuzzle(null);
    const trimmed = importCode.trim();
    if (!trimmed) return;
    const puzzle = decodePuzzleCode(trimmed);
    if (!puzzle) {
      setImportError('Invalid puzzle code.');
      return;
    }
    setImportedPuzzle(puzzle);
  };

  return (
    <div className="select-screen">
      <ScreenHeader
        title="Saved Puzzles"
        subtitle="Import, replay, and manage your saved custom boards."
        onBack={onBack}
        backLabel="Menu"
      />

      {/* Import Section */}
      <div className="panel" style={{ padding: 14, marginBottom: 24, width: '100%', maxWidth: 600 }}>
        <div className="panel-title" style={{ marginBottom: 10 }}>Import Puzzle Code</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <input
            className="gen-seed-input"
            value={importCode}
            onChange={e => setImportCode(e.target.value)}
            placeholder="Paste puzzle code here…"
            style={{ flex: 1, minWidth: 160 }}
          />
          <PixelButton variant="primary" className="btn-compact" onClick={handleImport}>Import</PixelButton>
        </div>
        {importError && (
          <div style={{ fontSize: 8, color: 'var(--red)', marginTop: 6 }}>{importError}</div>
        )}
        {importedPuzzle && (
          <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Board cells={importedPuzzle.cells} pieces={importedPuzzle.initialPieces} size="tiny" />
            <div>
              <div style={{ fontSize: 8, color: 'var(--text)', marginBottom: 4 }}>{importedPuzzle.name}</div>
              <div style={{ fontSize: 7, color: 'var(--text-dim)' }}>
                {importedPuzzle.mode === 'no-turns' ? 'No Turns' : 'With Turns'} · {importedPuzzle.optimalMoves} moves
              </div>
            </div>
            <PixelButton variant="primary" className="btn-compact" onClick={() => onPlay(importedPuzzle)}>
              Play
            </PixelButton>
          </div>
        )}
      </div>

      {/* Saved List */}
      {puzzles.length === 0 ? (
        <div style={{ fontSize: 9, color: 'var(--text-dim)', textAlign: 'center', marginTop: 24 }}>
          No saved puzzles yet.<br />Generate puzzles in Custom Puzzle and save them.
        </div>
      ) : (
        <div className="puzzle-cards">
          {puzzles.map(entry => {
            const best = getPersonalBest(entry.puzzleId);
            return (
              <div key={entry.id} className="panel puzzle-card">
                <div className="card-name" style={{ fontSize: 8 }}>{entry.name}</div>
                <div className="card-board-preview">
                  <Board cells={entry.puzzle.cells} pieces={entry.puzzle.initialPieces} size="tiny" />
                </div>
                <div className={`card-difficulty ${diffClass(entry.difficulty)}`}>{entry.difficulty}</div>
                <div className="card-stats">
                  {entry.mode === 'no-turns' ? 'No Turns' : 'With Turns'}<br />
                  Optimal: {entry.optimalMoves}<br />
                  Best: {best !== null ? best : '-'}<br />
                  <span style={{ fontSize: 6 }}>{entry.dateSaved.slice(0, 10)}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexDirection: 'column', marginTop: 'auto', width: '100%' }}>
                  <PixelButton
                    variant="primary"
                    className="card-play-btn"
                    onClick={() => onPlay(entry.puzzle)}
                  >
                    Play
                  </PixelButton>
                  <PixelButton
                    variant="ghost"
                    className="btn-compact"
                    onClick={() => handleCopyCode(entry.puzzleCode, entry.id)}
                  >
                    {copiedId === entry.id ? 'Copied!' : 'Copy Code'}
                  </PixelButton>
                  <PixelButton
                    variant="danger"
                    className="btn-compact"
                    onClick={() => handleDelete(entry.id)}
                  >
                    Delete
                  </PixelButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
