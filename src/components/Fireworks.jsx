/**
 * Fireworks.jsx – Full-screen multi-stage celebration using canvas-confetti.
 * Spans the ENTIRE page (100vw x 100vh) with golden sparkles, fireworks rockets,
 * star bursts, and side cannons — no rectangular boxing or clipping!
 */
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function Fireworks({ active }) {
  useEffect(() => {
    if (!active) return;

    // 1. Initial Massive Center Explosion with Golden Stars & Multi-color Sparkles
    confetti({
      particleCount: 140,
      spread: 120,
      origin: { x: 0.5, y: 0.55 },
      ticks: 350,
      gravity: 0.7,
      decay: 0.93,
      startVelocity: 50,
      colors: ['#00ff41', '#ffd700', '#ffb700', '#06b6d4', '#8b5cf6', '#ffffff', '#e879f9'],
      shapes: ['star', 'circle'],
      scalar: 1.2,
    });

    // 2. Left Side Golden Sparkle Cannon
    const t1 = setTimeout(() => {
      confetti({
        particleCount: 90,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.65 },
        ticks: 300,
        gravity: 0.8,
        colors: ['#ffd700', '#ffb700', '#00ff41', '#06b6d4', '#ffffff'],
        shapes: ['star', 'circle'],
        scalar: 1.1,
      });
    }, 300);

    // 3. Right Side Purple & Emerald Sparkle Cannon
    const t2 = setTimeout(() => {
      confetti({
        particleCount: 90,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.65 },
        ticks: 300,
        gravity: 0.8,
        colors: ['#8b5cf6', '#d946ef', '#00ff41', '#ffd700', '#ffffff'],
        shapes: ['star', 'circle'],
        scalar: 1.1,
      });
    }, 600);

    // 4. Continuous Sky Rockets across the full page for 6 seconds
    const duration = 6500;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      // Random position anywhere across the width (0.1 to 0.9)
      const randomX = 0.1 + Math.random() * 0.8;
      const randomY = 0.15 + Math.random() * 0.45;

      confetti({
        particleCount: Math.floor(35 + Math.random() * 30),
        startVelocity: 35,
        spread: 360,
        ticks: 220,
        origin: { x: randomX, y: randomY },
        colors: ['#00ff41', '#ffd700', '#ffb700', '#06b6d4', '#a855f7', '#ec4899', '#ffffff'],
        shapes: ['star', 'circle'],
        scalar: Math.random() > 0.5 ? 1.2 : 0.9,
      });
    }, 450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(interval);
    };
  }, [active]);

  return null; // canvas-confetti renders directly on document.body full-screen canvas
}
