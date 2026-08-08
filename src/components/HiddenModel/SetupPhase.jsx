import React, { useState } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Bot, 
  Flame,
  ArrowRight
} from '../Icons';
import SmartNameInput from './SmartNameInput';
import { soundManager } from '../../services/audio';

export default function SetupPhase({ 
  players, 
  presetModels, 
  nameCandidates,
  onLockInChoice, 
  onAddPlayer, 
  onRemovePlayer, 
  onUpdatePlayerCount,
  onProceedToPrediction,
  isHost,
  currentUser 
}) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedPresets, setSelectedPresets] = useState({}); // { playerId: 'Model' }
  const [customInputs, setCustomInputs] = useState({}); // { playerId: 'Custom Text' }
  const [customReasons, setCustomReasons] = useState({}); // { playerId: 'Reason' }
  const [revealedPreviewId, setRevealedPreviewId] = useState(null);

  const handleSelectPreset = (playerId, model) => {
    soundManager.playClick();
    setSelectedPresets(prev => ({ ...prev, [playerId]: model }));
    setCustomInputs(prev => ({ ...prev, [playerId]: '' }));
  };

  const handleCustomInput = (playerId, value) => {
    setCustomInputs(prev => ({ ...prev, [playerId]: value }));
    setSelectedPresets(prev => ({ ...prev, [playerId]: '' }));
  };

  const handleLockIn = (playerId) => {
    const chosenModel = (selectedPresets[playerId] || customInputs[playerId] || '').trim();
    if (!chosenModel) {
      alert('Please select or type a secret model name before locking in!');
      return;
    }
    soundManager.playLockIn();
    onLockInChoice(playerId, chosenModel, customReasons[playerId] || '');
  };

  const allLockedIn = players.length >= 2 && players.every(p => p.lockedIn);
  const lockedCount = players.filter(p => p.lockedIn).length;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Dynamic Player Configuration */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-bold text-violet-300 mb-2">
              <span>Phase 1</span>
              <span>•</span>
              <span>Setup & Secret Lock-In</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Configure Players & Lock In Secret Person
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Each player privately picks a cricketer, footballer, celebrity, or any person, then clicks <strong className="text-violet-400">"Lock In / Hide Choice"</strong>.
            </p>
          </div>

          {/* Locked In Status Pill */}
          <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-slate-800 shadow-inner">
            <div className="text-right">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Lock-In Progress</span>
              <span className="text-sm font-black text-violet-300 font-mono">
                {lockedCount} / {players.length} Locked 🔒
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Lock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Player Count Quick Selector & Add Player Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
          
          {/* Quick Count Stepper */}
          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-300">Total Players:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    onUpdatePlayerCount(num);
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-bold font-mono transition-all ${
                    players.length === num
                      ? 'bg-brand-violet text-white shadow-glow-violet scale-105'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Add Custom Player */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Add custom player name..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400 font-semibold"
            />
            <button
              type="button"
              onClick={() => {
                if (newPlayerName.trim()) {
                  soundManager.playClick();
                  onAddPlayer({ name: newPlayerName.trim(), avatar: '⚡' });
                  setNewPlayerName('');
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

        </div>

      </div>

      {/* Grid of Player Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {players.map((player, idx) => {
          const isSelf = player.socketId === currentUser?.id || !player.socketId;
          const currentVal = customInputs[player.id] || selectedPresets[player.id] || '';

          return (
            <div
              key={player.id || idx}
              className={`rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden ${
                player.lockedIn
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-glow-emerald'
                  : 'glass-panel border-slate-800 hover:border-violet-500/30'
              }`}
            >
              {/* Card Header: Avatar, Name, Delete Button */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                    {player.avatar || '🤖'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-100 text-base">
                        {player.name || `Player ${idx + 1}`}
                      </h3>
                      {player.lockedIn && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Locked In 🔒
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Player Slot #{idx + 1}
                    </span>
                  </div>
                </div>

                {players.length > 2 && !player.lockedIn && (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onRemovePlayer(player.id);
                    }}
                    title="Remove Player"
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* CARD STATE 1: MASKED PLACEHOLDER CARD (Locked In) */}
              {player.lockedIn ? (
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3 relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-emerald-300 text-sm tracking-wide">
                      {player.name}'s Choice Locked In 🔒
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Secret model is masked & securely hidden from all other players until the Reveal Phase.
                    </p>
                  </div>
                  
                  {/* Subtle peek toggle only for the player themselves */}
                  {isSelf && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setRevealedPreviewId(revealedPreviewId === player.id ? null : player.id)}
                        className="text-[11px] font-semibold text-slate-400 hover:text-emerald-300 inline-flex items-center gap-1.5 transition-colors"
                      >
                        {revealedPreviewId === player.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{revealedPreviewId === player.id ? `Secret: ${player.secretModel}` : 'Peek Your Secret (Private)'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* CARD STATE 2: ACTIVE SELECTION & PRIVATE INPUT FIELD */
                <div className="space-y-4">
                  
                  {/* Popular Preset Chips */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Popular Cricketers, Footballers & Icons (Click or type below)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {presetModels.slice(0, 10).map((model) => {
                        const isSelected = selectedPresets[player.id] === model;
                        return (
                          <button
                            key={model}
                            type="button"
                            onClick={() => handleSelectPreset(player.id, model)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-gradient-to-r from-brand-violet to-brand-cyan text-slate-950 font-bold shadow-glow-violet scale-105'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                            }`}
                          >
                            {model}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Name Input with Fuzzy Match Suggestions */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Or Type Any Person / Athlete / Character Name
                    </label>
                    <SmartNameInput
                      value={customInputs[player.id] || (selectedPresets[player.id] ? selectedPresets[player.id] : '')}
                      onChange={(val) => handleCustomInput(player.id, val)}
                      candidates={nameCandidates || presetModels}
                      placeholder="e.g. Virat Kohli, Ronaldo, MS Dhoni… typos OK!"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 font-semibold focus:outline-none focus:border-[#00ff41]/50 shadow-inner"
                    />
                  </div>

                  {/* Optional Custom Reason / Vibe */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Optional: Secret Vibe / Clue / Team
                    </label>
                    <input
                      type="text"
                      value={customReasons[player.id] || ''}
                      onChange={(e) => setCustomReasons(prev => ({ ...prev, [player.id]: e.target.value }))}
                      placeholder="e.g. 'King of Chase', 'Siuuu celebration', 'World Cup 2011 hero'"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-400"
                    />
                  </div>

                  {/* Lock In / Hide Choice Button */}
                  <button
                    type="button"
                    id={`btn-lock-${player.id}`}
                    onClick={() => handleLockIn(player.id)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-glow-violet hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                  >
                    <Lock className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
                    <span>Lock In / Hide Choice 🔒</span>
                  </button>

                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Bar: Proceed to Prediction */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">
              {allLockedIn ? 'Ready for Gameplay!' : 'Waiting for Players to Lock In'}
            </h4>
            <p className="text-[11px] text-slate-400">
              {allLockedIn 
                ? 'All secret models are locked in and masked. Transition to the prediction stage!' 
                : `${lockedCount} of ${players.length} players locked in.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-proceed-prediction"
          onClick={() => {
            soundManager.playClick();
            onProceedToPrediction();
          }}
          disabled={!allLockedIn}
          className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all ${
            allLockedIn
              ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 shadow-glow-cyan hover:scale-105'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <span>Proceed to Predictions (Phase 2)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
