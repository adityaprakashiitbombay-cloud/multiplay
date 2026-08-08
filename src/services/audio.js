// Web Audio API Synthesizer for instant game sounds without external audio files

class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
    this.romanceAudio = null;
    this._romanceLoaded = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Pre-load romance.mp3 from the public folder
    if (!this._romanceLoaded && typeof window !== 'undefined') {
      this._romanceLoaded = true;
      try {
        this.romanceAudio = new Audio('/romance.mp3');
        this.romanceAudio.preload = 'auto';
        this.romanceAudio.volume = 0.75;
        // silence any loading errors (file might not exist in older dist)
        this.romanceAudio.onerror = () => { this.romanceAudio = null; };
      } catch (e) {
        this.romanceAudio = null;
      }
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // 🎵 Play the romance win song
  playWinSong() {
    this.init();
    try {
      if (this.romanceAudio) {
        this.romanceAudio.currentTime = 0;
        const playPromise = this.romanceAudio.play();
        if (playPromise) playPromise.catch(() => {});
        // Auto stop after 12 seconds
        setTimeout(() => {
          if (this.romanceAudio) {
            this.romanceAudio.pause();
            this.romanceAudio.currentTime = 0;
          }
        }, 12000);
      }
    } catch (e) {
      console.warn('Win song error:', e);
    }
  }

  stopWinSong() {
    if (this.romanceAudio) {
      this.romanceAudio.pause();
      this.romanceAudio.currentTime = 0;
    }
  }

  // Subtle UI Click / Select
  playClick() {
    if (!this.enabled) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Move played (X or O)
  playMove(isX = true) {
    if (!this.enabled) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = isX ? 'triangle' : 'sine';
      const startFreq = isX ? 440 : 587.33; // A4 or D5
      const endFreq = isX ? 659.25 : 880;   // E5 or A5

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.12);

      gain.gain.setValueAtTime(this.volume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Model Lock-In Thud / Confirmation
  playLockIn() {
    if (!this.enabled) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      
      // Low impact synth
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(160, now);
      osc1.frequency.exponentialRampToValueAtTime(60, now + 0.25);
      gain1.gain.setValueAtTime(this.volume * 0.8, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // High lock shimmer
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.22);
      gain2.gain.setValueAtTime(this.volume * 0.5, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.25);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Countdown Beep (3, 2, 1)
  playCountdownTick(num) {
    if (!this.enabled) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      const freq = num === 1 ? 880 : num === 2 ? 740 : 660;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(this.volume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Dramatic Reveal Fanfare
  playRevealFanfare() {
    if (!this.enabled) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.09;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(this.volume * 0.6, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Victory Fanfare / Confetti Celebration
  playVictory() {
    if (!this.enabled) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const chords = [
        [523.25, 659.25, 783.99], // C Major
        [587.33, 739.99, 880.00], // D Major
        [659.25, 830.61, 987.77], // E Major
        [783.99, 987.77, 1174.66, 1567.98] // Final G+C high
      ];

      chords.forEach((chord, step) => {
        const chordTime = now + step * 0.14;
        chord.forEach(freq => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, chordTime);

          const duration = step === chords.length - 1 ? 0.8 : 0.2;
          gain.gain.setValueAtTime(this.volume * 0.35, chordTime);
          gain.gain.exponentialRampToValueAtTime(0.001, chordTime + duration);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(chordTime);
          osc.stop(chordTime + duration);
        });
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Reaction sound
  playReaction() {
    if (!this.enabled) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.12);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }
}

export const soundManager = new SoundManager();
