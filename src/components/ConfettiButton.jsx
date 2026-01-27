import React, { useState } from 'react';
import confetti from 'canvas-confetti';

const triggerCelebration = () => {
  const currentTheme = document.body.className;
  let colors = ['#2563eb', '#06b6d4']; 
  let shapes = ['circle', 'square'];

  if (currentTheme.includes('lotr')) {
    colors = ['#d4af37', '#2f5e41', '#ffffff']; 
    shapes = ['star'];
  } else if (currentTheme.includes('christmas')) {
    colors = ['#dc2626', '#166534', '#ffffff'];
  } else if (currentTheme.includes('halloween')) {
    colors = ['#ea580c', '#4c1d95'];
  }

  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors,
    shapes: shapes
  });
};

const ConfettiButton = ({ onClick, className, children, style }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const handleClick = (e) => {
    e.stopPropagation();
    setIsAnimating(true);
    triggerCelebration();
    if (onClick) onClick(e);
    setTimeout(() => setIsAnimating(false), 500);
  };
  return (
    <button 
      onClick={handleClick} 
      className={`${className} ${isAnimating ? 'animate-success' : ''}`}
      style={style}
    >
      {children}
    </button>
  );
};

export default ConfettiButton;