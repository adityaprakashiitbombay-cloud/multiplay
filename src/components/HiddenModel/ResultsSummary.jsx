import React from 'react';
import { 
  Trophy, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Award, 
  Flame, 
  Users, 
  Zap, 
  RotateCcw 
} from '../Icons';

export default function ResultsSummary({ resultsSummary, players, onPlayAgain }) {
  if (!resultsSummary) return null;

  const { modelClusters, accuracyLeaderboard, topScorer } = resultsSummary;

  return (
    <div className="space-y-6">
      
      {/* Top Victory / Matching Spotlight Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-glow-amber">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Trophy className="w-7 h-7" />
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Match Results & Analysis
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight mt-1">
                {topScorer?.correctCount > 0 
                  ? `Top Guesser: ${topScorer.playerName} (${topScorer.accuracy}% Accuracy)` 
                  : 'All Secret Choices Revealed!'}
              </h2>
              <p className="text-xs text-slate-400">
                Comprehensive breakdown of choices, matching pairs, and prediction accuracy.
              </p>
            </div>
          </div>

          {/* Persistent Reset / Play Again Button */}
          <button
            type="button"
            id="btn-play-again"
            onClick={onPlayAgain}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 font-black text-sm shadow-glow-cyan hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset / Play Again</span>
          </button>
        </div>
      </div>

      {/* 2-Column Analysis Grid: Matching Clusters vs. Prediction Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Matching Choices & Clusters */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" />
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
              Matching Star / Person Selections
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Players who chose the exact same cricketer, footballer, or star:
          </p>

          <div className="space-y-3">
            {Object.entries(modelClusters || {}).map(([model, playerList], idx) => {
              const isShared = playerList.length > 1;

              return (
                <div
                  key={model || idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isShared
                      ? 'bg-violet-950/30 border-violet-500/50 shadow-glow-violet'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-100 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono">
                        {model}
                      </span>
                      {isShared && (
                        <span className="text-[10px] uppercase font-bold text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full border border-violet-500/30 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-violet-300" />
                          <span>Matching Match!</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {playerList.length} {playerList.length === 1 ? 'Player' : 'Players'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {playerList.map(name => (
                      <span
                        key={name}
                        className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-800/80 text-cyan-300 border border-slate-700/60"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Prediction Accuracy Leaderboard */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
              Prediction Accuracy Leaderboard
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Tally of who successfully predicted other players' choices:
          </p>

          <div className="space-y-3">
            {(accuracyLeaderboard || []).map((scorer, rank) => (
              <div
                key={scorer.playerId || rank}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs font-mono ${
                    rank === 0
                      ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                      : rank === 1
                      ? 'bg-slate-300 text-slate-950'
                      : rank === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{rank + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{scorer.avatar || '🤖'}</span>
                      <h4 className="font-bold text-slate-100 text-xs sm:text-sm">
                        {scorer.playerName}
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {scorer.correctCount} of {scorer.totalGuesses} correct guesses
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-cyan-300 font-mono">
                    {scorer.accuracy}%
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Accuracy</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Detailed Guess Comparison Matrix */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
          Individual Guess Breakdown
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(accuracyLeaderboard || []).map((scorer) => (
            <div
              key={scorer.playerId}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <span>{scorer.avatar || '👾'}</span>
                  <span>{scorer.playerName}</span>
                </span>
                <span className="text-[11px] font-mono text-cyan-300 font-bold">
                  {scorer.correctCount}/{scorer.totalGuesses} Hit
                </span>
              </div>

              <div className="space-y-1.5">
                {scorer.guessDetails?.map((detail, dIdx) => (
                  <div
                    key={dIdx}
                    className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-950/60"
                  >
                    <span className="text-slate-400 truncate max-w-[90px]">
                      {detail.targetName}:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-300 font-mono text-[11px]">
                        {detail.predicted || 'No guess'}
                      </span>
                      {detail.isCorrect ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400/60" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
