import React, { useState } from 'react';
import { 
  Sparkles, 
  Gamepad2, 
  ArrowRight, 
  Users, 
  Bot, 
  ShieldCheck, 
  Grid3X3, 
  BrainCircuit, 
  Zap, 
  EyeOff, 
  Trophy,
  Play
} from './Icons';
import { soundManager } from '../services/audio';

const AVATARS = ['👾', '🤖', '⚡', '🧠', '🔮', '🚀', '🎯', '💎', '🐉', '🐱', '🦊', '👑'];

export default function Lobby({ onCreateRoom, onJoinRoom, onStartInstantSolo, isLoading }) {
  const [name, setName] = useState(() => localStorage.getItem('multiplay_name') || 'CyberGamer');
  const [selectedAvatar, setSelectedAvatar] = useState('👾');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a player name');
      return;
    }
    soundManager.playClick();
    localStorage.setItem('multiplay_name', name.trim());
    onCreateRoom({ name: name.trim(), avatar: selectedAvatar });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a player name');
      return;
    }
    if (!joinCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    soundManager.playClick();
    localStorage.setItem('multiplay_name', name.trim());
    onJoinRoom(joinCode.trim().toUpperCase(), { name: name.trim(), avatar: selectedAvatar });
  };

  const handleSolo = () => {
    soundManager.playClick();
    onStartInstantSolo({ name: name.trim() || 'Solo Challenger', avatar: selectedAvatar });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#080d1a] border border-[#00ff66]/30 text-xs font-cyber font-bold text-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.15)] animate-float">
          <Sparkles className="w-4 h-4 text-[#00ff66]" />
          <span>Real-Time WebSockets • Synchronized State • Zero Latency</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-arcade font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#00ff66] via-[#00f0ff] to-[#ff00a0] drop-shadow-[0_0_35px_rgba(0,255,102,0.3)]">
          Live Multiplayer Hub
        </h1>
        <p className="text-slate-300 font-cyber max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Play real-time <strong className="text-[#00f0ff] text-glow-cyan font-bold">Tic Tac Toe</strong> with friends across devices, or face off in the secret <strong className="text-[#ff00a0] text-glow-magenta font-bold">Hidden Star Guessing Game</strong> for cricketers & footballers!
        </p>
      </div>

      {/* Main Setup Card: Avatar & Name Selection */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#00ff66]/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff00a0]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Gamer Avatar Selector */}
          <div>
            <label className="block text-xs font-cyber font-bold uppercase tracking-wider text-slate-300 mb-3">
              Choose Gamer Avatar
            </label>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedAvatar(av);
                  }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                    selectedAvatar === av
                      ? 'bg-gradient-to-tr from-[#00ff66] to-[#00f0ff] scale-110 shadow-[0_0_20px_rgba(0,255,102,0.5)] ring-2 ring-white'
                      : 'bg-[#080d1a] hover:bg-[#0e1628] text-slate-200 border border-slate-800 hover:scale-105'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Nickname Input */}
          <div>
            <label className="block text-xs font-cyber font-bold uppercase tracking-wider text-slate-300 mb-2">
              Player Nickname
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. CyberValkyrie, NeoGamer"
              maxLength={20}
              className="w-full px-4 py-3.5 rounded-2xl bg-[#080d1a] border border-slate-700 text-slate-100 placeholder-slate-500 font-cyber font-bold focus:outline-none focus:border-[#00ff66] focus:shadow-[0_0_20px_rgba(0,255,102,0.25)] transition-all shadow-inner"
            />
          </div>

          {error && (
            <p className="text-xs font-cyber font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3.5 py-2.5 rounded-xl">
              {error}
            </p>
          )}

          {/* Action Grid: Create Room vs Join Room */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Create Room Button */}
            <button
              onClick={handleCreate}
              disabled={isLoading}
              className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-r from-[#00ff66] via-[#00f0ff] to-blue-600 text-slate-950 font-arcade font-extrabold shadow-[0_0_30px_rgba(0,255,102,0.35)] hover:shadow-[0_0_50px_rgba(0,255,102,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 border border-white/40"
            >
              <div className="flex items-center gap-2 text-lg sm:text-xl text-slate-950">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
                <span>Create Live Room</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs font-sans text-slate-950/80 font-bold mt-1">
                Generates a live room code to share with friends
              </p>
            </button>

            {/* Join Room Box */}
            <div className="flex flex-col gap-2 p-5 rounded-2xl bg-[#080d1a] border border-slate-800 shadow-inner">
              <span className="text-xs font-cyber font-bold text-slate-300 uppercase tracking-wider">
                Or Join Existing Room
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="e.g. NEON-42"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#050811] border border-slate-700 text-slate-100 placeholder-slate-600 font-mono font-bold uppercase tracking-wider text-sm focus:outline-none focus:border-[#ff00a0]"
                />
                <button
                  onClick={handleJoin}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff00a0] to-[#8b5cf6] text-white font-arcade font-bold text-sm shadow-[0_0_20px_rgba(255,0,160,0.35)] hover:scale-105 transition-all disabled:opacity-50 border border-white/20"
                >
                  Join
                </button>
              </div>
            </div>

          </div>

          {/* Instant Solo / Sandbox Mode */}
          <div className="pt-2 text-center border-t border-slate-800/80">
            <button
              onClick={handleSolo}
              className="inline-flex items-center gap-2 text-xs font-cyber font-bold text-slate-400 hover:text-[#00ff66] transition-colors py-2 px-4 rounded-xl hover:bg-[#080d1a]"
            >
              <Play className="w-3.5 h-3.5 text-[#00ff66]" />
              <span>Quick Test: Launch in Instant Local Sandbox Mode (Solo vs AI / Pass & Play)</span>
            </button>
          </div>

        </div>
      </div>

      {/* Feature Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Game 1 Card */}
        <div className="glass-card rounded-2xl p-6 border border-[#00f0ff]/20 space-y-3 relative overflow-hidden group hover:border-[#00f0ff]/50 transition-all hover:shadow-[0_0_25px_rgba(0,240,255,0.2)]">
          <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff]">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-arcade font-bold text-slate-100 flex items-center gap-2">
            Game 1: Live Tic Tac Toe
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Real-time multiplayer synchronization across devices. Features live move tracking, strike-through winning lines, turn indicators, smart AI fallback, and full-page celebrations.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] font-cyber font-bold px-2.5 py-1 rounded-lg bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20">3x3 Neon Grid</span>
            <span className="text-[10px] font-cyber font-bold px-2.5 py-1 rounded-lg bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20">Auto-Reset Draw</span>
            <span className="text-[10px] font-cyber font-bold px-2.5 py-1 rounded-lg bg-[#ff00a0]/10 text-[#ff00a0] border border-[#ff00a0]/20">Score Tracker</span>
          </div>
        </div>

        {/* Game 2 Card */}
        <div className="glass-card rounded-2xl p-6 border border-[#ff00a0]/20 space-y-3 relative overflow-hidden group hover:border-[#ff00a0]/50 transition-all hover:shadow-[0_0_25px_rgba(255,0,160,0.2)]">
          <div className="w-10 h-10 rounded-xl bg-[#ff00a0]/10 border border-[#ff00a0]/30 flex items-center justify-center text-[#ff00a0]">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-arcade font-bold text-slate-100 flex items-center gap-2">
            Game 2: Hidden Star Guessing
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            4-Phase social party game: 1) Secret lock-in for 400+ cricketers & stars with smart fuzzy input, 2) Interactive Chat Room, 3) Guessing, 4) 3D Card Flip reveal!
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] font-cyber font-bold px-2.5 py-1 rounded-lg bg-[#ff00a0]/10 text-[#ff00a0] border border-[#ff00a0]/20">400+ IPL Stars</span>
            <span className="text-[10px] font-cyber font-bold px-2.5 py-1 rounded-lg bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20">Chat Room</span>
            <span className="text-[10px] font-cyber font-bold px-2.5 py-1 rounded-lg bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20">3D Card Flip</span>
          </div>
        </div>

      </div>

      {/* adityahere Footer Attribution */}
      <div className="mt-12 text-center space-y-2 pb-4">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-cyber">
          <span className="w-12 h-px bg-[#00ff66]/20"></span>
          <span>Designed &amp; Built by</span>
          <span className="w-12 h-px bg-[#00ff66]/20"></span>
        </div>
        <a
          href="https://adityahere.netlify.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 group px-4 py-2 rounded-2xl bg-[#080d1a] border border-[#00ff66]/30 shadow-[0_0_20px_rgba(0,255,102,0.15)] hover:border-[#00ff66]/60 hover:scale-105 transition-all"
        >
          <span className="text-2xl font-arcade font-extrabold text-white group-hover:text-[#00ff66] transition-colors">
            aditya
          </span>
          <span className="text-2xl font-arcade font-extrabold text-[#00ff66] text-glow-lime">
            here
          </span>
          <span className="text-2xl font-arcade font-extrabold text-[#00ff66] text-glow-lime">
            .
          </span>
          <span className="text-xs font-cyber font-bold text-[#00ff66] uppercase tracking-widest ml-1">
            ↗ adityahere.netlify.app
          </span>
        </a>
      </div>

    </div>
  );
}
