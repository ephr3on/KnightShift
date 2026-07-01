import { useState } from 'react';
import PixelButton from './PixelButton';
import ScreenHeader from './ScreenHeader';
import { ensureAnonymousAuth } from '../firebase';
import { createRoom, joinRoom } from '../multiplayer/onlineRoomService';

interface Props {
  onRoomReady: (roomCode: string, playerId: string, playerName: string, role: 'host' | 'guest') => void;
  onBack: () => void;
}

export default function OnlineMenu({ onRoomReady, onBack }: Props) {
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState('');

  async function handleCreate() {
    setLoading('create');
    setError('');
    try {
      const playerId = await ensureAnonymousAuth();
      const code = await createRoom(playerName.trim() || 'Player 1', playerId);
      onRoomReady(code, playerId, playerName.trim() || 'Player 1', 'host');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create room.');
    } finally {
      setLoading(null);
    }
  }

  async function handleJoin() {
    const code = joinCode.toUpperCase().trim();
    if (!code) { setError('Enter a room code first.'); return; }
    setLoading('join');
    setError('');
    try {
      const playerId = await ensureAnonymousAuth();
      await joinRoom(code, playerName.trim() || 'Player 2', playerId);
      onRoomReady(code, playerId, playerName.trim() || 'Player 2', 'guest');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join room.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="select-screen online-menu-shell">
      <ScreenHeader
        title="Online Race"
        subtitle="Create a private room or join with a code."
        onBack={onBack}
        backLabel="Menu"
      />

      <div className="panel online-menu-name-card">
        <div className="panel-title">Your Name</div>
        <input
          className="gen-seed-input"
          value={playerName}
          onChange={e => setPlayerName(e.target.value.slice(0, 16))}
          placeholder="Enter your name…"
          maxLength={16}
          style={{ marginTop: 8 }}
        />
      </div>

      <div className="online-menu-options">
        <div className="panel online-menu-card">
          <div className="panel-title">Create Room</div>
          <p className="online-card-desc">Start a new private room and share the code with a friend.</p>
          <PixelButton variant="primary" onClick={handleCreate} disabled={loading !== null}>
            {loading === 'create' ? 'Creating…' : 'Create Room'}
          </PixelButton>
        </div>

        <div className="panel online-menu-card">
          <div className="panel-title">Join Room</div>
          <p className="online-card-desc">Enter the room code your friend sent you.</p>
          <input
            className="gen-seed-input online-code-input"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 5))}
            placeholder="XXXXX"
            maxLength={5}
            onKeyDown={e => { if (e.key === 'Enter') handleJoin(); }}
          />
          <PixelButton variant="primary" onClick={handleJoin} disabled={loading !== null || !joinCode.trim()}>
            {loading === 'join' ? 'Joining…' : 'Join Room'}
          </PixelButton>
        </div>
      </div>

      {error && <div className="online-error">{error}</div>}

    </div>
  );
}
