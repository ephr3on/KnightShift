export interface StoredOnlineSession {
  roomCode: string;
  playerId: string;
  playerName: string;
  role: 'host' | 'guest';
}

const KEY = 'knightshift_online_session';

export function saveOnlineSession(session: StoredOnlineSession): void {
  try { localStorage.setItem(KEY, JSON.stringify(session)); } catch { /* ignore */ }
}

export function loadOnlineSession(): StoredOnlineSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredOnlineSession) : null;
  } catch { return null; }
}

export function clearOnlineSession(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
