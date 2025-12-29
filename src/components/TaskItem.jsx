// src/components/TaskItem.jsx
import React, { useState } from 'react';
import { triggerCelebration } from '../utils/celebrate'; 

export default function TaskItem({ taskName, dueDate, isOverdue, onComplete }) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    // 1. Trigger the visual celebration (Confetti)
    triggerCelebration();

    // 2. Set local state to trigger CSS animation
    setIsCompleted(true);

    // 3. Callback to parent (to save to DB)
    if (onComplete) {
      // Optional: Add a slight delay before data update if you want the animation to finish first
      setTimeout(() => {
        onComplete();
        setIsCompleted(false); // Reset if the parent re-renders or keeps this mounted
      }, 1000);
    }
  };

  return (
    <div className="task-item" style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontWeight: '600' }}>{taskName}</span>
        <span className={`due-text ${isOverdue ? 'red' : 'gray'}`} style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isOverdue ? '#ef4444' : 'var(--text-secondary)' }}>
          {dueDate}
        </span>
      </div>
      
      <button 
        onClick={handleComplete}
        className={`btn btn-primary ${isCompleted ? 'animate-success' : ''}`}
        style={{ width: '100%' }}
      >
        {isCompleted ? 'Completed! ✓' : 'Mark Complete'}
      </button>
    </div>
  );
}