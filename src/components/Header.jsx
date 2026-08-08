import React, { useState } from 'react';
import { 
  Gamepad2, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Users, 
  Sparkles, 
  Share2, 
  QrCode, 
  LogOut, 
  Flame, 
  BrainCircuit, 
  Grid3X3 
} from './Icons';
import { soundManager } from '../services/audio';

export default function Header({ 
  room, 
  activeGame, 
  onSwitchGame, 
  onLeaveRoom, 
  onOpenQR, 
  soundEnabled, 
  onToggleSound, 
  onCopyInvite, 
  copied 
}) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#050811]/90 border-b border-[#00ff66]/20 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo & adityahere link */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer flex items-center gap-3">
            {/* Green neon arcade icon */}
            <div className="w-10 h-10 rounded-2xl bg-[#080d1a] border border-[#00ff66]/40 shadow-[0_0_15px_rgba(0,255,102,0.25)] flex items-center justify-center group-hover:scale-105 group-hover:border-[#00ff66] transition-all">
              <Gamepad2 className="w-5 h-5 text-[#00ff66] group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {/* Modern Arcade App Name */}
                <span className="font-arcade font-bold tracking-wider text-white text-lg sm:text-xl text-glow-lime">
                  MULTI<span className="text-[#00ff66]">PLAY</span>
                </span>
                <span className="text-[10px] font-cyber font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/30 animate-pulse">
                  LIVE
                </span>
              </div>
              {/* adityahere attribution link */}
              <a
                href="https://adityahere.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-cyber font-bold hidden sm:flex items-center gap-1 group/link"
                onClick={e => e.stopPropagation()}
              >
                <span className="text-slate-400">by</span>
                <span className="text-white font-extrabold hover:text-[#00ff66] transition-colors">aditya</span><span className="text-[#00ff66] font-extrabold text-glow-lime">here</span>
                <span className="text-[#00ff66] font-bold text-glow-lime">.</span>
                <span className="text-[9px] text-[#00ff66] group-hover/link:translate-x-0.5 transition-transform">↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Game Switcher Tabs */}
        {room && (
          <div className="hidden md:flex items-center bg-[#080d1a] p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button
              id="tab-tictactoe"
              onClick={() => {
                soundManager.playClick();
                onSwitchGame('tictactoe');
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-cyber font-bold transition-all ${
                activeGame === 'tictactoe'
                  ? 'bg-gradient-to-r from-[#00f0ff] to-blue-600 text-slate-950 font-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              Tic Tac Toe
            </button>

            <button
              id="tab-hiddenmodel"
              onClick={() => {
                soundManager.playClick();
                onSwitchGame('hidden-model');
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-cyber font-bold transition-all ${
                activeGame === 'hidden-model'
                  ? 'bg-gradient-to-r from-[#ff00a0] to-[#8b5cf6] text-white font-black shadow-[0_0_15px_rgba(255,0,160,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              Hidden Star Guessing
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mute/Unmute */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            className="p-2.5 rounded-xl bg-[#080d1a] border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white transition-all hover:scale-105"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00ff66]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {room && (
            <>
              {/* Room Code Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#080d1a] border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-ping" />
                <span className="text-xs font-mono font-bold text-slate-300">
                  {room.id}
                </span>
                <span className="text-[10px] text-slate-500 font-cyber">({room.connectedUsers?.length || 1} online)</span>
              </div>

              {/* Share Invite */}
              <button
                onClick={onCopyInvite}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00ff66]/15 hover:bg-[#00ff66]/25 border border-[#00ff66]/30 text-[#00ff66] font-cyber font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,255,102,0.15)]"
              >
                {copied ? <Check className="w-4 h-4 text-[#00ff66]" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Invite'}</span>
              </button>

              {/* QR Modal */}
              <button
                onClick={onOpenQR}
                title="Show QR Code"
                className="p-2.5 rounded-xl bg-[#080d1a] border border-slate-800 hover:border-[#00ff66]/40 text-slate-300 hover:text-[#00ff66] transition-all"
              >
                <QrCode className="w-4 h-4" />
              </button>

              {/* Leave Room */}
              <button
                onClick={onLeaveRoom}
                title="Leave Room"
                className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-all hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
