import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Bot, 
  Users, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Trophy,
  Flame,
  Volume2
} from '../Icons';
import ScoreBoard from './ScoreBoard';
import Fireworks from '../Fireworks';
import { soundManager } from '../../services/audio';
import { checkWinner, getAIMove } from '../../services/aiLogic';

export default function TicTacToeGame({ 
  room, 
  isOnline, 
  currentUser, 
  onSocketMove, 
  onSocketReset 
}) {
  // Local offline / solo state fallback
  const [localBoard, setLocalBoard] = useState(Array(9).fill(null));
  const [localTurn, setLocalTurn] = useState('X');
  const [localStatus, setLocalStatus] = useState('playing'); // 'playing' | 'won' | 'draw'
  const [localWinner, setLocalWinner] = useState(null);
  const [localWinningLine, setLocalWinningLine] = useState(null);
  const [localScores, setLocalScores] = useState({ X: 0, O: 0, ties: 0 });
  const [localMoves, setLocalMoves] = useState([]);
  
  // Game Play Mode: 'online' | 'ai' | 'pass-and-play'
  const [playMode, setPlayMode] = useState(() => (room && isOnline ? 'online' : 'ai'));
  const [aiDifficulty, setAiDifficulty] = useState('master'); // 'easy' | 'medium' | 'master'
  const [hoveredCell, setHoveredCell] = useState(null);

  // Sync mode if room changes
  useEffect(() => {
    if (room && isOnline) {
      setPlayMode('online');
    }
  }, [room, isOnline]);

  // Read either online room state or local state
  const board = (playMode === 'online' && room?.ticTacToe) ? room.ticTacToe.board : localBoard;
  const currentTurn = (playMode === 'online' && room?.ticTacToe) ? room.ticTacToe.currentTurn : localTurn;
  const status = (playMode === 'online' && room?.ticTacToe) ? room.ticTacToe.status : localStatus;
  const winner = (playMode === 'online' && room?.ticTacToe) ? room.ticTacToe.winner : localWinner;
  const winningLine = (playMode === 'online' && room?.ticTacToe) ? room.ticTacToe.winningLine : localWinningLine;
  const scores = (playMode === 'online' && room?.ticTacToe) ? room.ticTacToe.scores : localScores;
  const moves = (playMode === 'online' && room?.ticTacToe) ? room.ticTacToe.moveHistory : localMoves;
  const playerX = (playMode === 'online' && room?.ticTacToe) ? room.ticTacToe.playerX : { name: currentUser?.name || 'Player X', avatar: currentUser?.avatar || '👾' };
  const playerO = (playMode === 'online' && room?.ticTacToe) 
    ? (room.ticTacToe.playerO || { name: 'Waiting...', avatar: '⏳' }) 
    : (playMode === 'ai' ? { name: `AI Bot (${aiDifficulty.toUpperCase()})`, avatar: '🤖' } : { name: 'Player O (Local)', avatar: '🦊' });

  // Fireworks state
  const [showFireworks, setShowFireworks] = useState(false);
  const prevStatusRef = useRef(null);

  // Draw auto-reset countdown state
  const [drawCountdown, setDrawCountdown] = useState(null); // null | 3 | 2 | 1
  const drawTimerRef = useRef(null);

  // Fireworks + Win Song on victory
  useEffect(() => {
    if (status === 'won' && prevStatusRef.current !== 'won') {
      setShowFireworks(true);
      soundManager.playVictory();
      soundManager.playWinSong();
      setTimeout(() => setShowFireworks(false), 8000);
    }
    // Draw: auto-reset after 3 seconds with countdown
    if (status === 'draw' && prevStatusRef.current !== 'draw') {
      let count = 3;
      setDrawCountdown(count);
      drawTimerRef.current = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setDrawCountdown(count);
        } else {
          clearInterval(drawTimerRef.current);
          setDrawCountdown(null);
          // trigger reset
          if (playMode === 'online' && isOnline) {
            onSocketReset();
          } else {
            setLocalBoard(Array(9).fill(null));
            setLocalTurn('X');
            setLocalStatus('playing');
            setLocalWinner(null);
            setLocalWinningLine(null);
            setLocalMoves([]);
          }
        }
      }, 1000);
    }
    prevStatusRef.current = status;
    return () => {};
  }, [status]);

  // Cleanup draw timer on unmount
  useEffect(() => () => clearInterval(drawTimerRef.current), []);

  // AI response trigger when in AI mode
  useEffect(() => {
    if (playMode === 'ai' && currentTurn === 'O' && status === 'playing') {
      const timer = setTimeout(() => {
        const aiIndex = getAIMove([...localBoard], 'O', aiDifficulty);
        if (aiIndex !== null) {
          executeLocalMove(aiIndex, 'O');
        }
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [playMode, currentTurn, status, localBoard, aiDifficulty]);

  // Execute local move
  const executeLocalMove = (index, forcedSymbol = null) => {
    if (localBoard[index] !== null || localStatus !== 'playing') return;

    const symbol = forcedSymbol || localTurn;
    const newBoard = [...localBoard];
    newBoard[index] = symbol;

    soundManager.playMove(symbol === 'X');

    const newMoves = [
      ...localMoves,
      {
        step: localMoves.length + 1,
        symbol,
        index,
        row: Math.floor(index / 3) + 1,
        col: (index % 3) + 1,
        timestamp: Date.now()
      }
    ];

    setLocalBoard(newBoard);
    setLocalMoves(newMoves);

    const winResult = checkWinner(newBoard);
    if (winResult) {
      if (winResult.winner === 'draw') {
        setLocalStatus('draw');
        setLocalScores(prev => ({ ...prev, ties: prev.ties + 1 }));
      } else {
        setLocalStatus('won');
        setLocalWinner(winResult.winner);
        setLocalWinningLine(winResult.line);
        setLocalScores(prev => ({ ...prev, [winResult.winner]: prev[winResult.winner] + 1 }));
      }
    } else {
      setLocalTurn(symbol === 'X' ? 'O' : 'X');
    }
  };

  // Handle Cell Click
  const handleCellClick = (index) => {
    if (board[index] !== null || status !== 'playing') return;

    if (playMode === 'online' && isOnline) {
      // Check turn permissions
      const isPlayerX = room?.ticTacToe?.playerX?.id === currentUser?.id;
      const isPlayerO = room?.ticTacToe?.playerO?.id === currentUser?.id;
      
      // If room has player O assigned, enforce turn
      if (room?.ticTacToe?.playerO && ((currentTurn === 'X' && !isPlayerX) || (currentTurn === 'O' && !isPlayerO))) {
        return;
      }
      soundManager.playMove(currentTurn === 'X');
      onSocketMove(index);
    } else {
      // Local or AI mode
      if (playMode === 'ai' && currentTurn !== 'X') return;
      executeLocalMove(index);
    }
  };

  // Reset Game
  const handleReset = () => {
    soundManager.playClick();
    if (playMode === 'online' && isOnline) {
      onSocketReset();
    } else {
      setLocalBoard(Array(9).fill(null));
      setLocalTurn('X');
      setLocalStatus('playing');
      setLocalWinner(null);
      setLocalWinningLine(null);
      setLocalMoves([]);
    }
  };

  // Stop win song if game resets
  useEffect(() => {
    if (status === 'playing' && prevStatusRef.current === 'won') {
      soundManager.stopWinSong();
    }
  }, [status]);

  return (
    <>
      <Fireworks active={showFireworks} />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Controller: Mode Switcher & Difficulty */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel rounded-2xl p-3 sm:p-4 border border-slate-800">
        
        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {room && (
            <button
              onClick={() => {
                soundManager.playClick();
                setPlayMode('online');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                playMode === 'online'
                  ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Live Room</span>
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playClick();
              setPlayMode('ai');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              playMode === 'ai'
                ? 'bg-violet-500 text-white shadow-glow-violet'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Solo vs AI</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setPlayMode('pass-and-play');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              playMode === 'pass-and-play'
                ? 'bg-fuchsia-500 text-white shadow-glow-fuchsia'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Pass & Play</span>
          </button>
        </div>

        {/* AI Difficulty Selector if in AI mode */}
        {playMode === 'ai' && (
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase px-2 font-bold">AI Level:</span>
            {['easy', 'medium', 'master'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  soundManager.playClick();
                  setAiDifficulty(lvl);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  aiDifficulty === lvl
                    ? 'bg-slate-700 text-cyan-300 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl === 'master' ? '👑 Master' : lvl}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Game Arena: 3x3 Grid & Scoreboard */}
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Scoreboard */}
        <ScoreBoard
          scores={scores}
          currentTurn={currentTurn}
          status={status}
          winner={winner}
          playerX={playerX}
          playerO={playerO}
          isOnline={playMode === 'online'}
          mode={playMode}
          onReset={handleReset}
        />

        {/* Draw Auto-Reset Countdown Banner */}
        {status === 'draw' && drawCountdown !== null && (
          <div className="flex items-center justify-center gap-4 py-3 px-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 animate-pulse">
            <span className="text-amber-300 font-bold text-sm">🤝 It's a Draw! New round in</span>
            <div className="relative w-10 h-10">
              {/* Spinning ring */}
              <svg className="absolute inset-0 w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#92400e" strokeWidth="3" />
                <circle
                  cx="20" cy="20" r="16"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - drawCountdown / 3)}`}
                  style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-amber-300 font-black text-base">
                {drawCountdown}
              </span>
            </div>
            <span className="text-amber-400/70 text-xs font-semibold">seconds</span>
          </div>
        )}

        {/* 3x3 Arcade Console Container */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#00ff66]/25 flex items-center justify-center relative shadow-2xl overflow-hidden bg-[#080d1a]">
          
          {/* Arcade Console Corner LEDs */}
          <div className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-[#00ff66] shadow-[0_0_10px_#00ff66] animate-pulse" />
          <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#00f0ff] shadow-[0_0_10px_#00f0ff] animate-pulse" />
          <div className="absolute bottom-3 left-3 w-2.5 h-2.5 rounded-full bg-[#ff00a0] shadow-[0_0_10px_#ff00a0] animate-pulse" />
          <div className="absolute bottom-3 right-3 w-2.5 h-2.5 rounded-full bg-[#ffb700] shadow-[0_0_10px_#ffb700] animate-pulse" />

          {/* Ambient radial glow */}
          <div className="absolute w-80 h-80 bg-[#00f0ff]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute w-80 h-80 bg-[#ff00a0]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[380px] sm:max-w-[420px] aspect-square relative z-10">
            {board.map((cell, index) => {
              const isWinningCell = winningLine && winningLine.includes(index);
              const isHovered = hoveredCell === index && cell === null && status === 'playing';

              return (
                <button
                  key={index}
                  id={`ttt-cell-${index}`}
                  onClick={() => handleCellClick(index)}
                  onMouseEnter={() => setHoveredCell(index)}
                  onMouseLeave={() => setHoveredCell(null)}
                  disabled={cell !== null || status !== 'playing'}
                  className={`relative rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-200 aspect-square select-none ${
                    cell !== null
                      ? 'bg-[#0a1020] border border-[#00ff66]/30 shadow-inner'
                      : 'bg-[#0a1020]/60 hover:bg-[#0f1930] border border-slate-800 hover:border-[#00ff66]/60 hover:scale-[1.03] cursor-pointer hover:shadow-[0_0_20px_rgba(0,255,102,0.25)]'
                  } ${
                    isWinningCell
                      ? 'ring-2 ring-[#00ff66] bg-[#00ff66]/20 shadow-[0_0_30px_rgba(0,255,102,0.6)] animate-pulse'
                      : ''
                  }`}
                >
                  {/* Render Player X Symbol (Cyan Neon) */}
                  {cell === 'X' && (
                    <span className="text-4xl sm:text-6xl font-black text-[#00f0ff] text-glow-cyan animate-countdown">
                      ✕
                    </span>
                  )}

                  {/* Render Player O Symbol (Magenta Neon) */}
                  {cell === 'O' && (
                    <span className="text-4xl sm:text-6xl font-black text-[#ff00a0] text-glow-magenta animate-countdown">
                      ◯
                    </span>
                  )}

                  {/* Hover Faint Marker Preview */}
                  {isHovered && (
                    <span className="text-4xl sm:text-6xl font-black opacity-25 transition-opacity">
                      {currentTurn === 'X' ? (
                        <span className="text-[#00f0ff]">✕</span>
                      ) : (
                        <span className="text-[#ff00a0]">◯</span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Turn / Instructions Bar */}
        <div className="flex items-center justify-between px-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Click any open square to make your move</span>
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            {playMode === 'online' ? 'Real-Time Sync Active' : `Mode: ${playMode.toUpperCase()}`}
          </span>
        </div>

      </div>

    </div>
    </>
  );
}
