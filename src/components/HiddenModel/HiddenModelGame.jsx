import React, { useState, useEffect } from 'react';
import SetupPhase from './SetupPhase';
import ChatPhase from './ChatPhase';
import PredictionPhase from './PredictionPhase';
import RevealPhase from './RevealPhase';
import { soundManager } from '../../services/audio';
import { ALL_PLAYERS, FEATURED_CHIPS } from '../../data/playerDatabase';

// All known player/celebrity names for fuzzy matching
export const KNOWN_NAMES = [
  ...ALL_PLAYERS,
  // Football & other sports fallback
  'Cristiano Ronaldo', 'Lionel Messi', 'Kylian Mbappé', 'Erling Haaland', 'Neymar Jr',
  'Mohamed Salah', 'Robert Lewandowski', 'Karim Benzema', 'Luka Modric',
  'Kevin De Bruyne', 'Virgil van Dijk', 'Harry Kane', 'Sadio Mané',
  'LeBron James', 'Roger Federer', 'Novak Djokovic', 'Rafael Nadal', 'Serena Williams',
  'Usain Bolt', 'Michael Jordan', 'Tiger Woods',
];

export default function HiddenModelGame({
  room,
  isOnline,
  currentUser,
  onSocketLockIn,
  onSocketSubmitPredictions,
  onSocketTriggerReveal,
  onSocketResetGame,
  onSocketUpdatePlayerCount,
  onSocketAddPlayer,
  onSocketRemovePlayer,
  onSocketStartGuessing,
  onSocketSendChat,
}) {
  // Local state for solo / sandbox mode fallback
  const [localPhase, setLocalPhase] = useState('setup');
  const [localCountdown, setLocalCountdown] = useState(3);
  const [localPlayers, setLocalPlayers] = useState([
    {
      id: 'p-1',
      socketId: currentUser?.id || 'local-1',
      name: currentUser?.name || 'Player 1',
      avatar: currentUser?.avatar || '👾',
      secretModel: '',
      customReason: '',
      lockedIn: false,
      predictions: {},
      hasSubmittedPredictions: false
    },
    {
      id: 'p-2',
      socketId: 'local-2',
      name: 'Player 2',
      avatar: '🤖',
      secretModel: '',
      customReason: '',
      lockedIn: false,
      predictions: {},
      hasSubmittedPredictions: false
    }
  ]);
  const [localResultsSummary, setLocalResultsSummary] = useState(null);

  // Sync mode: online room vs local
  const isUsingRoom = isOnline && room?.hiddenModel;
  const phase = isUsingRoom ? room.hiddenModel.phase : localPhase;
  const countdownValue = isUsingRoom ? room.hiddenModel.countdownValue : localCountdown;
  const players = isUsingRoom ? room.hiddenModel.players : localPlayers;
  const resultsSummary = isUsingRoom ? room.hiddenModel.resultsSummary : localResultsSummary;
  const presetModels = FEATURED_CHIPS; // small clean set for UI chips

  // Build full candidates list: 400+ IPL/intl players + custom secret models entered
  const nameCandidates = [
    ...KNOWN_NAMES,
    ...players.map(p => p.secretModel).filter(Boolean),
  ];

  // Local Countdown Handler for offline mode
  useEffect(() => {
    if (!isUsingRoom && localPhase === 'countdown') {
      let count = 3;
      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setLocalCountdown(count);
        } else {
          clearInterval(interval);
          setLocalPhase('revealed');
          calculateLocalSummary();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [localPhase, isUsingRoom]);

  // Calculate local results summary
  const calculateLocalSummary = () => {
    const modelClusters = {};
    const accuracyLeaderboard = [];

    localPlayers.forEach(p => {
      const model = p.secretModel || 'Unknown';
      if (!modelClusters[model]) modelClusters[model] = [];
      modelClusters[model].push(p.name);
    });

    localPlayers.forEach(guesser => {
      let correctCount = 0;
      let totalGuesses = 0;
      const guessDetails = [];

      localPlayers.forEach(target => {
        if (target.id !== guesser.id) {
          totalGuesses += 1;
          const predicted = (guesser.predictions[target.id] || '').trim().toLowerCase();
          const actual = (target.secretModel || '').trim().toLowerCase();
          const isCorrect = predicted !== '' && predicted === actual;
          if (isCorrect) correctCount += 1;

          guessDetails.push({
            targetId: target.id,
            targetName: target.name,
            predicted: guesser.predictions[target.id] || 'No Guess',
            actual: target.secretModel || 'Unknown',
            isCorrect
          });
        }
      });

      const accuracy = totalGuesses > 0 ? Math.round((correctCount / totalGuesses) * 100) : 0;
      accuracyLeaderboard.push({
        playerId: guesser.id,
        playerName: guesser.name,
        avatar: guesser.avatar,
        correctCount,
        totalGuesses,
        accuracy,
        guessDetails
      });
    });

    accuracyLeaderboard.sort((a, b) => b.correctCount - a.correctCount || b.accuracy - a.accuracy);

    setLocalResultsSummary({
      revealedAt: Date.now(),
      modelClusters,
      accuracyLeaderboard,
      topScorer: accuracyLeaderboard[0] || null
    });
  };

  // Lock In Choice Handler
  const handleLockInChoice = (playerId, secretModel, customReason) => {
    if (isUsingRoom) {
      onSocketLockIn(playerId, secretModel, customReason);
    } else {
      setLocalPlayers(prev => prev.map(p => {
        if (p.id === playerId) return { ...p, secretModel, customReason, lockedIn: true };
        return p;
      }));
      // Check if all locked → go to chatting
      const updated = localPlayers.map(p =>
        p.id === playerId ? { ...p, secretModel, customReason, lockedIn: true } : p
      );
      if (updated.every(p => p.lockedIn)) {
        setTimeout(() => setLocalPhase('chatting'), 300);
      }
    }
  };

  // Start Guessing (chatting → predicting)
  const handleStartGuessing = () => {
    if (isUsingRoom) {
      onSocketStartGuessing();
    } else {
      setLocalPhase('predicting');
    }
  };

  // Submit Predictions Handler
  const handleSubmitPredictions = (playerId, predictions) => {
    if (isUsingRoom) {
      onSocketSubmitPredictions(playerId, predictions);
    } else {
      setLocalPlayers(prev => prev.map(p => {
        if (p.id === playerId) return { ...p, predictions, hasSubmittedPredictions: true };
        return p;
      }));
    }
  };

  // Trigger Reveal
  const handleTriggerReveal = () => {
    if (isUsingRoom) {
      onSocketTriggerReveal();
    } else {
      setLocalPhase('countdown');
      setLocalCountdown(3);
    }
  };

  // Reset Game
  const handleResetGame = () => {
    soundManager.playClick();
    if (isUsingRoom) {
      onSocketResetGame();
    } else {
      setLocalPhase('setup');
      setLocalCountdown(3);
      setLocalResultsSummary(null);
      setLocalPlayers(prev => prev.map(p => ({
        ...p,
        secretModel: '',
        customReason: '',
        lockedIn: false,
        predictions: {},
        hasSubmittedPredictions: false
      })));
    }
  };

  // Add / Remove Player local handlers
  const handleAddPlayer = (newP) => {
    if (isUsingRoom) {
      onSocketAddPlayer(newP);
    } else {
      setLocalPlayers(prev => [
        ...prev,
        {
          id: `p-${Date.now()}`,
          socketId: null,
          name: newP.name || `Player ${prev.length + 1}`,
          avatar: newP.avatar || '⚡',
          secretModel: '',
          customReason: '',
          lockedIn: false,
          predictions: {},
          hasSubmittedPredictions: false
        }
      ]);
    }
  };

  const handleRemovePlayer = (playerId) => {
    if (isUsingRoom) {
      onSocketRemovePlayer(playerId);
    } else {
      if (localPlayers.length <= 2) return;
      setLocalPlayers(prev => prev.filter(p => p.id !== playerId));
    }
  };

  const handleUpdatePlayerCount = (count) => {
    if (isUsingRoom) {
      onSocketUpdatePlayerCount(count);
    } else {
      const num = Math.max(2, Math.min(8, count));
      setLocalPlayers(prev => {
        if (num > prev.length) {
          const added = [...prev];
          for (let i = prev.length; i < num; i++) {
            added.push({
              id: `p-${Date.now()}-${i}`,
              socketId: null,
              name: `Player ${i + 1}`,
              avatar: ['🤖', '⚡', '🧠', '🔮', '👾', '🚀', '🎯', '💎'][i % 8],
              secretModel: '',
              customReason: '',
              lockedIn: false,
              predictions: {},
              hasSubmittedPredictions: false
            });
          }
          return added;
        } else {
          return prev.slice(0, num);
        }
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* PHASE 1: SETUP */}
      {phase === 'setup' && (
        <SetupPhase
          players={players}
          presetModels={presetModels}
          nameCandidates={nameCandidates}
          onLockInChoice={handleLockInChoice}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={handleRemovePlayer}
          onUpdatePlayerCount={handleUpdatePlayerCount}
          onProceedToPrediction={() => {
            if (!isUsingRoom) setLocalPhase('chatting');
          }}
          isHost={room?.hostId === currentUser?.id}
          currentUser={currentUser}
        />
      )}

      {/* PHASE 2: CHAT */}
      {phase === 'chatting' && (
        <ChatPhase
          players={players}
          room={isUsingRoom ? room : null}
          currentUser={currentUser}
          onSendChat={(text) => {
            if (isUsingRoom) onSocketSendChat?.(text);
          }}
          onStartGuessing={handleStartGuessing}
          isHost={room?.hostId === currentUser?.id}
        />
      )}

      {/* PHASE 3: PREDICTION */}
      {phase === 'predicting' && (
        <PredictionPhase
          players={players}
          presetModels={presetModels}
          nameCandidates={nameCandidates}
          onSubmitPredictions={handleSubmitPredictions}
          onTriggerReveal={handleTriggerReveal}
          isHost={room?.hostId === currentUser?.id}
          currentUser={currentUser}
        />
      )}

      {/* PHASE 4: COUNTDOWN & REVEAL */}
      {(phase === 'countdown' || phase === 'revealed') && (
        <RevealPhase
          players={players}
          countdownValue={countdownValue}
          isCountingDown={phase === 'countdown'}
          resultsSummary={resultsSummary}
          onPlayAgain={handleResetGame}
        />
      )}
    </div>
  );
}
