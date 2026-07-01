import { useState, useEffect } from 'react';
import type { Puzzle, Screen, PuzzleMode } from './types';
import type { OnlineRoom } from './multiplayer/types';
import { saveOnlineSession, loadOnlineSession, clearOnlineSession } from './multiplayer/onlineSessionStorage';
import { clearOnlineRaceProgress } from './multiplayer/onlineRaceProgressStorage';
import { restoreRoomSession, markPlayerConnected } from './multiplayer/onlineRoomService';
import MainMenu from './components/MainMenu';
import PuzzleSelect from './components/PuzzleSelect';
import GameScreen from './components/GameScreen';
import Credits from './components/Credits';
import CampaignMode from './components/CampaignMode';
import UnlimitedMode from './components/UnlimitedMode';
import DailyPuzzle from './components/DailyPuzzle';
import SavedPuzzles from './components/SavedPuzzles';
import OnlineMenu from './components/OnlineMenu';
import OnlineLobby from './components/OnlineLobby';
import OnlineRace from './components/OnlineRace';
import OnlineResult from './components/OnlineResult';


function readInviteRoomCodeFromUrl(): string {
  const url = new URL(window.location.href);
  const queryCode = url.searchParams.get('room') || url.searchParams.get('join') || url.searchParams.get('r');
  if (queryCode) return queryCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);

  const hash = window.location.hash.replace(/^#/, '');
  const hashParams = new URLSearchParams(hash);
  const hashCode = hashParams.get('room') || hashParams.get('join') || hashParams.get('r');
  return hashCode ? hashCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) : '';
}

function clearInviteRoomCodeFromUrl(): void {
  const url = new URL(window.location.href);
  const hadInvite = url.searchParams.has('room') || url.searchParams.has('join') || url.searchParams.has('r') || window.location.hash.includes('room=');
  if (!hadInvite) return;
  url.searchParams.delete('room');
  url.searchParams.delete('join');
  url.searchParams.delete('r');
  url.hash = '';
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [initialMode, setInitialMode] = useState<PuzzleMode>('no-turns');
  const [gameBackScreen, setGameBackScreen] = useState<Screen>('puzzle-select');

  // Online mode state
  const [onlineRoomCode, setOnlineRoomCode] = useState('');
  const [onlinePlayerId, setOnlinePlayerId] = useState('');
  const [onlinePlayerName, setOnlinePlayerName] = useState('');
  const [onlineRoom, setOnlineRoom] = useState<OnlineRoom | null>(null);
  const [initialInviteRoomCode, setInitialInviteRoomCode] = useState(() => readInviteRoomCodeFromUrl());
  /**
   * Puzzle is generated/reproduced locally by OnlineLobby from the Firestore seed.
   * No large board arrays are stored in Firestore.
   */
  const [onlinePuzzle, setOnlinePuzzle] = useState<Puzzle | null>(null);

  const goToGame = (puzzle: Puzzle, backTo: Screen = 'puzzle-select') => {
    setActivePuzzle(puzzle);
    setGameBackScreen(backTo);
    setScreen('game');
  };

  const openPuzzles = (mode: PuzzleMode) => {
    setInitialMode(mode);
    setScreen('puzzle-select');
  };

  // Session restore or direct invite-link entry on app startup
  useEffect(() => {
    const session = loadOnlineSession();
    if (!session) {
      if (initialInviteRoomCode) setScreen('online-menu');
      return;
    }

    restoreRoomSession(session.roomCode, session.playerId).then(room => {
      if (!room) {
        clearOnlineSession();
        clearOnlineRaceProgress();
        if (initialInviteRoomCode) setScreen('online-menu');
        return;
      }
      setOnlineRoomCode(session.roomCode);
      setOnlinePlayerId(session.playerId);
      setOnlinePlayerName(session.playerName);
      setOnlineRoom(room);
      markPlayerConnected(session.roomCode, session.role).catch(console.error);
      if (
        room.status === 'waiting' || room.status === 'generating' ||
        room.status === 'countdown' || room.status === 'playing'
      ) {
        setScreen('online-lobby');
      } else if (room.status === 'finished') {
        setScreen('online-result');
      } else {
        clearOnlineSession();
        if (initialInviteRoomCode) setScreen('online-menu');
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnlineRoomReady = (
    roomCode: string,
    playerId: string,
    playerName: string,
    role: 'host' | 'guest',
  ) => {
    setOnlineRoomCode(roomCode);
    setOnlinePlayerId(playerId);
    setOnlinePlayerName(playerName);
    setInitialInviteRoomCode('');
    clearInviteRoomCodeFromUrl();
    saveOnlineSession({ roomCode, playerId, playerName, role });
    setScreen('online-lobby');
  };

  /** Called by OnlineLobby when the game begins. Puzzle is already built locally. */
  const handleOnlineGameStart = (room: OnlineRoom, puzzle: Puzzle) => {
    setOnlineRoom(room);
    setOnlinePuzzle(puzzle);
    setScreen('online-race');
  };

  const handleOnlineFinish = (room: OnlineRoom) => {
    clearOnlineRaceProgress();
    setOnlineRoom(room);
    setScreen('online-result');
  };

  /** Called when the result screen returns to lobby (Back to Lobby or rematch). */
  const handleOnlineReturnToLobby = (newRoom: OnlineRoom) => {
    clearOnlineRaceProgress();
    setOnlineRoom(newRoom);
    setOnlinePuzzle(null);
    setScreen('online-lobby');
  };

  const handleOnlineExit = () => {
    clearOnlineSession();
    clearOnlineRaceProgress();
    setInitialInviteRoomCode('');
    clearInviteRoomCodeFromUrl();
    setOnlineRoomCode('');
    setOnlinePlayerId('');
    setOnlinePlayerName('');
    setOnlineRoom(null);
    setOnlinePuzzle(null);
    setScreen('menu');
  };

  return (
    <>
      {screen === 'menu' && (
        <MainMenu
          onNoTurn={() => openPuzzles('no-turns')}
          onCredits={() => setScreen('credits')}
          onCampaign={() => setScreen('campaign')}
          onUnlimited={() => setScreen('unlimited')}
          onDaily={() => setScreen('daily')}
          onSaved={() => setScreen('saved-puzzles')}
          onOnline={() => setScreen('online-menu')}
        />
      )}
      {screen === 'campaign' && (
        <CampaignMode
          onPlay={p => goToGame(p, 'campaign')}
          onBack={() => setScreen('menu')}
        />
      )}
      {screen === 'puzzle-select' && (
        <PuzzleSelect
          onPlay={p => goToGame(p, 'puzzle-select')}
          onBack={() => setScreen('menu')}
          initialMode={initialMode}
        />
      )}
      {screen === 'game' && activePuzzle && (
        <GameScreen
          puzzle={activePuzzle}
          onBack={() => setScreen(gameBackScreen)}
          onBackToMenu={() => setScreen('menu')}
        />
      )}
      {screen === 'credits' && (
        <Credits onBack={() => setScreen('menu')} />
      )}
      {screen === 'unlimited' && (
        <UnlimitedMode
          onPlay={p => goToGame(p, 'unlimited')}
          onBack={() => setScreen('menu')}
        />
      )}
      {screen === 'daily' && (
        <DailyPuzzle
          onPlay={p => goToGame(p, 'daily')}
          onBack={() => setScreen('menu')}
        />
      )}
      {screen === 'saved-puzzles' && (
        <SavedPuzzles
          onPlay={p => goToGame(p, 'saved-puzzles')}
          onBack={() => setScreen('menu')}
        />
      )}
      {screen === 'online-menu' && (
        <OnlineMenu
          onRoomReady={handleOnlineRoomReady}
          onBack={() => {
            setInitialInviteRoomCode('');
            clearInviteRoomCodeFromUrl();
            setScreen('menu');
          }}
          initialJoinCode={initialInviteRoomCode}
        />
      )}
      {screen === 'online-lobby' && (
        <OnlineLobby
          roomCode={onlineRoomCode}
          playerId={onlinePlayerId}
          playerName={onlinePlayerName}
          onGameStart={handleOnlineGameStart}
          onLeave={handleOnlineExit}
        />
      )}
      {screen === 'online-race' && onlineRoom && onlinePuzzle && (
        <OnlineRace
          puzzle={onlinePuzzle}
          room={onlineRoom}
          playerId={onlinePlayerId}
          playerName={onlinePlayerName}
          onFinish={handleOnlineFinish}
        />
      )}
      {screen === 'online-result' && onlineRoom && (
        <OnlineResult
          room={onlineRoom}
          playerId={onlinePlayerId}
          onRematch={handleOnlineReturnToLobby}
          onExit={handleOnlineExit}
        />
      )}
    </>
  );
}
