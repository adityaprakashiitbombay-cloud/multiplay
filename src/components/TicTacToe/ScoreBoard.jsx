import React from 'react';
import { Trophy, Swords, Zap, RefreshCw } from '../Icons';

export default function ScoreBoard({ 
  scores, 
  currentTurn, 
  status, 
  winner, 
  playerX, 
  playerO, 
  isOnline,
  mode,
  onReset
}) {
  return (
    <div className="w-full glass-card rounded-2xl p-4 border border-[#00ff66]/20 shadow-xl space-y-4">
      
      {/* Top Banner: Turn or Game Over status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[10px] uppercase font-cyber font-bold tracking-wider text-slate-400">Match Arena</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-arcade font-bold text-slate-100">
                {status === 'playing' ? (
                  <span className="flex items-center gap-1.5 text-[#00f0ff] text-glow-cyan">
                    <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
                    Turn: Player {currentTurn}
                  </span>
                ) : status === 'draw' ? (
                  <span className="text-[#ffb700] font-bold text-glow-gold">🤝 Draw Match</span>
                ) : (
                  <span className="text-[#00ff66] font-bold text-glow-lime">🎉 Winner: Player {winner}!</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Rematch Button */}
        <button
          id="btn-ttt-reset"
          onClick={onReset}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#080d1a] hover:bg-[#0e1628] border border-[#00ff66]/40 text-xs font-cyber font-bold text-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.15)] transition-all hover:scale-105"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Rematch</span>
        </button>
      </div>

      {/* 3-Column Score Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
        
        {/* Player X */}
        <div className={`p-3 rounded-xl border transition-all ${
          currentTurn === 'X' && status === 'playing'
            ? 'bg-[#00f0ff]/10 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.3)] scale-105'
            : 'bg-[#080d1a] border-slate-800'
        }`}>
          <div className="flex items-center justify-center gap-1 text-[#00f0ff] text-xs font-cyber font-bold mb-1">
            <span>{playerX?.avatar || '👾'}</span>
            <span className="truncate max-w-[80px]">{playerX?.name || 'Player X'}</span>
            <span className="text-[#00f0ff] font-mono font-black">(X)</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#00f0ff] font-mono text-glow-cyan">
            {scores.X}
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-cyber font-semibold">Wins</span>
        </div>

        {/* Ties */}
        <div className="p-3 rounded-xl bg-[#080d1a] border border-slate-800">
          <div className="text-[#ffb700] text-xs font-cyber font-bold mb-1">
            Ties 🤝
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#ffb700] font-mono text-glow-gold">
            {scores.ties}
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-cyber font-semibold">Draws</span>
        </div>

        {/* Player O */}
        <div className={`p-3 rounded-xl border transition-all ${
          currentTurn === 'O' && status === 'playing'
            ? 'bg-[#ff00a0]/10 border-[#ff00a0] shadow-[0_0_20px_rgba(255,0,160,0.3)] scale-105'
            : 'bg-[#080d1a] border-slate-800'
        }`}>
          <div className="flex items-center justify-center gap-1 text-[#ff00a0] text-xs font-cyber font-bold mb-1">
            <span>{playerO?.avatar || '🤖'}</span>
            <span className="truncate max-w-[80px]">{playerO?.name || 'Player O'}</span>
            <span className="text-[#ff00a0] font-mono font-black">(O)</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#ff00a0] font-mono text-glow-magenta">
            {scores.O}
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-cyber font-semibold">Wins</span>
        </div>

      </div>
    </div>
  );
}
