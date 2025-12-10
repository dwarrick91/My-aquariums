import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { differenceInDays, addDays, format } from 'date-fns';
import { CheckCircle, Clock, Trash2, ChevronUp, ChevronDown, Menu, X } from 'lucide-react';
import SwipeView from './SwipeView';
import './App.css';

// --- DATA CONFIGURATION ---
const INITIAL_DATA = [
  {
    id: 1, name: "The Monster", category: "home", type: "Freshwater", size: "135 Gallon",
    tasks: [
      { name: "Water Change (20%)", frequency: 7, lastCompleted: null, history: [] },
      { name: "Clean Canister Filters", frequency: 30, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 2, name: "Saltwater Reef", category: "home", type: "Saltwater", size: "29 Gallon",
    tasks: [
      { name: "Water Change (10%)", frequency: 7, lastCompleted: null, history: [] },
      { name: "Empty Skimmer Cup", frequency: 3, lastCompleted: null, history: [] },
      { name: "Check Salinity", frequency: 7, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 3, name: "Community Tank", category: "home", type: "Freshwater", size: "50 Gallon",
    tasks: [
      { name: "Water Change (25%)", frequency: 7, lastCompleted: null, history: [] },
      { name: "Rinse Sponge Media", frequency: 14, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 4, name: "Betta Tank", category: "home", type: "Freshwater", size: "3 Gallon",
    tasks: [{ name: "Water Change (50%)", frequency: 7, lastCompleted: null, history: [] }]
  },
  {
    id: 5, name: "Meemaw's Guppies", category: "meemaw", type: "Freshwater", size: "10 Gallon",
    tasks: [{ name: "Water Change (10%)", frequency: 7, lastCompleted: null, history: [] }]
  },
  {
    id: 6, name: "Crabitat", category: "hermit", type: "Terrarium", size: "20 Gallon",
    tasks: [{ name: "Mist & Water", frequency: 2, lastCompleted: null, history: [] }]
  },
  {
    id: 7, name: "Living Room Monstera", category: "plants", type: "Plant", size: "Pot",
    tasks: [{ name: "Watering", frequency: 7, lastCompleted: null, history: [] }]
  },
  {
    id: 8, name: "Basement System", category: "rodi", type: "Filter", size: "System",
    tasks: [{ name: "Change Sediment Filter", frequency: 180, lastCompleted: null, history: [] }]
  }
];

function App() {
  const [tanks, setTanks] = useState(() => {
    const saved = localStorage.getItem('aquariumDataV8'); // Version 8
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('aquariumDataV8', JSON.stringify(tanks));
  }, [tanks]);

  const handleComplete = (tankId, taskIndex, side = null) => {
    const newTanks = [...tanks];
    const tank = newTanks.find(t => t.id === tankId);
    const task = tank.tasks[taskIndex];
    const now = new Date().toISOString();
    
    const historyEntry = { date: now, side: side };
    
    if (!task.history) task.history = [];
    task.history = [historyEntry, ...task.history];
    task.lastCompleted = now; 

    setTanks(newTanks);
  };

  const handleDeleteHistory = (tankId, taskIndex, historyIndex) => {
    if(!window.confirm("Delete this history entry?")) return;
    const newTanks = [...tanks];
    const tank = newTanks.find(t => t.id === tankId);
    const task = tank.tasks[taskIndex];
    task.history.splice(historyIndex, 1);
    
    if (task.history.length > 0) {
      const newest = task.history[0];
      task.lastCompleted = typeof newest === 'string' ? newest : newest.date;
    } else {
      task.lastCompleted = null;
    }
    setTanks(newTanks);
  };

  const resetData = () => {
    if(window.confirm("Are you sure? This will delete ALL history.")) {
      setTanks(INITIAL_DATA);
      localStorage.removeItem('aquariumDataV8');
    }
  };

  return (
    <Router>
      <div className="app-container">
        
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div className="mobile-overlay" onClick={() => setSidebarOpen(false)}/>
        )}

        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h1>Tank Tracker</h1>
            <button onClick={() => setSidebarOpen(false)} style={{background:'none', border:'none', color:'white'}} className="lg-hidden">
                <X size={24}/>
            </button>
          </div>
          <nav className="sidebar-nav">
            <Link to="/" onClick={() => setSidebarOpen(false)} className="nav-link">
              Dashboard (Overview)
            </Link>
            
            <div className="section-label">Swipe Lists</div>
            
            <Link to="/swipe/home" onClick={() => setSidebarOpen(false)} className="nav-link">Home Aquariums</Link>
            <Link to="/swipe/hermit" onClick={() => setSidebarOpen(false)} className="nav-link">Hermit Crabs</Link>
            <Link to="/swipe/plants" onClick={() => setSidebarOpen(false)} className="nav-link">Plants</Link>
            <Link to="/swipe/meemaw" onClick={() => setSidebarOpen(false)} className="nav-link">Meemaw's Tank</Link>
            <Link to="/swipe/rodi" onClick={() => setSidebarOpen(false)} className="nav-link">RODI</Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <header className="mobile-header">
            <button onClick={() => setSidebarOpen(true)} style={{background:'none', border:'none'}}>
                <Menu size={24} color="#334155" />
            </button>
            <h2>My Tanks</h2>
          </header>

          <div className="content-scroll-area">
            <Routes>
              <Route path="/" element={
                <CleanDashboard 
                   tanks={tanks} 
                   onComplete={handleComplete} 
                   onDeleteHistory={handleDeleteHistory}
                   onReset={resetData}
                />
              } />

              <Route path="/swipe/:category" element={
                <SwipeWrapper tanks={tanks} onComplete={handleComplete} />
              } />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

const SwipeWrapper = ({ tanks, onComplete }) => {
  const { category } = useParams();
  const filteredTanks = tanks.filter(t => t.category === category);
  return <SwipeView tanks={filteredTanks} onComplete={onComplete} categoryName={category} />;
};

const CleanDashboard = ({ tanks, onComplete, onDeleteHistory, onReset }) => {
  const [expandedTankId, setExpandedTankId] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);

  const toggleTank = (id) => {
    setExpandedTankId(expandedTankId === id ? null : id);
  };

  const toggleHistory = (e, uniqueKey) => {
    e.stopPropagation();
    setExpandedTask(expandedTask === uniqueKey ? null : uniqueKey);
  };

  const totalOverdue = tanks.reduce((acc, tank) => {
    return acc + tank.tasks.filter(t => {
      if (!t.lastCompleted) return true;
      const nextDate = addDays(new Date(t.lastCompleted), t.frequency);
      return differenceInDays(new Date(), nextDate) > 0;
    }).length;
  }, 0);

  return (
    <div className="dashboard-container">
      {/* Status Banner */}
      <div className="status-banner">
        <div>
          <h1 style={{margin:0, fontSize:'1.5rem', color:'#1e293b'}}>My Aquarium</h1>
          <p style={{margin:0, color:'#64748b'}}>Overview</p>
        </div>
        <div className={`status-badge ${totalOverdue > 0 ? 'red' : 'green'}`}>
          {totalOverdue > 0 ? `${totalOverdue} Tasks Overdue` : "All Systems Normal"}
        </div>
      </div>

      {/* Tank List */}
      <div>
        {tanks.map(tank => {
          const isOpen = expandedTankId === tank.id;
          const tankOverdueCount = tank.tasks.filter(t => {
            if (!t.lastCompleted) return true;
            return differenceInDays(new Date(), addDays(new Date(t.lastCompleted), t.frequency)) > 0;
          }).length;
          
          return (
            <div key={tank.id} className={`tank-card ${isOpen ? 'open' : ''}`}>
              {/* Header */}
              <button onClick={() => toggleTank(tank.id)} className="card-header">
                <div className="tank-info">
                  <div className={`status-dot ${tankOverdueCount > 0 ? 'red' : 'green'}`} />
                  <div className="tank-details">
                    <h3>{tank.name}</h3>
                    <p>{tank.size} • {tank.type}</p>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={20} color="#3b82f6" /> : <ChevronDown size={20} color="#cbd5e1" />}
              </button>

              {/* Body */}
              {isOpen && (
                <div className="card-body">
                  {tank.tasks.map((task, index) => {
                    const lastDate = task.lastCompleted ? new Date(task.lastCompleted) : null;
                    const nextDate = lastDate ? addDays(lastDate, task.frequency) : new Date();
                    const daysDiff = differenceInDays(new Date(), nextDate);
                    const isOverdue = lastDate ? daysDiff > 0 : true;
                    const uiKey = `${tank.id}-${index}`;
                    const showSideButtons = parseInt(tank.size) > 29;

                    return (
                      <div key={index} className="task-item">
                        <div className="task-header">
                          <div>
                            <span style={{display:'block', fontWeight:600, color:'#334155'}}>{task.name}</span>
                            <span className={`due-text ${isOverdue ? 'red' : 'gray'}`}>
                              {isOverdue ? `Due ${daysDiff} days ago` : `Due in ${Math.abs(daysDiff)} days`}
                            </span>
                          </div>
                          <button onClick={(e) => toggleHistory(e, uiKey)} style={{border:'none', background:'none', cursor:'pointer', color:'#94a3b8'}}>
                            <Clock size={16} />
                          </button>
                        </div>

                        {/* Buttons */}
                        <div className="btn-group">
                          {showSideButtons ? (
                            <>
                              <button onClick={() => onComplete(tank.id, index, 'Left')} className="btn btn-secondary">Left</button>
                              <button onClick={() => onComplete(tank.id, index, 'Right')} className="btn btn-secondary">Right</button>
                            </>
                          ) : (
                            <button onClick={() => onComplete(tank.id, index, null)} className="btn btn-primary">
                              <CheckCircle size={16} /> Complete
                            </button>
                          )}
                        </div>

                        {/* History */}
                        {expandedTask === uiKey && (
                           <div style={{marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid #e2e8f0'}}>
                             <p style={{fontSize:'0.75rem', fontWeight:'bold', color:'#94a3b8', textTransform:'uppercase'}}>History</p>
                             {task.history && task.history.length > 0 ? (
                               <ul style={{listStyle:'none', padding:0, margin:'0.5rem 0'}}>
                                 {task.history.slice(0, 3).map((entry, hIndex) => (
                                   <li key={hIndex} style={{display:'flex', justifyContent:'space-between', padding:'0.25rem 0', color:'#64748b', fontSize:'0.9rem'}}>
                                     <span>{format(new Date(entry.date || entry), 'MMM d')}</span>
                                     <button onClick={() => onDeleteHistory(tank.id, index, hIndex)} style={{border:'none', background:'none', color:'#ef4444', cursor:'pointer'}}><Trash2 size={14}/></button>
                                   </li>
                                 ))}
                               </ul>
                             ) : <span style={{color:'#cbd5e1', fontStyle:'italic', fontSize:'0.9rem'}}>No history</span>}
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{textAlign:'center'}}>
        <button onClick={onReset} className="btn-reset">
          <Trash2 size={14}/> Reset All Data
        </button>
      </div>
    </div>
  );
};

export default App;