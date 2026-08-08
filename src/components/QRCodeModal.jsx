import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Copy, Check, Share2 } from './Icons';
import { soundManager } from '../services/audio';

export default function QRCodeModal({ isOpen, onClose, roomId, onCopyLink, copied }) {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (isOpen && roomId) {
      const shareUrl = `${window.location.origin}?room=${roomId}`;
      QRCode.toDataURL(shareUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then(url => setQrUrl(url))
        .catch(err => console.error('QR code generation error:', err));
    }
  }, [isOpen, roomId]);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}?room=${roomId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-countdown">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-700 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Scan to Join Room</h3>
              <p className="text-[11px] text-slate-400 font-mono">Room: {roomId}</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Image Box */}
        <div className="p-4 rounded-2xl bg-white flex items-center justify-center shadow-2xl">
          {qrUrl ? (
            <img src={qrUrl} alt={`QR Code for Room ${roomId}`} className="rounded-lg w-52 h-52" />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-slate-500 text-xs">
              Generating QR Code...
            </div>
          )}
        </div>

        {/* Share Link & Copy Action */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-xs text-slate-300 font-mono focus:outline-none truncate"
            />
            <button
              onClick={() => {
                soundManager.playClick();
                onCopyLink();
              }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-violet to-brand-cyan text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:opacity-90"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            Friends on mobile can point their camera to join instantly with no download required!
          </p>
        </div>

      </div>
    </div>
  );
}
