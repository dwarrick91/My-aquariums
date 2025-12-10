import React, { useState, useEffect } from 'react';
import { differenceInDays, addDays, format } from 'date-fns';
import { CheckCircle, Clock, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import './App.css';

// 1. Updated Configuration
const INITIAL_DATA = [
  {
    id: 1,
    name: "The Monster",
    type: "Freshwater",
    size: "135 Gallon", // Changed from 150
    tasks: [
      { name: "Water Change (20%)", frequency: 7, lastCompleted: null, history: [] },
      { name: "Clean Canister Filters", frequency: 30, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 2,
    name: "Saltwater Reef",
    type: "Saltwater",
    size: "29 Gallon", // Changed from 65
    tasks: [
      { name: "Water Change (10%)", frequency: 7, lastCompleted: null, history: [] },
      { name: "Empty Skimmer Cup", frequency: 3, lastCompleted: null, history: [] },
      { name: "Check Salinity", frequency: 7, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 3,
    name: "Community Tank",
    type: "Freshwater",
    size: "50 Gallon", // Changed from 55
    tasks: [
      { name: "Water Change (25%)", frequency: 7, lastCompleted: null, history: [] },
      { name: "Rinse Sponge Media", frequency: 14, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 4,
    name: "Betta Tank",
    type: "Freshwater",
    size: "3 Gallon", // Changed from 1g Bowl
    tasks: [
      { name: "Water Change (50%)", frequency: 7, lastCompleted: null, history: [] }
    ]
  }
];

function App() {
  const [tanks, setTanks] = useState(() => {
    // We use a new key 'aquariumDataV3' to ensure we start fresh with the new tank sizes
    const saved = localStorage.getItem('aquariumDataV3'); 
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [expandedTask, setExpandedTask] = useState(null);

  useEffect(() => {
    localStorage.setItem('aquariumDataV3', JSON.stringify(tanks));
  }, [tanks]);

  // Updated to accept 'side' parameter
  const handleComplete = (tankId, taskIndex, side = null) => {
    const newTanks = [...tanks];
    const tank = newTanks.find(t => t.id === tankId);
    const task = tank.tasks[taskIndex];
    const now = new Date().toISOString();
    
    // Create the history entry object
    const historyEntry = {
      date: now,
      side: side // This will be 'Left', 'Right', or null
    };
    
    // Add to history
    if (!task.history) task.history = [];
    task.history = [historyEntry, ...task.history];
    
    // Update lastCompleted
    task.lastCompleted = now; // We still store the raw date string here for easy calculations

    setTanks(newTanks);
  };

  const handleDeleteHistory = (tankId, taskIndex, historyIndex) => {
    if(!window.confirm("Delete this specific history entry?")) return;

    const newTanks = [...tanks];
    const tank = newTanks.find(t => t.id === tankId);
    const task = tank.tasks[taskIndex];

    // Remove the item
    task.history.splice(historyIndex, 1);

    // Recalculate 'lastCompleted' based on the remaining history
    if (task.history.length > 0) {
      // Handle both old format (string) and new format (object)
      const newest = task.history[0];
      task.lastCompleted = typeof newest === 'string' ? newest : newest.date;
    } else {
      task.lastCompleted = null;
    }

    setTanks(newTanks);
  };

  const toggleHistory = (tankId, taskIndex) => {
    const key = `${tankId}-${taskIndex}`;
    setExpandedTask(expandedTask === key ? null : key);
  };

  const resetData = () => {
    if(window.confirm("Are you sure? This will delete ALL history and reset tank sizes.")) {
      setTanks(INITIAL_DATA);
      localStorage.removeItem('aquariumDataV3');
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Aquarium Manager 🐠</h1>
        <p>Weekly Maintenance Tracker</p>
      </header>

      <div className="tank-grid">
        {tanks.map(tank => {
          // Parse size to number to check for "Over 29 Gallon" logic
          const sizeNum = parseInt(tank.size);
          const showSideButtons = sizeNum > 29;

          return (
            <div key={tank.id} className={`tank-card ${tank.type.toLowerCase()}`}>
              <div className="tank-header">
                <h2>{tank.name}</h2>
                <span className="badge">{tank.size} • {tank.type}</span>
              </div>
              
              <div className="task-list">
                {tank.tasks.map((task, index) => {
                  const lastDate = task.lastCompleted ? new Date(task.lastCompleted) : null;
                  const nextDate = lastDate ? addDays(lastDate, task.frequency) : new Date();
                  const daysDiff = differenceInDays(new Date(), nextDate);
                  const isOverdue = lastDate ? daysDiff > 0 : true; 
                  const uiKey = `${tank.id}-${index}`;

                  return (
                    <div key={index} className={`task-wrapper ${isOverdue ? 'overdue-wrapper' : ''}`}>
                      <div className="task-row">
                        <div className="task-info">
                          <span className="task-name">{task.name}</span>
                          <span className={`status ${isOverdue ? 'overdue' : 'good'}`}>
                            {lastDate 
                              ? isOverdue 
                                ? `Overdue by ${daysDiff} days!` 
                                : `Due in ${Math.abs(daysDiff)} days`
                              : "Never done - Due Now!"}
                          </span>
                        </div>
                        
                        <div className="action-buttons">
                          <button 
                            onClick={() => toggleHistory(tank.id, index)}
                            className="btn-icon"
                            title="View History"
                          >
                            {expandedTask === uiKey ? <ChevronUp size={18}/> : <Clock size={18} />}
                          </button>

                          {/* LOGIC: Show split buttons for big tanks, single button for small tanks */}
                          {showSideButtons ? (
                            <div className="split-btn-group">
                              <button 
                                onClick={() => handleComplete(tank.id, index, 'Left')}
                                className="btn-complete btn-split-l"
                              >
                                L
                              </button>
                              <button 
                                onClick={() => handleComplete(tank.id, index, 'Right')}
                                className="btn-complete btn-split-r"
                              >
                                R
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleComplete(tank.id, index, null)}
                              className="btn-complete"
                            >
                              <CheckCircle size={16} /> Done
                            </button>
                          )}
                        </div>
                      </div>

                      {/* HISTORY DROPDOWN */}
                      {expandedTask === uiKey && (
                        <div className="history-list">
                          <div className="history-header">History Log</div>
                          {task.history && task.history.length > 0 ? (
                            <ul>
                              {task.history.map((entry, hIndex) => {
                                // Handle both old string format and new object format
                                const dateStr = typeof entry === 'string' ? entry : entry.date;
                                const side = typeof entry === 'object' ? entry.side : null;

                                return (
                                  <li key={hIndex}>
                                    <span>
                                      {format(new Date(dateStr), 'MMM d, yyyy')} 
                                      <span className="history-time"> {format(new Date(dateStr), 'h:mm a')}</span>
                                      {/* Show Side Badge if it exists */}
                                      {side && <span className="side-badge">{side}</span>}
                                    </span>
                                    <button 
                                      className="btn-delete-entry"
                                      onClick={() => handleDeleteHistory(tank.id, index, hIndex)}
                                      title="Delete this entry"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="no-history">No history recorded yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <footer>
        <button onClick={resetData} className="btn-reset">
          <Trash2 size={14}/> Reset All Data
        </button>
      </footer>
    </div>
  );
}

export default App;