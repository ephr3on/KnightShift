import { useEffect, useRef, useState } from 'react';
import PixelButton from './PixelButton';
import ScreenHeader from './ScreenHeader';
import { ensureAnonymousAuth } from '../firebase';
import { createRoom, joinRoom } from '../multiplayer/onlineRoomService';

interface Props {
  onRoomReady: (roomCode: string, playerId: string, playerName: string, role: 'host' | 'guest') => void;
  onBack: () => void;
  initialJoinCode?: string;
}

function cleanRoomCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
}

export default function OnlineMenu({ onRoomReady, onBack, initialJoinCode = '' }: Props) {
  const invitedCode = cleanRoomCode(initialJoinCode);
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState(invitedCode);
  const [loading, setLoading] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!invitedCode) return;
    setJoinCode(invitedCode);
    const id = window.setTimeout(() => nameInputRef.current?.focus(), 80);
    return () => window.clearTimeout(id);
  }, [invitedCode]);

  async function handleCreate() {
    setLoading('create');
    setError('');
    try {
      const hostName = playerName.trim() || 'Player 1';
      const playerId = await ensureAnonymousAuth();
      const code = await createRoom(hostName, playerId);
      onRoomReady(code, playerId, hostName, 'host');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create room.');
    } finally {
      setLoading(null);
    }
  }

  async function handleJoin() {
    const code = cleanRoomCode(joinCode);
    const guestName = playerName.trim();
    if (!code) { setError('Enter a room code first.'); return; }
    if (!guestName) { setError('Enter your name before joining.'); nameInputRef.current?.focus(); return; }
    setLoading('join');
    setError('');
    try {
      const playerId = await ensureAnonymousAuth();
      await joinRoom(code, guestName, playerId);
      onRoomReady(code, playerId, guestName, 'guest');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join room.');
    } finally {
      setLoading(null);
    }
  }

  const inviteMode = !!invitedCode;

  return (
    <div className="select-screen online-menu-shell">
      <ScreenHeader
        title={inviteMode ? 'Join Invite' : 'Online Race'}
        onBack={onBack}
        backLabel="Menu"
      />

      {inviteMode && (
        <div className="panel invite-entry-card">
          <div className="invite-entry-badge">Invite Link</div>
          <div className="invite-entry-code">{invitedCode}</div>
        </div>
      )}

      <div className="panel online-menu-name-card">
        <div className="panel-title">Your Name</div>
        <input
          ref={nameInputRef}
          className="gen-seed-input"
          value={playerName}
          onChange={e => setPlayerName(e.target.value.slice(0, 16))}
          placeholder={inviteMode ? 'Guest name…' : 'Enter your name…'}
          maxLength={16}
          style={{ marginTop: 8 }}
          onKeyDown={e => { if (e.key === 'Enter' && inviteMode) handleJoin(); }}
        />
      </div>

      <div className={`online-menu-options${inviteMode ? ' invite-mode' : ''}`}>
        {!inviteMode && (
          <div className="panel online-menu-card">
            <div className="panel-title">Create Room</div>
            <PixelButton variant="primary" onClick={handleCreate} disabled={loading !== null}>
              {loading === 'create' ? 'Creating…' : 'Create Room'}
            </PixelButton>
          </div>
        )}

        <div className="panel online-menu-card">
          <div className="panel-title">{inviteMode ? 'Join This Room' : 'Join Room'}</div>
          <input
            className="gen-seed-input online-code-input"
            value={joinCode}
            onChange={e => setJoinCode(cleanRoomCode(e.target.value))}
            placeholder="XXXXX"
            maxLength={5}
            disabled={inviteMode}
            onKeyDown={e => { if (e.key === 'Enter') handleJoin(); }}
          />
          <PixelButton variant="primary" onClick={handleJoin} disabled={loading !== null || !joinCode.trim()}>
            {loading === 'join' ? 'Joining…' : inviteMode ? 'Join Invite' : 'Join Room'}
          </PixelButton>
        </div>
      </div>

      {error && <div className="online-error">{error}</div>}

    </div>
  );
}
