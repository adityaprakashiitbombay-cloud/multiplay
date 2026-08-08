import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from './Icons';

export default function NotificationToast({ toast }) {
  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 animate-countdown pointer-events-none">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl glass-card border border-cyan-500/40 shadow-glow-cyan text-slate-100 text-xs font-semibold backdrop-blur-xl">
        <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
