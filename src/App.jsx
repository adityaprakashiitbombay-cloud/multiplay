import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Lobby from './components/Lobby';
import TicTacToeGame from './components/TicTacToe/TicTacToeGame';
import HiddenModelGame from './components/HiddenModel/HiddenModelGame';
import ChatAndReactions from './components/ChatAndReactions';
import QRCodeModal from './components/QRCodeModal';
import NotificationToast from './components/NotificationToast';
import { socketService } from './services/socket';
import { soundManager } from './services/audio';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedName = localStorage.getItem('multiplay_name') || 'CyberGamer';
    return { id: null, name: savedName, avatar: '👾' };
  });

  const [currentRoom, setCurrentRoom] = useState(null);
  const [activeGame, setActiveGame] = useState('tictactoe'); // 'tictactoe' | 'hidden-model'
  const [isOnline, setIsOnline] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Show temporary toast notification
  const showToast = useCallback((message) => {
    setToast({ id: Date.now(), message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Initialize socket event subscriptions
  useEffect(() => {
    socketService.connect();

    const unsubStatus = socketService.on('connection_status', (data) => {
      setIsOnline(data.connected);
      if (data.connected && data.id) {
        setCurrentUser(prev => ({ ...prev, id: data.id }));
      }
    });

    const unsubRoom = socketService.on('room_updated', (roomData) => {
      setCurrentRoom(roomData);
      if (roomData.activeGame) {
        setActiveGame(roomData.activeGame);
      }
    });

    const unsubError = socketService.on('error_message', (err) => {
      showToast(`⚠️ ${err.message || 'Error occurred'}`);
    });

    // Check if URL has ?room= parameter for auto-join
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      handleJoinRoom(roomParam, { name: currentUser.name, avatar: currentUser.avatar });
    }

    return () => {
      unsubStatus();
      unsubRoom();
      unsubError();
    };
  }, []);

  // Room Creation
  const handleCreateRoom = async (userData) => {
    setIsLoading(true);
    setCurrentUser(prev => ({ ...prev, ...userData }));
    try {
      const res = await socketService.createRoom(userData);
      if (res?.success) {
        setCurrentRoom(res.room);
        showToast(`🎉 Room ${res.roomId} created successfully!`);
      } else {
        showToast('Failed to create room. Please try again.');
      }
    } catch (e) {
      console.error(e);
      showToast('Connection error. Starting local room mode.');
    } finally {
      setIsLoading(false);
    }
  };

  // Room Joining
  const handleJoinRoom = async (roomId, userData) => {
    setIsLoading(true);
    setCurrentUser(prev => ({ ...prev, ...userData }));
    try {
      const res = await socketService.joinRoom(roomId, userData);
      if (res?.success) {
        setCurrentRoom(res.room);
        showToast(`🎮 Joined Room ${roomId}!`);
      } else {
        showToast('Could not join room. Check the room code.');
      }
    } catch (e) {
      console.error(e);
      showToast('Connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Instant Solo Sandbox Mode
  const handleStartInstantSolo = (userData) => {
    setCurrentUser(prev => ({ ...prev, ...userData }));
    // Create local mock room
    setCurrentRoom({
      id: 'LOCAL-SOLO',
      connectedUsers: [{ id: 'local-user', name: userData.name, avatar: userData.avatar, isHost: true }],
      activeGame: 'tictactoe',
      chat: [],
      ticTacToe: {
        board: Array(9).fill(null),
        currentTurn: 'X',
        playerX: { id: 'local-user', name: userData.name, avatar: userData.avatar },
        playerO: null,
        scores: { X: 0, O: 0, ties: 0 },
        status: 'playing',
        winner: null,
        winningLine: null,
        moveHistory: []
      }
    });
    showToast('🚀 Instant Sandbox Mode Activated!');
  };

  // Leave room
  const handleLeaveRoom = () => {
    socketService.leaveRoom();
    setCurrentRoom(null);
    showToast('Left the game room.');
  };

  // Switch Game
  const handleSwitchGame = (gameType) => {
    setActiveGame(gameType);
    if (currentRoom && currentRoom.id !== 'LOCAL-SOLO') {
      socketService.switchGame(gameType);
    }
  };

  // Copy Invite Link
  const handleCopyInvite = () => {
    if (!currentRoom) return;
    const shareUrl = `${window.location.origin}?room=${currentRoom.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      showToast('📋 Room invite link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const isEnabled = soundManager.toggle();
    setSoundEnabled(isEnabled);
    showToast(isEnabled ? '🔊 Sound effects enabled' : '🔇 Sound effects muted');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 font-sans selection:bg-brand-violet selection:text-white">
      
      {/* Global Header */}
      <Header
        room={currentRoom}
        activeGame={activeGame}
        onSwitchGame={handleSwitchGame}
        onLeaveRoom={handleLeaveRoom}
        onOpenQR={() => setIsQRModalOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onCopyInvite={handleCopyInvite}
        copied={copied}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24">
        {!currentRoom ? (
          /* Lobby & Game Hub Introduction */
          <Lobby
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onStartInstantSolo={handleStartInstantSolo}
            isLoading={isLoading}
          />
        ) : (
          /* Active Game View */
          <div className="animate-countdown">
            {activeGame === 'tictactoe' ? (
              <TicTacToeGame
                room={currentRoom}
                isOnline={isOnline && currentRoom.id !== 'LOCAL-SOLO'}
                currentUser={currentUser}
                onSocketMove={(idx) => socketService.makeTicTacToeMove(idx)}
                onSocketReset={() => socketService.resetTicTacToe()}
              />
            ) : (
              <HiddenModelGame
                room={currentRoom}
                isOnline={isOnline && currentRoom.id !== 'LOCAL-SOLO'}
                currentUser={currentUser}
                onSocketLockIn={(pId, model, reason) => socketService.lockInModelChoice(pId, model, reason)}
                onSocketSubmitPredictions={(pId, preds) => socketService.submitPredictions(pId, preds)}
                onSocketTriggerReveal={() => socketService.startRevealCountdown()}
                onSocketResetGame={() => socketService.resetHiddenModelGame()}
                onSocketUpdatePlayerCount={(count) => socketService.updatePlayersCount(count)}
                onSocketAddPlayer={(player) => socketService.addCustomPlayer(player)}
                onSocketRemovePlayer={(pId) => socketService.removePlayer(pId)}
                onSocketStartGuessing={() => socketService.startGuessing()}
                onSocketSendChat={(text) => socketService.sendChatMessage(text, currentUser?.name)}
              />
            )}

            {/* Persistent In-Game Social Chat & Floating Reactions */}
            <ChatAndReactions
              room={currentRoom}
              currentUser={currentUser}
              onSendReaction={(emoji) => socketService.sendReaction(emoji)}
              onSendChat={(text, name) => socketService.sendChatMessage(text, name)}
            />
          </div>
        )}
      </main>

      {/* QR Code Modal for Mobile Joining */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        roomId={currentRoom?.id}
        onCopyLink={handleCopyInvite}
        copied={copied}
      />

      {/* Toast Notification Alert */}
      <NotificationToast toast={toast} />

    </div>
  );
}
