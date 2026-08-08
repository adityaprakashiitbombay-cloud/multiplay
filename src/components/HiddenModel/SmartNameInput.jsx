/**
 * SmartNameInput.jsx
 * An input that shows fuzzy-match suggestions as a dropdown.
 * If the user types "virat kohlli" it suggests "Virat Kohli → Did you mean this?"
 */
import { useState, useEffect, useRef } from 'react';
import { getTopMatches } from '../../utils/fuzzyMatch';

export default function SmartNameInput({
  value,
  onChange,
  placeholder = 'e.g. Virat Kohli, Ronaldo, MS Dhoni...',
  candidates = [],      // known names to match against
  className = '',
  onConfirm,            // called when user picks a suggestion or presses Enter
  inputId,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Compute suggestions debounced
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!value || value.length < 2) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const matches = getTopMatches(value, candidates, 5, 0.42);
      // Filter out exact matches (no need to suggest)
      const filtered = matches.filter(
        m => m.name.toLowerCase() !== value.toLowerCase().trim()
      );
      setSuggestions(filtered);
      setShowDrop(filtered.length > 0);
      setActiveSuggestion(-1);
    }, 280);
  }, [value, candidates]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = (name) => {
    onChange(name);
    setSuggestions([]);
    setShowDrop(false);
    onConfirm?.(name);
  };

  const handleKeyDown = (e) => {
    if (!showDrop || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      pick(suggestions[activeSuggestion].name);
    } else if (e.key === 'Escape') {
      setShowDrop(false);
    }
  };

  // Confidence badge color
  const confidenceColor = (score) => {
    if (score >= 0.85) return 'text-[#00ff41]';
    if (score >= 0.65) return 'text-amber-400';
    return 'text-slate-400';
  };

  const confidenceLabel = (score) => {
    if (score >= 0.85) return 'Best match';
    if (score >= 0.65) return 'Possible match';
    return 'Weak match';
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setShowDrop(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {/* Suggestion dropdown */}
      {showDrop && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-2xl border border-[#00ff41]/25 bg-[#080d14]/98 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,255,65,0.15)] overflow-hidden">
          {/* Header hint */}
          <div className="px-3 py-1.5 border-b border-slate-800/80 flex items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500">
              🔍 Did you mean?
            </span>
          </div>

          {suggestions.map((s, i) => (
            <button
              key={s.name}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); pick(s.name); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all ${
                i === activeSuggestion
                  ? 'bg-[#00ff41]/10 border-l-2 border-[#00ff41]'
                  : 'hover:bg-slate-800/60 border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">
                  {getSportEmoji(s.name)}
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-100">{s.name}</div>
                  <div className={`text-[9px] font-semibold uppercase tracking-wider ${confidenceColor(s.score)}`}>
                    {confidenceLabel(s.score)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#00ff41]"
                    style={{ width: `${Math.round(s.score * 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-500 font-mono">{Math.round(s.score * 100)}%</span>
              </div>
            </button>
          ))}

          <div className="px-3 py-1.5 border-t border-slate-800/80">
            <span className="text-[9px] text-slate-600 font-mono">
              ↑↓ navigate · Enter select · Esc dismiss
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple sport/person emoji guesser based on known names
function getSportEmoji(name) {
  const n = name.toLowerCase();
  const cricketers = ['kohli', 'dhoni', 'tendulkar', 'sharma', 'bumrah', 'de villiers', 'babar', 'kumara'];
  const footballers = ['ronaldo', 'messi', 'mbappé', 'mbappe', 'haaland', 'neymar', 'salah', 'benzema'];
  if (cricketers.some(k => n.includes(k))) return '🏏';
  if (footballers.some(k => n.includes(k))) return '⚽';
  return '🌟';
}
