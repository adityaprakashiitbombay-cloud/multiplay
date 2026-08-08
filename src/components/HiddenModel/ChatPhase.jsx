/**
 * ChatPhase.jsx
 * Phase 2 of the Hidden Star game: a retro synthwave chat room where players
 * drop clues/banter before the answer (guessing) phase.
 */
import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../../services/audio';

const AVATARS = ['😎', '🔥', '👑', '🎯', '🏆', '⚡', '🌟', '💎'];

export default function ChatPhase({
  players,
  room,
  currentUser,
  onSendChat,
  onStartGuessing,   // moves to prediction phase
  isHost,
}) {
  const [message, setMessage] = useState('');
  const [localMessages, setLocalMessages] = useState([
    {
      id: 'init',
      sender: '🎮 Arcade Host',
      text: 'All players have locked in their secret star! 🔒 Chat below, drop clues, or keep it a mystery… then click "START GUESSING" when ready!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    }
  ]);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Merge server room chat with local messages
  const roomMessages = room?.chat || [];
  const allMessages = room
    ? roomMessages.slice(-40)
    : localMessages;

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    soundManager.playClick();

    if (room) {
      onSendChat(text);
    } else {
      setLocalMessages(prev => [...prev, {
        id: `m-${Date.now()}`,
        sender: currentUser?.name || 'You',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: currentUser?.avatar,
      }]);
    }
    setMessage('');
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* Retro Phase badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 glass-panel rounded-3xl p-5 sm:p-6 border-2 border-[#00ff41]/40 shadow-glow-green">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff41]/20 border border-[#00ff41]/50 text-[10px] font-pixel text-[#00ff41] mb-2 shadow-glow-green">
            <span>PHASE 2</span>
            <span>•</span>
            <span>🔥 RETRO CHAT ROOM</span>
          </div>
          <h2 className="text-2xl font-arcade font-black text-slate-100 text-glow-green">
            ALL STARS LOCKED IN 🔒
          </h2>
          <p className="text-xs font-cyber text-slate-300 mt-1">
            Chat with opponents, drop hints or mind-games, then start guessing when ready!
          </p>
        </div>

        {/* Players locked in pills */}
        <div className="flex flex-wrap gap-2">
          {players.map(p => (
            <div
              key={p.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-[#00ff41]/40 text-xs font-arcade font-semibold text-slate-200 shadow-glow-green"
            >
              <span>{p.avatar || '👾'}</span>
              <span>{p.name}</span>
              <span className="text-[#00ff41] text-[10px] font-black">🔒</span>
            </div>
          ))}
        </div>
      </div>

      {/* Retro Chat window */}
      <div className="glass-panel rounded-3xl border-2 border-[#00ff41]/30 overflow-hidden flex flex-col shadow-2xl"
           style={{ minHeight: '380px', maxHeight: '520px' }}>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
          {allMessages.map((msg, i) => {
            const isMe = msg.sender === (currentUser?.name || 'You') ||
                         msg.sender === currentUser?.name;
            const isSystem = msg.isSystem ||
                             msg.sender?.includes('System') ||
                             msg.sender?.includes('Host') ||
                             msg.sender?.includes('🔮') ||
                             msg.sender?.includes('Referee');

            if (isSystem) {
              return (
                <div key={msg.id || i} className="text-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#00ff41]/10 border border-[#00ff41]/30 text-[11px] font-pixel text-[#00ff41] shadow-glow-green">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id || i}
                className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar bubble */}
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-[#00ff41]/40 flex items-center justify-center text-base flex-shrink-0 shadow-glow-green">
                  {msg.avatar || AVATARS[msg.sender?.charCodeAt(0) % AVATARS.length] || '👤'}
                </div>

                <div className={`max-w-[72%] space-y-0.5 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <span className={`text-[10px] text-slate-400 font-cyber font-bold ${isMe ? 'text-right' : 'text-left'}`}>
                    {isMe ? 'You' : msg.sender}
                  </span>
                  <div className={`px-3.5 py-2 rounded-2xl text-sm font-medium leading-relaxed ${
                    isMe
                      ? 'bg-[#00ff41]/20 border border-[#00ff41]/50 text-slate-100 rounded-br-sm shadow-glow-green'
                      : 'bg-slate-900 border border-slate-700/80 text-slate-200 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">{msg.time}</span>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-[#00ff41]/20 p-3 bg-slate-950/80">
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Drop a clue, banter, or stay silent… 😏"
              maxLength={200}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00ff41] focus:shadow-glow-green font-cyber transition-all"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!message.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00ff41] to-[#10f543] text-slate-950 font-arcade font-bold text-sm shadow-glow-green hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              SEND ↑
            </button>
          </div>
        </div>
      </div>

      {/* Quick reaction emojis */}
      <div className="flex flex-wrap gap-2 justify-center">
        {['🏏', '⚽', '👑', '🤫', '😏', '🔥', '💀', '👀', '🤣', '🫡'].map(emoji => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              soundManager.playClick();
              const text = emoji;
              if (room) onSendChat(text);
              else setLocalMessages(prev => [...prev, {
                id: `m-${Date.now()}`,
                sender: currentUser?.name || 'You',
                text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                avatar: currentUser?.avatar,
              }]);
            }}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-[#00ff41] text-xl transition-all hover:scale-110 shadow-sm hover:shadow-glow-green"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Start Guessing CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onStartGuessing();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00ff41] via-[#10f543] to-[#06b6d4] text-slate-950 font-arcade font-black text-base tracking-wide shadow-glow-green hover:shadow-[0_0_50px_rgba(0,255,65,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all border-2 border-white"
        >
          🎯 EVERYONE READY? START GUESSING →
        </button>
        <p className="text-center text-[11px] font-pixel text-slate-400 mt-2">
          ONCE CLICKED, PREDICTION PHASE BEGINS FOR ALL PLAYERS
        </p>
      </div>

    </div>
  );
}
