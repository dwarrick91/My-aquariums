import React, { useState, useEffect } from 'react';
import { differenceInDays, addDays, format } from 'date-fns';
import { CheckCircle, Clock, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import './App.css';

// Configuration remains the same (Weekly schedules)
const INITIAL_DATA = [
  {
    id: 1,
    name: "The Monster",
    type: "Freshwater",
    size: "150 Gallon",
    tasks: [
      { name: "Water Change (20%)", frequency: 7, lastCompleted: null, history: [] },
      { name: "Clean Canister Filters", frequency: 30, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 2,
    name: "Saltwater Reef",
    type: "Saltwater",
    size: "65 Gallon",
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
    size: "55 Gallon",
    tasks: [
      { name: "Water Change (25%)", frequency: 7, lastCompleted: null, history: [] },
      { name: "Rinse Sponge Media", frequency: 14, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 4,
    name: "Betta Bowl",
    type: "Freshwater",
    size: "1 Gallon",
    tasks: [
      { name: "Water Change (100%)", frequency: 7, lastCompleted: null, history: [] }
    ]
  }
];

function App() {
  const [tanks, setTanks] = useState(() => {
    const saved = localStorage.getItem('aquariumDataV2');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [expandedTask, setExpandedTask] = useState(null);

  useEffect(() => {
    localStorage.setItem('aquariumDataV2', JSON.stringify(tanks));
  }, [tanks]);

  const handleComplete = (tankId, taskIndex) => {
    const newTanks = [...tanks];
    const tank = newTanks.find(t => t.id === tankId);
    const task = tank.tasks[taskIndex];
    const now = new Date().toISOString();
    
    // Add to history
    if (!task.history) task.history = [];
    task.history = [now, ...task.history];
    
    // Update lastCompleted to the NEWest date (which is now)
    task.lastCompleted = now;

    setTanks(newTanks);
  };

  const handleDeleteHistory = (tankId, taskIndex, historyIndex) => {
    if(!window.confirm("Delete this specific history entry?")) return;

    const newTanks = [...tanks];
    const tank = newTanks.find(t => t.id === tankId);
    const task = tank.tasks[taskIndex];

    // Remove the item at historyIndex
    task.history.splice(historyIndex, 1);

    // Recalculate 'lastCompleted' based on the remaining history
    // If history is empty, lastCompleted is null. 
    // Otherwise, it is the first item in the array (since we sort new -> old)
    task.lastCompleted = task.history.length > 0 ? task.history[0] : null;

    setTanks(newTanks);
  };

  const toggleHistory = (tankId, taskIndex) => {
    const key = `${tankId}-${taskIndex}`;
    setExpandedTask(expandedTask === key ? null : key);
  };

  const resetData = () => {
    if(window.confirm("Are you sure? This will delete ALL history.")) {
      setTanks(INITIAL_DATA);
      localStorage.removeItem('aquariumDataV2');
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Aquarium Manager 🐠</h1>
        <p>Weekly Maintenance Tracker</p>
      </header>

      <div className="tank-grid">
        {tanks.map(tank => (
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
                
                // Logic: It is overdue if daysDiff > 0 AND it hasn't been done today.
                const isOverdue = lastDate ? daysDiff > 0 : true; 
                
                const uiKey = `${tank.id}-${index}`;

                return (
                  // Conditional Class: Adds 'overdue-wrapper' if necessary
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
                        <button 
                          onClick={() => handleComplete(tank.id, index)}
                          className="btn-complete"
                          title="Mark as Done"
                        >
                          <CheckCircle size={16} /> Done
                        </button>
                      </div>
                    </div>

                    {/* HISTORY DROPDOWN */}
                    {expandedTask === uiKey && (
                      <div className="history-list">
                        <div className="history-header">History Log</div>
                        {task.history && task.history.length > 0 ? (
                          <ul>
                            {task.history.map((dateStr, hIndex) => (
                              <li key={hIndex}>
                                <span>
                                  {format(new Date(dateStr), 'MMM d, yyyy')} 
                                  <span className="history-time"> {format(new Date(dateStr), 'h:mm a')}</span>
                                </span>
                                <button 
                                  className="btn-delete-entry"
                                  onClick={() => handleDeleteHistory(tank.id, index, hIndex)}
                                  title="Delete this entry"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </li>
                            ))}
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
        ))}
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