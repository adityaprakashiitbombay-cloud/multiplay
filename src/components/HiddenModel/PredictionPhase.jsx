import React, { useState } from 'react';
import { 
  BrainCircuit, 
  HelpCircle, 
  Sparkles, 
  CheckCircle, 
  Flame, 
  Eye, 
  Send, 
  ArrowRight,
  ShieldAlert,
  Users
} from '../Icons';
import SmartNameInput from './SmartNameInput';
import { soundManager } from '../../services/audio';

export default function PredictionPhase({ 
  players, 
  presetModels, 
  nameCandidates,
  onSubmitPredictions, 
  onTriggerReveal, 
  isHost, 
  currentUser 
}) {
  // Local state storing predictions: { guesserPlayerId: { targetPlayerId: 'Guessed Model' } }
  const [predictionsMap, setPredictionsMap] = useState({});
  const [submittedStatus, setSubmittedStatus] = useState({});

  const handlePredict = (guesserId, targetId, modelName) => {
    soundManager.playClick();
    setPredictionsMap(prev => ({
      ...prev,
      [guesserId]: {
        ...(prev[guesserId] || {}),
        [targetId]: modelName
      }
    }));
  };

  const handleCustomPredict = (guesserId, targetId, text) => {
    setPredictionsMap(prev => ({
      ...prev,
      [guesserId]: {
        ...(prev[guesserId] || {}),
        [targetId]: text
      }
    }));
  };

  const handleSubmitForPlayer = (guesserId) => {
    soundManager.playClick();
    const guesses = predictionsMap[guesserId] || {};
    onSubmitPredictions(guesserId, guesses);
    setSubmittedStatus(prev => ({ ...prev, [guesserId]: true }));
  };

  const submittedCount = Object.keys(submittedStatus).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300 mb-2">
              <span>Phase 2</span>
              <span>•</span>
              <span>Gameplay & Prediction Stage</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Predict Opponents' Hidden Person / Star
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Submit your predictions on which cricketer, footballer, or person each opponent secretly locked in!
            </p>
          </div>

          {/* Reveal Trigger Button */}
          <button
            type="button"
            id="btn-reveal-models"
            onClick={() => {
              soundManager.playClick();
              onTriggerReveal();
            }}
            className="group px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 text-white font-black text-sm tracking-wide shadow-glow-violet hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5"
          >
            <Sparkles className="w-5 h-5 text-cyan-300 animate-spin-slow" />
            <span>Reveal All Stars 🔮</span>
          </button>
        </div>

        {/* Prediction Progress Bar */}
        <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" />
            <span>Predictions submitted: <strong className="text-violet-300">{submittedCount} of {players.length} Players</strong></span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Optional predictions can be updated before clicking Reveal
          </span>
        </div>
      </div>

      {/* Grid of Players making predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {players.map((guesser) => {
          const isSubmitted = submittedStatus[guesser.id] || guesser.hasSubmittedPredictions;
          const currentGuesses = predictionsMap[guesser.id] || guesser.predictions || {};

          return (
            <div
              key={guesser.id}
              className={`rounded-3xl p-6 border transition-all duration-300 ${
                isSubmitted
                  ? 'bg-slate-900/90 border-cyan-500/40 shadow-glow-cyan'
                  : 'glass-panel border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                    {guesser.avatar || '🤖'}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">
                      {guesser.name}'s Predictions
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Secret Choice: <strong className="text-emerald-400">Locked 🔒</strong>
                    </span>
                  </div>
                </div>

                {isSubmitted && (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    <CheckCircle className="w-3 h-3" />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              {/* List of Other Players to predict */}
              <div className="space-y-4">
                {players
                  .filter(target => target.id !== guesser.id)
                  .map(target => {
                    const guessedModel = currentGuesses[target.id] || '';

                    return (
                      <div
                        key={target.id}
                        className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{target.avatar || '👾'}</span>
                            <span className="text-xs font-bold text-slate-200">
                              Guess for {target.name}:
                            </span>
                          </div>
                          {target.customReason && (
                            <span className="text-[10px] text-slate-400 italic truncate max-w-[140px]">
                              "{target.customReason}"
                            </span>
                          )}
                        </div>

                        {/* Quick Presets Selection Chips */}
                        <div className="flex flex-wrap gap-1">
                          {presetModels.slice(0, 8).map(model => (
                            <button
                              key={model}
                              type="button"
                              onClick={() => handlePredict(guesser.id, target.id, model)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                                guessedModel === model
                                  ? 'bg-cyan-400 text-slate-950 font-black shadow-glow-cyan scale-105'
                                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                              }`}
                            >
                              {model}
                            </button>
                          ))}
                        </div>

                        {/* Smart Name Input with Fuzzy Suggestions */}
                        <SmartNameInput
                          value={guessedModel}
                          onChange={(val) => handleCustomPredict(guesser.id, target.id, val)}
                          candidates={nameCandidates || presetModels}
                          placeholder="Type a name… typos are OK, we'll suggest! 🔍"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#00ff41]/50"
                        />
                      </div>
                    );
                  })}
              </div>

              {/* Submit / Lock Predictions Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => handleSubmitForPlayer(guesser.id)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitted ? 'Update Predictions' : 'Submit & Lock Predictions'}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
