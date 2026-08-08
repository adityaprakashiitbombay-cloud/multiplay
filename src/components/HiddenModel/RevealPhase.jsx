import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Eye, 
  ShieldCheck, 
  BrainCircuit, 
  Flame, 
  Trophy, 
  Volume2 
} from '../Icons';
import ResultsSummary from './ResultsSummary';
import Fireworks from '../Fireworks';
import { soundManager } from '../../services/audio';

export default function RevealPhase({ 
  players, 
  countdownValue, 
  isCountingDown, 
  resultsSummary, 
  onPlayAgain 
}) {
  const [isFlipped, setIsFlipped] = useState(!isCountingDown);
  const [showFireworks, setShowFireworks] = useState(false);

  // Play countdown audio and trigger card flip + fireworks
  useEffect(() => {
    if (isCountingDown) {
      soundManager.playCountdownTick(countdownValue);
    } else {
      setIsFlipped(true);
      soundManager.playRevealFanfare();
      soundManager.playVictory();
      soundManager.playWinSong();
      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 8000);
    }
  }, [isCountingDown, countdownValue]);

  // If in dramatic countdown phase
  if (isCountingDown) {
    return (
      <div className="glass-panel rounded-3xl p-12 sm:p-20 border border-slate-800 text-center space-y-6 relative overflow-hidden shadow-2xl">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-cyan-400 p-1 mx-auto shadow-glow-violet animate-pulse">
          <div className="w-full h-full bg-[#080c14] rounded-full flex items-center justify-center">
            <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-300 font-mono animate-countdown">
              {countdownValue}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
            Synchronized Star Reveal!
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Unmasking all hidden choices simultaneously across all player screens in {countdownValue}s...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Fireworks active={showFireworks} />
      <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 3 • Reveal & Analysis</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            All Secret Choices Revealed!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Compare everyone's choices side-by-side below with matching highlights.
          </p>
        </div>

        <button
          type="button"
          id="btn-play-again-top"
          onClick={() => {
            soundManager.playClick();
            onPlayAgain();
          }}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-cyan-300 flex items-center gap-2 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start New Round</span>
        </button>
      </div>

      {/* Side-by-Side 3D Flip Player Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player, idx) => (
          <div
            key={player.id || idx}
            className="perspective-1000 min-h-[220px]"
          >
            <div
              className={`w-full h-full duration-700 transform-style-3d relative rounded-3xl transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT OF CARD (Masked / Locked) */}
              <div className="absolute inset-0 backface-hidden glass-card rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                  {player.avatar || '🤖'}
                </div>
                <h4 className="font-bold text-slate-200 text-sm">
                  {player.name}'s Choice
                </h4>
                <span className="text-xs font-mono text-emerald-400">
                  🔒 Locked & Sealed
                </span>
              </div>

              {/* BACK OF CARD (REVEALED 3D STATE) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 glass-panel rounded-3xl p-6 border border-violet-500/50 flex flex-col justify-between shadow-glow-violet bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shadow-inner">
                      {player.avatar || '👾'}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-slate-100 text-sm">
                        {player.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Slot #{idx + 1}
                      </span>
                    </div>
                  </div>
                  
                  <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    Revealed
                  </span>
                </div>

                {/* Secret Choice Spotlight */}
                <div className="my-3 text-center space-y-1.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Secret Star / Choice:
                  </span>
                  <div className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 font-mono">
                    {player.secretModel || 'Virat Kohli'}
                  </div>
                </div>

                {/* Clue / Quote if provided */}
                <div className="text-center">
                  <p className="text-[11px] text-slate-400 italic">
                    {player.customReason ? `"${player.customReason}"` : '✨ Legend choice'}
                  </p>
                </div>

              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Summary Leaderboard & Match Matrix */}
      <ResultsSummary
        resultsSummary={resultsSummary}
        players={players}
        onPlayAgain={onPlayAgain}
      />

    </div>
    </>
  );
}
