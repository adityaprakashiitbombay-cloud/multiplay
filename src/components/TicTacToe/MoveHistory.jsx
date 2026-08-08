import React from 'react';
import { History, Clock } from '../Icons';

export default function MoveHistory({ moves }) {
  if (!moves || moves.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-4 border border-slate-800 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
          <History className="w-3.5 h-3.5" />
          <span>Move Tracker</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">No moves made yet. Click on the 3x3 grid to start!</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span>Live Move History</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          {moves.length} {moves.length === 1 ? 'Move' : 'Moves'}
        </span>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
        {moves.slice().reverse().map((m, idx) => (
          <div
            key={m.step || idx}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono font-bold text-slate-400">
                #{m.step}
              </span>
              <span className={`font-black font-mono ${
                m.symbol === 'X' ? 'text-cyan-400' : 'text-rose-400'
              }`}>
                Player {m.symbol}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-300 font-semibold">
                [Row {m.row}, Col {m.col}]
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(m.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
