import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { differenceInDays, addDays, format } from 'date-fns';
import { CheckCircle, Clock, Trash2, ChevronUp, ChevronDown, Menu, X, Droplets } from 'lucide-react';
import SwipeView from './SwipeView';
import './App.css';

// --- DATA CONFIGURATION ---
const INITIAL_DATA = [
  // HOME AQUARIUMS
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
  // MEEMAW
  {
    id: 5, name: "Meemaw's Guppies", category: "meemaw", type: "Freshwater", size: "10 Gallon",
    tasks: [{ name: "Water Change (10%)", frequency: 7, lastCompleted: null, history: [] }]
  },
  // HERMITS
  {
    id: 6, name: "Crabitat", category: "hermit", type: "Terrarium", size: "20 Gallon",
    tasks: [{ name: "Mist & Water", frequency: 2, lastCompleted: null, history: [] }]
  },
  // PLANTS
  {
    id: 7, name: "Living Room Monstera", category: "plants", type: "Plant", size: "Pot",
    tasks: [{ name: "Watering", frequency: 7, lastCompleted: null, history: [] }]
  },
  // RODI
  {
    id: 8, name: "Basement System", category: "rodi", type: "Filter", size: "System",
    tasks: [{ name: "Change Sediment Filter", frequency: 180, lastCompleted: null, history: [] }]
  }
];

// --- MAIN APP ---
function App() {
  // Use V7 to ensure clean data load
  const [tanks, setTanks] = useState(() => {
    const saved = localStorage.getItem('aquariumDataV7'); 
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('aquariumDataV7', JSON.stringify(tanks));
  }, [tanks]);

  // --- CORE LOGIC ---
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
      localStorage.removeItem('aquariumDataV7');
    }
  };

  return (
    <Router>
      <div className="flex h-screen bg-gray-100 font-sans">
        
        {/* MOBILE OVERLAY */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}/>
        )}

        {/* SIDEBAR */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-4 flex justify-between items-center border-b border-slate-700">
            <h1 className="text-xl font-bold">Tank Tracker</h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X size={24}/></button>
          </div>
          <nav className="p-4 space-y-2">
            <Link to="/" onClick={() => setSidebarOpen(false)} className="block py-2 px-4 hover:bg-slate-800 rounded font-bold text-blue-200">
              Dashboard (Overview)
            </Link>
            
            <div className="pt-4 pb-2 text-xs text-slate-400 uppercase font-bold">Swipe Lists</div>
            
            <Link to="/swipe/home" onClick={() => setSidebarOpen(false)} className="block py-2 px-4 hover:bg-slate-800 rounded">Home Aquariums</Link>
            <Link to="/swipe/hermit" onClick={() => setSidebarOpen(false)} className="block py-2 px-4 hover:bg-slate-800 rounded">Hermit Crabs</Link>
            <Link to="/swipe/plants" onClick={() => setSidebarOpen(false)} className="block py-2 px-4 hover:bg-slate-800 rounded">Plants</Link>
            <Link to="/swipe/meemaw" onClick={() => setSidebarOpen(false)} className="block py-2 px-4 hover:bg-slate-800 rounded">Meemaw's Tank</Link>
            <Link to="/swipe/rodi" onClick={() => setSidebarOpen(false)} className="block py-2 px-4 hover:bg-slate-800 rounded">RODI</Link>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <header className="bg-white shadow-sm p-4 flex items-center justify-between lg:hidden z-10">
            <div className="flex items-center">
                <button onClick={() => setSidebarOpen(true)} className="text-gray-700 mr-4"><Menu size={24} /></button>
                <span className="font-bold text-lg">My Tanks</span>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-8" id="main-scroll">
            <Routes>
              {/* CLEAN DASHBOARD ROUTE */}
              <Route path="/" element={
                <CleanDashboard 
                   tanks={tanks} 
                   onComplete={handleComplete} 
                   onDeleteHistory={handleDeleteHistory}
                   onReset={resetData}
                />
              } />

              {/* SWIPE VIEW ROUTE */}
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

// --- HELPER 1: SWIPE WRAPPER ---
const SwipeWrapper = ({ tanks, onComplete }) => {
  const { category } = useParams();
  const filteredTanks = tanks.filter(t => t.category === category);
  return <SwipeView tanks={filteredTanks} onComplete={onComplete} categoryName={category} />;
};

// --- HELPER 2: NEW CLEAN DASHBOARD (COLLAPSIBLE) ---
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

  // Calculate status for top banner
  const totalOverdue = tanks.reduce((acc, tank) => {
    return acc + tank.tasks.filter(t => {
      if (!t.lastCompleted) return true;
      const nextDate = addDays(new Date(t.lastCompleted), t.frequency);
      return differenceInDays(new Date(), nextDate) > 0;
    }).length;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* STATUS BANNER */}
      <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Aquarium</h1>
          <p className="text-slate-500 text-sm">Overview</p>
        </div>
        <div className={`px-4 py-2 rounded-xl font-bold text-sm ${totalOverdue > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {totalOverdue > 0 ? `${totalOverdue} Tasks Overdue` : "All Systems Normal"}
        </div>
      </div>

      {/* TANK LIST */}
      <div className="space-y-4">
        {tanks.map(tank => {
          const isOpen = expandedTankId === tank.id;
          
          // Check tank health (Red/Green Dot Logic)
          const tankOverdueCount = tank.tasks.filter(t => {
            if (!t.lastCompleted) return true;
            return differenceInDays(new Date(), addDays(new Date(t.lastCompleted), t.frequency)) > 0;
          }).length;
          
          return (
            <div key={tank.id} className={`bg-white rounded-xl shadow-sm border transition-all duration-300 overflow-hidden ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-200'}`}>
              
              {/* HEADER (CLICK TO OPEN) */}
              <button 
                onClick={() => toggleTank(tank.id)}
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Status Dot */}
                  <div className={`w-3 h-3 rounded-full shadow-sm ${tankOverdueCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                  
                  <div>
                    <h2 className="font-bold text-slate-800 text-lg">{tank.name}</h2>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{tank.size} • {tank.type}</p>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="text-blue-500" /> : <ChevronDown className="text-slate-300" />}
              </button>

              {/* BODY (TASKS) */}
              {isOpen && (
                <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-3">
                  {tank.tasks.map((task, index) => {
                    const lastDate = task.lastCompleted ? new Date(task.lastCompleted) : null;
                    const nextDate = lastDate ? addDays(lastDate, task.frequency) : new Date();
                    const daysDiff = differenceInDays(new Date(), nextDate);
                    const isOverdue = lastDate ? daysDiff > 0 : true;
                    const uiKey = `${tank.id}-${index}`;
                    const showSideButtons = parseInt(tank.size) > 29;

                    return (
                      <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-semibold text-slate-700 block">{task.name}</span>
                            <span className={`text-xs font-bold ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                              {isOverdue ? `Due ${daysDiff} days ago` : `Due in ${Math.abs(daysDiff)} days`}
                            </span>
                          </div>
                          <button onClick={(e) => toggleHistory(e, uiKey)} className="text-slate-400 hover:text-blue-600 p-1">
                            <Clock size={16} />
                          </button>
                        </div>

                        {/* BUTTONS */}
                        <div className="flex gap-2">
                          {showSideButtons ? (
                            <>
                              <button onClick={() => onComplete(tank.id, index, 'Left')} className="flex-1 py-3 bg-blue-100 text-blue-700 font-bold rounded hover:bg-blue-200">Left</button>
                              <button onClick={() => onComplete(tank.id, index, 'Right')} className="flex-1 py-3 bg-blue-100 text-blue-700 font-bold rounded hover:bg-blue-200">Right</button>
                            </>
                          ) : (
                            <button onClick={() => onComplete(tank.id, index, null)} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 flex items-center justify-center gap-2">
                              <CheckCircle size={16} /> Complete
                            </button>
                          )}
                        </div>

                        {/* HISTORY */}
                        {expandedTask === uiKey && (
                           <div className="mt-3 pt-3 border-t border-slate-100 text-sm">
                             <p className="text-xs font-bold text-slate-400 uppercase mb-2">History</p>
                             {task.history && task.history.length > 0 ? (
                               <ul className="space-y-2">
                                 {task.history.slice(0, 3).map((entry, hIndex) => (
                                   <li key={hIndex} className="flex justify-between text-slate-600">
                                     <span>{format(new Date(entry.date || entry), 'MMM d')}</span>
                                     <button onClick={() => onDeleteHistory(tank.id, index, hIndex)} className="text-red-400 hover:text-red-600"><Trash2 size={12}/></button>
                                   </li>
                                 ))}
                               </ul>
                             ) : <span className="text-slate-400 italic">No history</span>}
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

      <footer className="mt-12 text-center">
        <button onClick={onReset} className="text-slate-400 text-sm hover:text-red-500 flex items-center gap-2 justify-center mx-auto">
          <Trash2 size={14}/> Reset All Data
        </button>
      </footer>
    </div>
  );
};

export default App;