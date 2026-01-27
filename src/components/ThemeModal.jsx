import React from 'react';
import { X } from 'lucide-react';

const ThemeModal = ({ isOpen, onClose, currentTheme, setTheme }) => {
  if (!isOpen) return null;
  const themes = [
    { id: 'original', name: 'Original Blue' },
    { id: 'lotr', name: 'Lord of the Rings' },
    { id: 'christmas', name: 'Christmas' },
    { id: 'halloween', name: 'Halloween' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Select Theme</h2>
          <button onClick={onClose} className="btn-close"><X size={20}/></button>
        </div>
        <div style={{padding: '1.5rem'}}>
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); onClose(); }}
              style={{
                width: '100%', padding: '1rem', marginBottom: '0.5rem',
                border: currentTheme === t.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                background: 'var(--bg-card-secondary)',
                color: 'var(--text-main)',
                fontWeight: 'bold',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              {t.name} {currentTheme === t.id && "✓"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;