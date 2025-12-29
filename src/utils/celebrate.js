// src/utils/celebrate.js
import confetti from 'canvas-confetti';

export const triggerCelebration = () => {
  // 1. Get current theme from body class
  const currentTheme = document.body.className;

  // 2. Define colors based on theme
  let colors = ['#2563eb', '#06b6d4']; // Default (Water/Blue)
  let shapes = ['circle', 'square'];

  if (currentTheme.includes('theme-lotr')) {
    colors = ['#d4af37', '#2f5e41', '#ffffff']; // Gold, Green, White
    shapes = ['star']; // Like the ring or stars
  } else if (currentTheme.includes('theme-christmas')) {
    colors = ['#dc2626', '#166534', '#ffffff']; // Red, Green, White
    shapes = ['circle']; // Like snow/ornaments
  } else if (currentTheme.includes('theme-halloween')) {
    colors = ['#ea580c', '#4c1d95', '#000000']; // Orange, Purple, Black
  }

  // 3. Fire the confetti (Standard "Burst" effect)
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: colors,
    shapes: shapes
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
};