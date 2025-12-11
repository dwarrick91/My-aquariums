import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useParams, Navigate } from 'react-router-dom';
import { differenceInDays, addDays, format } from 'date-fns';
import { CheckCircle, Clock, Trash2, ChevronUp, ChevronDown, Menu, X, Plus, MessageSquare, Download, Upload, Pencil } from 'lucide-react';
import SwipeView from './SwipeView';
import './App.css';

// --- DATA CONFIGURATION ---
const INITIAL_DATA = [
  {
    id: 1, name: "The Monster", category: "home", type: "Freshwater", size: "135 Gallon",
    notes: [],
    tasks: [
      { name: "Water Change", frequency: 7, lastCompleted: null, history: [] },
      { name: "Clean Canister Filters", frequency: 30, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 2, name: "Saltwater Reef", category: "home", type: "Saltwater", size: "29 Gallon",
    notes: [],
    tasks: [
      { name: "Water Change", frequency: 7, lastCompleted: null, history: [] },
      { name: "Empty Skimmer Cup", frequency: 3, lastCompleted: null, history: [] },
      { name: "Check Salinity", frequency: 7, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 3, name: "Community Tank", category: "home", type: "Freshwater", size: "50 Gallon",
    notes: [],
    tasks: [
      { name: "Water Change", frequency: 7, lastCompleted: null, history: [] },
      { name: "Rinse Sponge Media", frequency: 14, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 4, name: "Betta Tank", category: "home", type: "Freshwater", size: "3 Gallon",
    notes: [],
    tasks: [{ name: "Water Change", frequency: 7, lastCompleted: null, history: [] }]
  },
  {
    id: 5, name: "Meemaw's Cichlids", category: "meemaw", type: "Cichlid", size: "65 Gallon",
    notes: [],
    tasks: [{ name: "Water Change", frequency: 7, lastCompleted: null, history: [] }]
  },
  {
    id: 6, name: "Jackson's Hermit Crabs", category: "hermit", type: "Terrarium", size: "55 Gallon",
    notes: [],
    tasks: [{ name: "Water Change", frequency: 2, lastCompleted: null, history: [] }]
  },
  {
    id: 701, name: "Living Room Plants", category: "plants", type: "Houseplant", size: "Pot",
    notes: [],
    tasks: [{ name: "Watering", frequency: 7, lastCompleted: null, history: [] }]
  },
  {
    id: 702, name: "Aloe", category: "plants", type: "Succulent", size: "Pot",
    notes: [],
    tasks: [{ name: "Watering", frequency: 14, lastCompleted: null, history: [] }]
  },
  {
    id: 703, name: "Bedroom Plants", category: "plants", type: "Houseplant", size: "Pot",
    notes: [],
    tasks: [{ name: "Watering", frequency: 7, lastCompleted: null, history: [] }]
  },
  {
    id: 801, name: "Filter 1", category: "rodi", type: "Sediment", size: "Stage 1",
    notes: [],
    tasks: [{ name: "Replace Filter", frequency: 180, lastCompleted: null, history: [] }]
  },
  {
    id: 802, name: "Filter 2", category: "rodi", type: "Carbon Block", size: "Stage 2",
    notes: [],
    tasks: [{ name: "Replace Filter", frequency: 180, lastCompleted: null, history: [] }]
  },
  {
    id: 803, name: "Filter 3", category: "rodi", type: "Carbon Block", size: "Stage 3",
    notes: [],
    tasks: [{ name: "Replace Filter", frequency: 180, lastCompleted: null, history: [] }]
  },
  {
    id: 804, name: "Filter 4", category: "rodi", type: "RO Membrane", size: "Stage 4",
    notes: [],
    tasks: [{ name: "Replace Filter", frequency: 730, lastCompleted: null, history: [] }]
  },
  {
    id: 805, name: "Filter 5", category: "rodi", type: "Deionization", size: "Stage 5",
    notes: [],
    tasks: [{ name: "Replace Filter", frequency: 90, lastCompleted: null, history: [] }]
  },
  {
    id: 806, name: "Filter 6", category: "rodi", type: "Polishing", size: "Stage 6",
    notes: [],
    tasks: [{ name: "Replace Filter", frequency: 180, lastCompleted: null, history: [] }]
  }
];

// --- UNIVERSAL ITEM MODAL (Updated UI) ---
const ItemModal = ({ isOpen, onClose, onSave, onDelete, itemToEdit }) => {
  const defaultState = {
    name: '',
    category: 'home',
    type: '',
    size: '',
    frequency: 7
  };

  const [formData, setFormData] = useState(defaultState);

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setFormData({
          name: itemToEdit.name,
          category: itemToEdit.category,
          type: itemToEdit.type,
          size: itemToEdit.size,
          frequency: itemToEdit.tasks[0]?.frequency || 7
        });
      } else {
        setFormData(defaultState);
      }
    }
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleDeleteClick = () => {
    if (itemToEdit) {
        onDelete(itemToEdit.id);
    }
  };

  const isPlant = formData.category === 'plants';
  const sizeLabel = isPlant ? "Size (e.g. Small Pot)" : "Size (e.g. 90 Gallon)";
  const typeLabel = isPlant ? "Type (e.g. Succulent)" : "Type (e.g. Saltwater)";
  const modalTitle = itemToEdit ? "Edit Item" : "Add New Item";
  const buttonText = itemToEdit ? "Save Changes" : "Create";

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{modalTitle}</h2>
          <button onClick={onClose} className="btn-close"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="form-select">
              <option value="home">Home Aquarium</option>
              <option value="plants">Plant</option>
              <option value="meemaw">Meemaw's Tank</option>
              <option value="hermit">Hermit Crab</option>
              <option value="rodi">RODI Filter</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Name</label>
            <input 
              name="name" 
              placeholder="e.g. Living Room Tank" 
              value={formData.name} 
              onChange={handleChange} 
              className="form-input" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">{typeLabel}</label>
            <input 
              name="type" 
              placeholder={isPlant ? "Houseplant" : "Freshwater"} 
              value={formData.type} 
              onChange={handleChange} 
              className="form-input" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">{sizeLabel}</label>
            <input 
              name="size" 
              placeholder={isPlant ? "Pot" : "75 Gallon"} 
              value={formData.size} 
              onChange={handleChange} 
              className="form-input" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Task Frequency (Days)</label>
            <input 
              type="number" 
              name="frequency" 
              value={formData.frequency} 
              onChange={handleChange} 
              className="form-input" 
              min="1" 
              required 
            />
          </div>

          <div className="modal-actions">
            {itemToEdit && (
                <button 
                    type="button" 
                    onClick={handleDeleteClick} 
                    className="btn-delete-modal"
                >
                    <Trash2 size={18} /> Delete
                </button>
            )}

            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-save">{buttonText}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

function App() {
  const [tanks, setTanks] = useState(() => {
    // V16 forces fresh data structure
    const saved = localStorage.getItem('aquariumDataV16'); 
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // MODAL STATES
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('aquariumDataV16', JSON.stringify(tanks));
  }, [tanks]);

  // --- MODAL HANDLERS ---
  const openAddModal = () => {
    setEditingItem(null); 
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item); 
    setModalOpen(true);
  };

  // --- DATA LOGIC ---
  const handleDeleteItem = (id) => {
    if(window.confirm("Are you sure you want to delete this tank/plant permanently?")) {
        setTanks(prevTanks => prevTanks.filter(item => item.id !== id));
        setModalOpen(false); 
    }
  };

  const handleSaveItem = (formData) => {
    if (editingItem) {
      setTanks(prevTanks => prevTanks.map(tank => {
        if (tank.id === editingItem.id) {
          const updatedTasks = [...tank.tasks];
          if (updatedTasks.length > 0) {
            updatedTasks[0] = { ...updatedTasks[0], frequency: parseInt(formData.frequency) };
          }
          return {
            ...tank,
            name: formData.name,
            category: formData.category,
            type: formData.type,
            size: formData.size,
            tasks: updatedTasks
          };
        }
        return tank;
      }));
    } else {
      let taskName = "Water Change";
      if (formData.category === 'plants') taskName = "Watering";
      if (formData.category === 'rodi') taskName = "Replace Filter";

      const newItem = {
        id: Date.now(),
        name: formData.name,
        category: formData.category,
        type: formData.type,
        size: formData.size,
        notes: [],
        tasks: [{ name: taskName, frequency: parseInt(formData.frequency), lastCompleted: null, history: [] }]
      };
      setTanks([...tanks, newItem]);
    }
  };

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

  const handleAddNote = (tankId, text) => {
    if (!text.trim()) return;
    const newTanks = [...tanks];
    const tank = newTanks.find(t => t.id === tankId);
    if (!tank.notes) tank.notes = [];
    
    const newNote = { id: Date.now(), date: new Date().toISOString(), text: text };
    tank.notes.unshift(newNote); 
    setTanks(newTanks);
  };

  const handleDeleteNote = (tankId, noteId) => {
    if(!window.confirm("Delete this note?")) return;
    const newTanks = [...tanks];
    const tank = newTanks.find(t => t.id === tankId);
    tank.notes = tank.notes.filter(n => n.id !== noteId);
    setTanks(newTanks);
  };

  const resetData = () => {
    if(window.confirm("Are you sure? This will delete ALL history.")) {
      setTanks(INITIAL_DATA);
      localStorage.removeItem('aquariumDataV16');
    }
  };

  // --- BACKUP & RESTORE ---
  const backupData = () => {
    const jsonString = JSON.stringify(tanks, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tank-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  const restoreData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (Array.isArray(importedData)) {
          if(window.confirm("This will overwrite your current data with the backup. Continue?")) {
            setTanks(importedData);
            alert("Data restored successfully!");
          }
        } else {
          alert("Invalid file format.");
        }
      } catch (err) {
        alert("Error reading file. Make sure it is a valid JSON backup.");
      }
    };
    reader.readAsText(file);
    event.target.value = null; 
  };

  return (
    <Router>
      <div className="app-container">
        {isSidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)}/>}
        
        {/* REUSED ITEM MODAL */}
        <ItemModal 
          isOpen={isModalOpen} 
          onClose={() => setModalOpen(false)} 
          onSave={handleSaveItem}
          onDelete={handleDeleteItem}
          itemToEdit={editingItem} 
        />

        <input 
          type="file" 
          ref={fileInputRef} 
          style={{display: 'none'}} 
          accept=".json" 
          onChange={restoreData} 
        />

        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h1>Tank Tracker</h1>
            <button onClick={() => setSidebarOpen(false)} style={{background:'none', border:'none', color:'white'}} className="lg-hidden"><X size={24}/></button>
          </div>
          <nav className="sidebar-nav">
            <Link to="/" onClick={() => setSidebarOpen(false)} className="nav-link">Dashboard (Overview)</Link>
            <div className="section-label">Swipe Lists</div>
            <Link to="/swipe/home" onClick={() => setSidebarOpen(false)} className="nav-link">Home Aquariums</Link>
            <Link to="/swipe/hermit" onClick={() => setSidebarOpen(false)} className="nav-link">Jackson's Hermit Crabs</Link>
            <Link to="/swipe/plants" onClick={() => setSidebarOpen(false)} className="nav-link">Plants</Link>
            <Link to="/swipe/meemaw" onClick={() => setSidebarOpen(false)} className="nav-link">Meemaw's Tank</Link>
            <Link to="/swipe/rodi" onClick={() => setSidebarOpen(false)} className="nav-link">RODI</Link>

            <div className="section-label">Data Settings</div>
            <button onClick={backupData} className="nav-link" style={{background:'none', border:'none', width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer'}}>
              <Download size={18} /> Backup Data
            </button>
            <button onClick={triggerFileUpload} className="nav-link" style={{background:'none', border:'none', width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer'}}>
              <Upload size={18} /> Restore Data
            </button>
          </nav>
        </aside>

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
                  onAddNote={handleAddNote}       
                  onDeleteNote={handleDeleteNote}
                  onEditItem={openEditModal}
                  onReset={resetData} 
                />
              } />
              <Route path="/swipe/:category" element={
                <SwipeWrapper 
                  tanks={tanks} 
                  onComplete={handleComplete} 
                  onAddNote={handleAddNote}      
                  onDeleteNote={handleDeleteNote}
                />
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <button className="fab-add" onClick={openAddModal}>
            <Plus size={32} />
          </button>
        </main>
      </div>
    </Router>
  );
}

const SwipeWrapper = ({ tanks, onComplete, onAddNote, onDeleteNote }) => {
  const { category } = useParams();
  const filteredTanks = tanks.filter(t => t.category === category);
  return <SwipeView tanks={filteredTanks} onComplete={onComplete} onAddNote={onAddNote} onDeleteNote={onDeleteNote} categoryName={category} />;
};

// --- DASHBOARD COMPONENT ---
const CleanDashboard = ({ tanks, onComplete, onDeleteHistory, onAddNote, onDeleteNote, onEditItem, onReset }) => {
  const [expandedTankId, setExpandedTankId] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);
  const [noteInput, setNoteInput] = useState("");

  const toggleTank = (id) => {
    setExpandedTankId(expandedTankId === id ? null : id);
    setNoteInput("");
  };

  const toggleHistory = (e, uniqueKey) => {
    e.stopPropagation();
    setExpandedTask(expandedTask === uniqueKey ? null : uniqueKey);
  };

  const handleEditClick = (e, tank) => {
    e.stopPropagation();
    onEditItem(tank);
  };

  const submitNote = (tankId) => {
    onAddNote(tankId, noteInput);
    setNoteInput("");
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
      <div className="status-banner">
        <div>
          <h1 style={{margin:0, fontSize:'1.5rem', color:'#1e293b'}}>My Aquarium</h1>
          <p style={{margin:0, color:'#64748b'}}>Overview</p>
        </div>
        <div className={`status-badge ${totalOverdue > 0 ? 'red' : 'green'}`}>
          {totalOverdue > 0 ? `${totalOverdue} Tasks Overdue` : "All Systems Normal"}
        </div>
      </div>

      <div>
        {tanks.map(tank => {
          const isOpen = expandedTankId === tank.id;
          const tankOverdueCount = tank.tasks.filter(t => {
            if (!t.lastCompleted) return true;
            return differenceInDays(new Date(), addDays(new Date(t.lastCompleted), t.frequency)) > 0;
          }).length;
          
          return (
            <div key={tank.id} className={`tank-card ${isOpen ? 'open' : ''}`}>
              <button onClick={() => toggleTank(tank.id)} className="card-header">
                <div className="header-content">
                  <div className="tank-info">
                    <div className={`status-dot ${tankOverdueCount > 0 ? 'red' : 'green'}`} />
                    <div className="tank-details">
                      <div className="title-row">
                        <h3>{tank.name}</h3>
                        <div 
                          role="button" 
                          tabIndex={0}
                          className="btn-edit-icon" 
                          onClick={(e) => handleEditClick(e, tank)}
                          title="Edit Name & Frequency"
                        >
                          <Pencil size={14} />
                        </div>
                      </div>
                      <p>{tank.size} • {tank.type}</p>
                    </div>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={20} color="#3b82f6" /> : <ChevronDown size={20} color="#cbd5e1" />}
              </button>

              {isOpen && (
                <div className="card-body">
                  {tank.tasks.map((task, index) => {
                    const lastDate = task.lastCompleted ? new Date(task.lastCompleted) : null;
                    const nextDate = lastDate ? addDays(lastDate, task.frequency) : new Date();
                    const daysDiff = differenceInDays(new Date(), nextDate);
                    const isOverdue = lastDate ? daysDiff > 0 : true;
                    const uiKey = `${tank.id}-${index}`;
                    
                    const isLargeTank = parseInt(tank.size) > 29;
                    const isWaterChange = task.name.toLowerCase().includes("water change");
                    const showSideButtons = isLargeTank && isWaterChange && tank.type !== 'Terrarium';

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

                        {expandedTask === uiKey && (
                           <div style={{marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid #e2e8f0'}}>
                             <p style={{fontSize:'0.75rem', fontWeight:'bold', color:'#94a3b8', textTransform:'uppercase'}}>History</p>
                             {task.history && task.history.length > 0 ? (
                               <ul style={{listStyle:'none', padding:0, margin:'0.5rem 0'}}>
                                 {task.history.slice(0, 3).map((entry, hIndex) => (
                                   <li key={hIndex} style={{display:'flex', justifyContent:'space-between', padding:'0.25rem 0', color:'#64748b', fontSize:'0.9rem'}}>
                                     <span>
                                         {format(new Date(entry.date || entry), 'MMM d')} 
                                         {entry.side && <span style={{marginLeft:'8px', padding:'2px 6px', background:'#e2e8f0', borderRadius:'4px', fontSize:'0.75rem'}}>{entry.side}</span>}
                                     </span>
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

                  <div className="notes-section">
                    <div className="notes-title">Notes</div>
                    <div className="note-input-group">
                      <input 
                        type="text" 
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Add a note..."
                        className="note-input"
                        onKeyDown={(e) => e.key === 'Enter' && submitNote(tank.id)}
                      />
                      <button onClick={() => submitNote(tank.id)} className="btn-add">
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="notes-list">
                      {tank.notes && tank.notes.length > 0 ? (
                        tank.notes.map((note) => (
                          <div key={note.id} className="note-item">
                            <div className="note-content">
                              <span className="note-date">{format(new Date(note.date), 'MMM d, h:mm a')}</span>
                              <span>{note.text}</span>
                            </div>
                            <button onClick={() => onDeleteNote(tank.id, note.id)} className="btn-delete-note"><Trash2 size={14} /></button>
                          </div>
                        ))
                      ) : <p style={{fontSize:'0.85rem', color:'#cbd5e1', fontStyle:'italic', textAlign:'center'}}>No notes yet.</p>}
                    </div>
                  </div>
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