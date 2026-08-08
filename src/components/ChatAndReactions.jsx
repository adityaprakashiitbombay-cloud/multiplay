import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Flame, 
  Sparkles, 
  Smile, 
  X, 
  Zap, 
  ChevronUp, 
  ChevronDown 
} from './Icons';
import { soundManager } from '../services/audio';

const EMOJI_REACTIONS = ['🔥', '⚡', '🧠', '🎯', '👏', '😱', '🏆', '💀', '🤖', '🎉'];

export default function ChatAndReactions({ 
  room, 
  onSendReaction, 
  onSendChat, 
  currentUser 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [floatingParticles, setFloatingParticles] = useState([]);
  const chatBottomRef = useRef(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [room?.chat, isOpen]);

  // Handle incoming reaction particle
  const spawnReaction = (emoji, xPercent = null) => {
    soundManager.playReaction();
    const id = `${Date.now()}-${Math.random()}`;
    const x = xPercent ?? (15 + Math.random() * 70);
    
    setFloatingParticles(prev => [...prev, { id, emoji, x }]);

    setTimeout(() => {
      setFloatingParticles(prev => prev.filter(p => p.id !== id));
    }, 2200);
  };

  const handleSendEmoji = (emoji) => {
    spawnReaction(emoji);
    if (onSendReaction) {
      onSendReaction(emoji);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    soundManager.playClick();
    onSendChat(chatInput.trim(), currentUser?.name || 'Player');
    setChatInput('');
  };

  return (
    <>
      {/* Floating Animated Reaction Particles across screen */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingParticles.map((particle) => (
          <div
            key={particle.id}
            style={{ left: `${particle.x}%`, bottom: '80px' }}
            className="absolute text-3xl sm:text-4xl animate-reaction-float select-none drop-shadow-lg"
          >
            {particle.emoji}
          </div>
        ))}
      </div>

      {/* Floating Reactions Toolbar & Chat Trigger (Bottom Center / Right) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-1.5 rounded-2xl glass-card border border-slate-700/80 shadow-2xl backdrop-blur-xl">
        
        {/* Quick Emoji Buttons */}
        <div className="flex items-center gap-1">
          {EMOJI_REACTIONS.slice(0, 5).map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSendEmoji(emoji)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-lg sm:text-xl hover:scale-125 active:scale-95 transition-transform bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50"
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-slate-700 mx-1" />

        {/* Chat Toggle Button */}
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            setIsOpen(!isOpen);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isOpen
              ? 'bg-brand-violet text-white shadow-glow-violet'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat</span>
          {room?.chat?.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] flex items-center justify-center font-bold">
              {room.chat.length}
            </span>
          )}
        </button>
      </div>

      {/* Slide-out Live Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[90vw] max-w-sm h-96 glass-panel rounded-3xl border border-slate-700 shadow-2xl z-40 flex flex-col overflow-hidden animate-countdown">
          
          {/* Chat Header */}
          <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-slate-200">Room Live Chat & System Logs</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
            {(room?.chat || []).map((msg) => (
              <div
                key={msg.id}
                className={`p-2.5 rounded-2xl ${
                  msg.sender.includes('System') || msg.sender.includes('Referee') || msg.sender.includes('Host')
                    ? 'bg-violet-950/30 border border-violet-500/20 text-violet-300'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[11px] text-cyan-300 font-mono">
                    {msg.sender}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {msg.time}
                  </span>
                </div>
                <p className="leading-relaxed text-slate-300 break-words">{msg.text}</p>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Field */}
          <form onSubmit={handleChatSubmit} className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send message to room..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan text-slate-950 font-bold hover:scale-105 transition-transform"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
