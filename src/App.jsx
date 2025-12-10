import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { differenceInDays, addDays, format } from 'date-fns';
import { CheckCircle, Clock, Trash2, ChevronUp, ChevronDown, Menu, X } from 'lucide-react';
import SwipeView from './SwipeView';
import './App.css';

// 1. Updated Data with CATEGORIES
const INITIAL_DATA = [
  {
    id: 1,
    name: "The Monster",
    category: "home", // <--- ADDED CATEGORY
    type: "Freshwater",
    size: "135 Gallon",
    tasks: [
      { name: "Water Change (20%)", frequency: 7, lastCompleted: null, history: [] },
      { name: "Clean Canister Filters", frequency: 30, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 2,
    name: "Saltwater Reef",
    category: "home",
    type: "Saltwater",
    size: "29 Gallon",
    tasks: [
      { name: "Water Change (10%)", frequency: 7, lastCompleted: null, history: [] },
      { name: "Empty Skimmer Cup", frequency: 3, lastCompleted: null, history: [] },
      { name: "Check Salinity", frequency: 7, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 3,
    name: "Community Tank",
    category: "home",
    type: "Freshwater",
    size: "50 Gallon",
    tasks: [
      { name: "Water Change (25%)", frequency: 7, lastCompleted: null, history: [] },
      { name: "Rinse Sponge Media", frequency: 14, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 4,
    name: "Betta Tank",
    category: "home",
    type: "Freshwater",
    size: "3 Gallon",
    tasks: [
      { name: "Water Change (50%)", frequency: 7, lastCompleted: null, history: [] }
    ]
  },
  // Example of a different category
  {
    id: 5,
    name: "Meemaw's Guppies",
    category: "meemaw", 
    type: "Freshwater",
    size: "10 Gallon",
    tasks: [
      { name: "Water Change (10%)", frequency: 7, lastCompleted: null, history: [] }
    ]
  }
];

// --- MAIN APP COMPONENT ---
function App() {
  const [tanks, setTanks] = useState(() => {
    const saved = localStorage.getItem('aquariumDataV5'); // Bumped to V5 for category update
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('aquariumDataV5', JSON.stringify(tanks));
  }, [tanks]);

  // --- YOUR EXISTING LOGIC ---
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
    if(!window.confirm("Delete this specific history entry?")) return;
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
      localStorage.removeItem('aquariumDataV5');
    }
  };

  return (
    <Router>
      <div className="flex h-screen bg-gray-100 font-sans">
        
        {/* SIDEBAR NAVIGATION */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}/>
        )}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-4 flex justify-between items-center border-b border-slate-700">
            <h1 className="text-xl font-bold">Tank Tracker</h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X size={24}/></button>
          </div>
          <nav className="p-4 space-y-2">
            <Link to="/" onClick={() => setSidebarOpen(false)} className="block py-2 px-4 hover:bg-slate-800 rounded">Dashboard</Link>
            <div className="pt-4 pb-2 text-xs text-slate-400 uppercase font-bold">Swipe Lists</div>
            <Link to="/swipe/home" onClick={() => setSidebarOpen(false)} className="block py-2 px-4 hover:bg-slate-800 rounded">Home Aquariums</Link>
            <Link to="/swipe/meemaw" onClick={() => setSidebarOpen(false)} className="block py-2 px-4 hover:bg-slate-800 rounded">Meemaw's Tank</Link>
            <Link to="/swipe/hermit" onClick={() => setSidebarOpen(false)} className="block py-2 px-4 hover:bg-slate-800 rounded">Hermit Crabs</Link>
            <Link to="/swipe/plants" onClick={() => setSidebarOpen(false)} className="block py-2 px-4 hover:bg-slate-800 rounded">Plants</Link>
            <Link to="/swipe/rodi" onClick={() => setSidebarOpen(false)} className="block py-2 px-4 hover:bg-slate-800 rounded">RODI</Link>
          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <header className="bg-white shadow-sm p-4 flex items-center justify-between lg:hidden z-10">
            <div className="flex items-center">
                <button onClick={() => setSidebarOpen(true)} className="text-gray-700 mr-4"><Menu size={24} /></button>
                <span className="font-bold text-lg">My Tanks</span>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4" id="main-scroll">
            <Routes>
              {/* DEFAULT ROUTE: Your Original Dashboard */}
              <Route path="/" element={
                <Dashboard 
                   tanks={tanks} 
                   onComplete={handleComplete} 
                   onDeleteHistory={handleDeleteHistory}
                   onReset={resetData}
                />
              } />

              {/* NEW ROUTE: Swipe View */}
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

// --- HELPER COMPONENT: SWIPE WRAPPER ---
// Filters the tanks based on the URL (e.g., /swipe/home) and passes them to SwipeView
const SwipeWrapper = ({ tanks, onComplete }) => {
  const { category } = useParams();
  // Filter tanks that match the category
  const filteredTanks = tanks.filter(t => t.category === category);
  
  return <SwipeView tanks={filteredTanks} onComplete={onComplete} categoryName={category} />;
};

// --- YOUR ORIGINAL UI (Moved into a Component) ---
const Dashboard = ({ tanks, onComplete, onDeleteHistory, onReset }) => {
  const [expandedTask, setExpandedTask] = useState(null);

  const toggleHistory = (tankId, taskIndex) => {
    const key = `${tankId}-${taskIndex}`;
    setExpandedTask(expandedTask === key ? null : key);
  };

  return (
    <div className="app-container">
      <header className="hidden lg:block mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Aquarium Manager 🐠</h1>
        <p className="text-slate-500">Weekly Maintenance Tracker</p>
      </header>

      <div className="tank-grid">
        {tanks.map(tank => {
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
                            {lastDate ? (isOverdue ? `Overdue by ${daysDiff} days!` : `Due in ${Math.abs(daysDiff)} days`) : "Due Now!"}
                          </span>
                        </div>
                        
                        <div className="action-buttons">
                          <button onClick={() => toggleHistory(tank.id, index)} className="btn-icon">
                            {expandedTask === uiKey ? <ChevronUp size={18}/> : <Clock size={18} />}
                          </button>
                          {showSideButtons ? (
                            <div className="split-btn-group">
                              <button onClick={() => onComplete(tank.id, index, 'Left')} className="btn-complete btn-split-l">L</button>
                              <button onClick={() => onComplete(tank.id, index, 'Right')} className="btn-complete btn-split-r">R</button>
                            </div>
                          ) : (
                            <button onClick={() => onComplete(tank.id, index, null)} className="btn-complete">
                              <CheckCircle size={16} /> Done
                            </button>
                          )}
                        </div>
                      </div>

                      {expandedTask === uiKey && (
                        <div className="history-list">
                          {task.history && task.history.length > 0 ? (
                            <ul>
                              {task.history.map((entry, hIndex) => {
                                const dateStr = typeof entry === 'string' ? entry : entry.date;
                                const side = typeof entry === 'object' ? entry.side : null;
                                return (
                                  <li key={hIndex}>
                                    <span>
                                      {format(new Date(dateStr), 'MMM d')} <span className="text-gray-400 text-xs">{format(new Date(dateStr), 'h:mm a')}</span>
                                      {side && <span className="side-badge">{side}</span>}
                                    </span>
                                    <button className="btn-delete-entry" onClick={() => onDeleteHistory(tank.id, index, hIndex)}><Trash2 size={14} /></button>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : <p className="no-history">No history recorded yet.</p>}
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
      <footer className="mt-8">
        <button onClick={onReset} className="btn-reset flex items-center gap-2"><Trash2 size={14}/> Reset All Data</button>
      </footer>
    </div>
  );
};

export default App;