import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useParams, Navigate } from 'react-router-dom';
import { differenceInDays, addDays, format } from 'date-fns';
import { CheckCircle, Clock, Trash2, ChevronUp, ChevronDown, Menu, X, Plus, Download, Upload, Pencil, Save, XCircle, Image as ImageIcon, Settings, AlertCircle, FileJson, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import SwipeView from './SwipeView';
import './App.css'; 

// --- FULL DATA CONFIGURATION (V46) ---
const INITIAL_DATA = [
  {
    id: 1, name: "The Monster", category: "home", type: "Freshwater", size: "135 Gallon",
    image: null,
    notes: [],
    tasks: [
      { name: "Water Change", frequency: 7, lastCompleted: null, history: [] },
      { name: "Clean Canister Filters", frequency: 30, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 2, name: "Saltwater Reef", category: "home", type: "Saltwater", size: "29 Gallon",
    image: null,
    notes: [],
    tasks: [
      { name: "Water Change", frequency: 7, lastCompleted: null, history: [] },
      { name: "Empty Skimmer Cup", frequency: 3, lastCompleted: null, history: [] },
      { name: "Check Salinity", frequency: 7, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 3, name: "Community Tank", category: "home", type: "Freshwater", size: "50 Gallon",
    image: null,
    notes: [],
    tasks: [
      { name: "Water Change", frequency: 7, lastCompleted: null, history: [] },
      { name: "Rinse Sponge Media", frequency: 14, lastCompleted: null, history: [] }
    ]
  },
  {
    id: 4, name: "Betta Tank", category: "home", type: "Freshwater", size: "3 Gallon",
    image: null,
    notes: [],
    tasks: [{ name: "Water Change", frequency: 7, lastCompleted: null, history: [] }]
  },
  {
    id: 5, name: "Meemaw's Cichlids", category: "meemaw", type: "Cichlid", size: "65 Gallon",
    image: null,
    notes: [],
    tasks: [{ name: "Water Change", frequency: 7, lastCompleted: null, history: [] }]
  },
  {
    id: 6, name: "Jackson's Hermit Crabs", category: "hermit", type: "Terrarium", size: "55 Gallon",
    image: null,
    notes: [],
    tasks: [{ name: "Water Change", frequency: 2, lastCompleted: null, history: [] }]
  },
  {
    id: 701, name: "Living Room Plants", category: "plants", type: "Houseplant", size: "Pot",
    image: null,
    notes: [],
    tasks: [{ name: "Watering", frequency: 7, lastCompleted: null, history: [] }]
  },
  {
    id: 702, name: "Aloe", category: "plants", type: "Succulent", size: "Pot",
    image: null,
    notes: [],
    tasks: [{ name: "Watering", frequency: 14, lastCompleted: null, history: [] }]
  },
  {
    id: 703, name: "Bedroom Plants", category: "plants", type: "Houseplant", size: "Pot",
    image: null,
    notes: [],
    tasks: [{ name: "Watering", frequency: 7, lastCompleted: null, history: [] }]
  },
  {
    id: 801, name: "Filter 1", category: "rodi", type: "Sediment", size: "Stage 1",
    image: null,
    notes: [],
    tasks: [{ name: "Replace Filter", frequency: 180, lastCompleted: null, history: [] }]
  },
  {
    id: 802, name: "Filter 2", category: "rodi", type: "Carbon Block", size: "Stage 2",
    image: null,
    notes: [],
    tasks: [{ name: "Replace Filter", frequency: 180, lastCompleted: null, history: [] }]
  },
  {
    id: 803, name: "Filter 3", category: "rodi", type: "Carbon Block", size: "Stage 3",
    image: null,
    notes: [],
    tasks: [{ name: "Replace Filter", frequency: 180, lastCompleted: null, history: [] }]
  },
  {
    id: 804, name: "Filter 4", category: "rodi", type: "RO Membrane", size: "Stage 4",
    image: null,
    notes: [],
    tasks: [{ name: "Replace Filter", frequency: 730, lastCompleted: null, history: [] }]
  },
  {
    id: 805, name: "Filter 5", category: "rodi", type: "Deionization", size: "Stage 5",
    image: null,
    notes: [],
    tasks: [{ name: "Replace Filter", frequency: 90, lastCompleted: null, history: [] }]
  },
  {
    id: 806, name: "Filter 6", category: "rodi", type: "Polishing", size: "Stage 6",
    image: null,
    notes: [],
    tasks: [{ name: "Replace Filter", frequency: 180, lastCompleted: null, history: [] }]
  }
];

const DEFAULT_CATEGORIES = ['home', 'hermit', 'plants', 'meemaw', 'rodi'];

// --- CELEBRATION LOGIC ---
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

// --- WRAPPER BUTTON FOR ANIMATION ---
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

// --- THEME MODAL ---
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

// --- ITEM MODAL ---
const ItemModal = ({ isOpen, onClose, onSave, onDelete, itemToEdit, availableCategories }) => {
  const defaultState = {
    name: '',
    category: 'home',
    type: '',
    size: '',
    image: null,
    tasks: [] 
  };

  const [formData, setFormData] = useState(defaultState);
  const [isNewCategoryMode, setIsNewCategoryMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskFreq, setNewTaskFreq] = useState(7);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsNewCategoryMode(false);
      setNewCategoryName("");
      setNewTaskName("");
      setNewTaskFreq(7);

      if (itemToEdit) {
        setFormData({
          name: itemToEdit.name,
          category: itemToEdit.category,
          type: itemToEdit.type,
          size: itemToEdit.size,
          image: itemToEdit.image || null,
          tasks: itemToEdit.tasks || []
        });
      } else {
        setFormData({
            ...defaultState,
            tasks: [{ name: "Water Change", frequency: 7, lastCompleted: null, history: [] }]
        });
      }
    }
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category' && value === 'NEW_CATEGORY_OPTION') {
        setIsNewCategoryMode(true);
        setFormData(prev => ({ ...prev, category: '' }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveTask = (indexToRemove) => {
    setFormData(prev => ({
        ...prev,
        tasks: prev.tasks.filter((_, i) => i !== indexToRemove)
    }));
  };

  const handleAddTask = () => {
    if(!newTaskName.trim()) return;
    setFormData(prev => ({
        ...prev,
        tasks: [...prev.tasks, { name: newTaskName, frequency: parseInt(newTaskFreq), lastCompleted: null, history: [] }]
    }));
    setNewTaskName("");
    setNewTaskFreq(7);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let finalCategory = formData.category;
    if (isNewCategoryMode) {
        const safeId = newCategoryName.trim().toLowerCase().replace(/\s+/g, '-');
        if(!safeId) return alert("Please enter a category name");
        finalCategory = safeId;
    }
    if (formData.tasks.length === 0) {
        if(!window.confirm("This item has no tasks. Are you sure?")) return;
    }
    onSave({ ...formData, category: finalCategory }, isNewCategoryMode ? newCategoryName : null);
    onClose();
  };

  const handleDeleteClick = () => {
    if (itemToEdit) onDelete(itemToEdit.id);
  };

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
          <div style={{marginBottom:'1rem', display:'flex', flexDirection:'column', alignItems:'center'}}>
             <div 
               style={{
                 width:'80px', height:'80px', borderRadius:'50%', 
                 backgroundColor:'var(--bg-card-secondary)', border:'2px dashed var(--border-color)',
                 display:'flex', alignItems:'center', justifyContent:'center',
                 overflow:'hidden', cursor:'pointer', position:'relative'
               }}
               onClick={() => fileInputRef.current.click()}
             >
                {formData.image ? (
                    <img src={formData.image} alt="Preview" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                    <div style={{textAlign:'center', color:'var(--text-secondary)'}}>
                        <ImageIcon size={20} style={{marginBottom:'2px'}}/>
                        <div style={{fontSize:'0.6rem'}}>Add Photo</div>
                    </div>
                )}
             </div>
             <input type="file" ref={fileInputRef} style={{display:'none'}} accept="image/*" onChange={handleImageUpload} />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            {!isNewCategoryMode ? (
                <select name="category" value={formData.category} onChange={handleChange} className="form-select">
                    {availableCategories.map(cat => (
                        <option key={cat} value={cat}>
                            {cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                    ))}
                    <option value="NEW_CATEGORY_OPTION">+ Create New Category...</option>
                </select>
            ) : (
                <div style={{display:'flex', gap:'0.5rem'}}>
                    <input autoFocus placeholder="Enter new category name..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="form-input" required />
                    <button type="button" onClick={() => setIsNewCategoryMode(false)} className="btn-cancel" style={{padding:'0.6rem'}}>Cancel</button>
                </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Name</label>
            <input name="name" placeholder="e.g. Quarantine Tank" value={formData.name} onChange={handleChange} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <input name="type" placeholder="e.g. Freshwater" value={formData.type} onChange={handleChange} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Size</label>
            <input name="size" placeholder="e.g. 10 Gallon" value={formData.size} onChange={handleChange} className="form-input" required />
          </div>

          <div className="form-group" style={{marginTop:'1.5rem', borderTop:'1px solid var(--border-color)', paddingTop:'1rem'}}>
            <label className="form-label" style={{marginBottom:'0.5rem'}}>Tasks & Schedule</label>
            <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1rem'}}>
                {formData.tasks.map((task, index) => (
                    <div key={index} style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg-card-secondary)', padding:'0.5rem', borderRadius:'6px'}}>
                        <div style={{fontSize:'0.9rem'}}>
                            <strong>{task.name}</strong> <span style={{color:'var(--text-secondary)'}}>(Every {task.frequency} days)</span>
                        </div>
                        <button type="button" onClick={() => handleRemoveTask(index)} style={{background:'none', border:'none', color:'var(--status-bad-text)', cursor:'pointer'}}><X size={16}/></button>
                    </div>
                ))}
            </div>
            <div style={{display:'flex', gap:'0.5rem', alignItems:'flex-end'}}>
                <div style={{flex:2}}>
                    <input placeholder="New Task Name..." value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} className="form-input" style={{fontSize:'0.9rem'}} />
                </div>
                <div style={{flex:1}}>
                    <input type="number" placeholder="Days" value={newTaskFreq} onChange={(e) => setNewTaskFreq(e.target.value)} className="form-input" style={{fontSize:'0.9rem'}} min="1" />
                </div>
                <button type="button" onClick={handleAddTask} className="btn-save" style={{padding:'0.6rem', height:'auto'}}>Add</button>
            </div>
          </div>

          <div className="modal-actions">
            {itemToEdit && (
                <button type="button" onClick={handleDeleteClick} className="btn-delete-modal"><Trash2 size={18} /> Delete Item</button>
            )}
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-save">{buttonText}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  const [tanks, setTanks] = useState(() => {
    const saved = localStorage.getItem('aquariumDataV46'); 
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('aquariumCategoriesV2');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('appTheme') || 'original';
  });

  const [fileHandle, setFileHandle] = useState(null);
  const [lastSaved, setLastSaved] = useState(null); 
  const [lastBackedUp, setLastBackedUp] = useState(null); // --- NEW STATE: Last File Backup

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isThemeModalOpen, setThemeModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 
  const fileInputRef = useRef(null);

  // Check for mobile support for the File API
  const isDesktop = 'showSaveFilePicker' in window;

  useEffect(() => {
    if (currentTheme === 'original') {
        document.body.className = '';
    } else {
        document.body.className = `theme-${currentTheme}`;
    }
    localStorage.setItem('appTheme', currentTheme);
  }, [currentTheme]);

  // --- PRIMARY MOBILE AUTO-SAVE (LocalStorage) ---
  useEffect(() => {
    localStorage.setItem('aquariumDataV46', JSON.stringify(tanks));
    setLastSaved(new Date()); // Update local save indicator
  }, [tanks]);

  useEffect(() => {
    localStorage.setItem('aquariumCategoriesV2', JSON.stringify(categories));
  }, [categories]);

  // --- DESKTOP FILE AUTO-SAVE ---
  useEffect(() => {
    if (!fileHandle) return;
    const saveToFile = async () => {
      try {
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify({ tanks, categories }, null, 2));
        await writable.close();
        setLastBackedUp(new Date()); // Update file backup indicator
      } catch (err) { console.error("Auto-save failed:", err); }
    };
    saveToFile();
  }, [tanks, categories, fileHandle]);

  const setupAutoSave = async () => {
    if (!isDesktop) {
        alert("File auto-save is only supported on Desktop (Chrome/Edge). On mobile, your data is automatically saved to the app storage.");
        return;
    }
    try {
        const handle = await window.showSaveFilePicker({
            suggestedName: `tank-backup-${format(new Date(), 'yyyy-MM-dd')}.json`,
            types: [{ description: 'JSON File', accept: { 'application/json': ['.json'] } }],
        });
        setFileHandle(handle);
        setLastBackedUp(new Date()); // Initial backup timestamp
        alert("Auto-save enabled! Your changes will now be written to this file automatically.");
    } catch (err) { }
  };

  const openAddModal = () => { setEditingItem(null); setModalOpen(true); };
  const openEditModal = (item) => { setEditingItem(item); setModalOpen(true); };

  const handleDeleteItem = (id) => {
    if(window.confirm("Are you sure you want to delete this item?")) {
        setTanks(prevTanks => prevTanks.filter(item => item.id !== id));
        setModalOpen(false); 
    }
  };

  const handleSaveItem = (formData, newCategoryLabel) => {
    if (newCategoryLabel) {
        if (!categories.includes(formData.category)) {
            setCategories(prev => [...prev, formData.category]);
        }
    }

    if (editingItem) {
      setTanks(prevTanks => prevTanks.map(tank => {
        if (tank.id === editingItem.id) {
          const mergedTasks = formData.tasks.map(newTask => {
            const existingTask = tank.tasks.find(t => t.name === newTask.name);
            if (existingTask) {
                return { ...newTask, history: existingTask.history, lastCompleted: existingTask.lastCompleted };
            }
            return newTask;
          });

          return { ...tank, name: formData.name, category: formData.category, type: formData.type, size: formData.size, image: formData.image, tasks: mergedTasks };
        }
        return tank;
      }));
    } else {
      const newItem = { id: Date.now(), name: formData.name, category: formData.category, type: formData.type, size: formData.size, image: formData.image, notes: [], tasks: formData.tasks };
      setTanks(prev => [...prev, newItem]);
    }
  };

  const handleComplete = (tankId, taskIndex, side = null) => {
    setTanks(prevTanks => prevTanks.map(tank => {
        if (tank.id !== tankId) return tank;
        const newTasks = tank.tasks.map((task, idx) => {
            if (idx !== taskIndex) return task;
            const now = new Date().toISOString();
            return {
                ...task,
                lastCompleted: now,
                history: [{ date: now, side: side }, ...task.history]
            };
        });
        return { ...tank, tasks: newTasks };
    }));
  };

  const handleDeleteHistory = (tankId, taskIndex, historyIndex) => {
    if(!window.confirm("Delete this history entry?")) return;
    setTanks(prevTanks => prevTanks.map(tank => {
        if (tank.id !== tankId) return tank;
        const newTasks = tank.tasks.map((task, idx) => {
            if (idx !== taskIndex) return task;
            const newHistory = [...task.history];
            newHistory.splice(historyIndex, 1);
            let newLastCompleted = null;
            if(newHistory.length > 0) {
                const newest = newHistory[0];
                newLastCompleted = typeof newest === 'string' ? newest : newest.date;
            }
            return { ...task, lastCompleted: newLastCompleted, history: newHistory };
        });
        return { ...tank, tasks: newTasks };
    }));
  };

  const handleEditHistory = (tankId, taskIndex, historyIndex, newDateString) => {
    setTanks(prevTanks => prevTanks.map(tank => {
        if (tank.id !== tankId) return tank;
        const newTasks = tank.tasks.map((task, idx) => {
            if (idx !== taskIndex) return task;
            const [year, month, day] = newDateString.split('-').map(Number);
            const fixedDate = new Date(year, month - 1, day);
            const newIsoString = fixedDate.toISOString();
            const newHistory = [...task.history];
            const entry = newHistory[historyIndex];
            if (typeof entry === 'object') {
                newHistory[historyIndex] = { ...entry, date: newIsoString };
            } else {
                newHistory[historyIndex] = newIsoString;
            }
            newHistory.sort((a, b) => {
                const dateA = new Date(typeof a === 'string' ? a : a.date);
                const dateB = new Date(typeof b === 'string' ? b : b.date);
                return dateB - dateA; 
            });
            let newLastCompleted = null;
            if(newHistory.length > 0) {
                const newest = newHistory[0];
                newLastCompleted = typeof newest === 'string' ? newest : newest.date;
            }
            return { ...task, lastCompleted: newLastCompleted, history: newHistory };
        });
        return { ...tank, tasks: newTasks };
    }));
  };

  const handleAddNote = (tankId, text) => {
    if (!text.trim()) return;
    setTanks(prevTanks => prevTanks.map(tank => {
        if (tank.id !== tankId) return tank;
        const newNote = { id: Date.now(), date: new Date().toISOString(), text: text };
        return { ...tank, notes: [newNote, ...tank.notes] };
    }));
  };

  const handleDeleteNote = (tankId, noteId) => {
    if(!window.confirm("Delete this note?")) return;
    setTanks(prevTanks => prevTanks.map(tank => {
        if (tank.id !== tankId) return tank;
        return { ...tank, notes: tank.notes.filter(n => n.id !== noteId) };
    }));
  };

  const resetData = () => {
    if(window.confirm("Are you sure? This will delete ALL history.")) {
      setTanks(INITIAL_DATA);
      setCategories(DEFAULT_CATEGORIES);
      localStorage.removeItem('aquariumDataV46');
      localStorage.removeItem('aquariumCategoriesV2');
    }
  };

  const backupData = () => {
    const backupObj = { tanks, categories };
    const jsonString = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tank-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setLastBackedUp(new Date()); // Update manual backup indicator
  };

  const triggerFileUpload = () => { fileInputRef.current.click(); };

  const restoreData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (window.confirm("This will overwrite your current data with the backup. Continue?")) {
            if (Array.isArray(importedData)) {
                setTanks(importedData);
            } else if (importedData.tanks && importedData.categories) {
                setTanks(importedData.tanks);
                setCategories(importedData.categories);
            }
            alert("Data restored successfully!");
        }
      } catch (err) {
        alert("Error reading file.");
      }
    };
    reader.readAsText(file);
    event.target.value = null; 
  };

  return (
    <Router>
      <div className="app-container">
        {isSidebarOpen && <div className="mobile-overlay open" onClick={() => setSidebarOpen(false)}/>}
        
        <ItemModal 
          isOpen={isModalOpen} 
          onClose={() => setModalOpen(false)} 
          onSave={handleSaveItem}
          onDelete={handleDeleteItem}
          itemToEdit={editingItem}
          availableCategories={categories} 
        />

        <ThemeModal
            isOpen={isThemeModalOpen}
            onClose={() => setThemeModalOpen(false)}
            currentTheme={currentTheme}
            setTheme={setCurrentTheme}
        />

        <input type="file" ref={fileInputRef} style={{display: 'none'}} accept=".json" onChange={restoreData} />

        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h1>Tank Tracker</h1>
            <button onClick={() => setSidebarOpen(false)} style={{background:'none', border:'none', color:'white'}} className="lg-hidden"><X size={24}/></button>
          </div>
          <nav className="sidebar-nav">
            <Link to="/" onClick={() => setSidebarOpen(false)} className="nav-link">Dashboard (Overview)</Link>
            <div className="section-label">Swipe Lists</div>
            {categories.map(cat => (
                <Link key={cat} to={`/swipe/${cat}`} onClick={() => setSidebarOpen(false)} className="nav-link">
                    {cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Link>
            ))}
            <div className="section-label">Settings</div>
            
            {/* SAVED STATUS INDICATORS */}
            <div style={{padding:'0.5rem 1rem', fontSize:'0.75rem', color:'rgba(255,255,255,0.5)', display:'flex', flexDirection:'column', gap:'0.25rem'}}>
                <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                    <CheckCircle size={12} color={lastSaved ? "#4ade80" : "gray"} />
                    {lastSaved ? `App Data: ${format(lastSaved, 'MM/dd/yyyy h:mm:ss a')}` : 'App Data: Not saved'}
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                    <Save size={12} color={lastBackedUp ? "#60a5fa" : "gray"} />
                    {lastBackedUp ? `File Backup: ${format(lastBackedUp, 'MM/dd/yyyy h:mm:ss a')}` : 'File Backup: Never'}
                </div>
            </div>

            <button onClick={() => {setThemeModalOpen(true); setSidebarOpen(false);}} className="nav-link" style={{background:'none', border:'none', width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer'}}>
              <Settings size={18} /> Select Theme
            </button>
            
            {/* FILE AUTO-SAVE (Desktop Only) */}
            {isDesktop && (
                <button onClick={setupAutoSave} className="nav-link" style={{background:'none', border:'none', width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer'}}>
                    {fileHandle ? <CheckCircle size={18} color="var(--status-good-text)" /> : <FileJson size={18} />}
                    {fileHandle ? "File Auto-Save On" : "Enable File Auto-Save"}
                </button>
            )}

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
            <button onClick={() => setSidebarOpen(true)} style={{background:'none', border:'none'}}><Menu size={24} color="var(--text-main)" /></button>
            <h2>My Tanks</h2>
          </header>
          <div className="content-scroll-area">
            <Routes>
              <Route path="/" element={<CleanDashboard tanks={tanks} onComplete={handleComplete} onDeleteHistory={handleDeleteHistory} onEditHistory={handleEditHistory} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} onEditItem={openEditModal} onReset={resetData} />} />
              
              <Route path="/swipe/:category" element={
                <SwipeWrapper 
                  tanks={tanks} 
                  onComplete={handleComplete} 
                  onAddNote={handleAddNote} 
                  onDeleteNote={handleDeleteNote} 
                  onDeleteHistory={handleDeleteHistory} 
                  onEditHistory={handleEditHistory} 
                  onEditItem={openEditModal} 
                />
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <button className="fab-add" onClick={openAddModal}><Plus size={32} /></button>
        </main>
      </div>
    </Router>
  );
}

const SwipeWrapper = ({ tanks, onComplete, onAddNote, onDeleteNote, onDeleteHistory, onEditHistory, onEditItem }) => {
  const { category } = useParams();
  const filteredTanks = tanks.filter(t => t.category === category);
  return (
    <SwipeView 
        tanks={filteredTanks} 
        categoryName={category} 
        onComplete={onComplete} 
        onAddNote={onAddNote} 
        onDeleteNote={onDeleteNote} 
        onDeleteHistory={onDeleteHistory}
        onEditHistory={onEditHistory}
        onEditItem={onEditItem}
    />
  );
};

const CleanDashboard = ({ tanks, onComplete, onDeleteHistory, onEditHistory, onAddNote, onDeleteNote, onEditItem, onReset }) => {
  const [expandedTankId, setExpandedTankId] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [editingEntryId, setEditingEntryId] = useState(null); 
  const [editDateValue, setEditDateValue] = useState("");

  const toggleTank = (id) => { setExpandedTankId(expandedTankId === id ? null : id); setNoteInput(""); };
  const toggleHistory = (e, uniqueKey) => { e.stopPropagation(); setExpandedTask(expandedTask === uniqueKey ? null : uniqueKey); setEditingEntryId(null); };
  const handleEditClick = (e, tank) => { e.stopPropagation(); onEditItem(tank); };
  
  const startEditing = (tankId, taskIdx, histIdx, currentDateStr) => {
    setEditingEntryId(`${tankId}-${taskIdx}-${histIdx}`);
    const dateObj = new Date(currentDateStr);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    setEditDateValue(`${yyyy}-${mm}-${dd}`);
  };

  const saveEdit = (tankId, taskIdx, histIdx) => {
    if (editDateValue) onEditHistory(tankId, taskIdx, histIdx, editDateValue);
    setEditingEntryId(null);
  };

  const submitNote = (tankId) => { onAddNote(tankId, noteInput); setNoteInput(""); };

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
          <h1 style={{margin:0, fontSize:'1.5rem', color:'var(--text-main)'}}>My Aquarium</h1>
          <p style={{margin:0, color:'var(--text-secondary)'}}>Overview</p>
        </div>
        <div className={`status-badge ${totalOverdue > 0 ? 'red' : 'green'}`}>
          {totalOverdue > 0 ? `${totalOverdue} Tasks Overdue` : "All Systems Normal"}
        </div>
      </div>

      <div className="tanks-list">
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
                    {tank.image ? (
                        <div style={{position:'relative', marginRight:'1rem'}}>
                            <img src={tank.image} alt="" style={{width:'48px', height:'48px', borderRadius:'50%', objectFit:'cover', border:'1px solid #e2e8f0'}} />
                            <div className={`status-dot ${tankOverdueCount > 0 ? 'red' : 'green'}`} style={{position:'absolute', bottom:0, right:0, border:'2px solid white'}} />
                        </div>
                    ) : (
                        <div className={`status-dot ${tankOverdueCount > 0 ? 'red' : 'green'}`} />
                    )}
                    <div className="tank-details">
                      <div className="title-row">
                        <h3>{tank.name}</h3>
                        <div role="button" tabIndex={0} className="btn-edit-icon" onClick={(e) => handleEditClick(e, tank)}>
                          <Pencil size={14} />
                        </div>
                      </div>
                      <p>{tank.size} • {tank.type}</p>
                    </div>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={20} color="var(--primary-color)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
              </button>

              {isOpen && (
                <div className="card-body">
                  {tank.tasks.map((task, index) => {
                    const lastDate = task.lastCompleted ? new Date(task.lastCompleted) : null;
                    const nextDate = lastDate ? addDays(lastDate, task.frequency) : new Date();
                    const daysDiff = differenceInDays(new Date(), nextDate);
                    const isOverdue = lastDate ? daysDiff > 0 : true;
                    const uiKey = `${tank.id}-${index}`;
                    
                    // --- SIDE BUTTON LOGIC ---
                    const gallons = parseInt(tank.size);
                    const isLarge = !isNaN(gallons) && gallons > 29;
                    const isWaterChange = task.name.toLowerCase().includes("water change");
                    
                    // --- AQUARIUM CHECK ---
                    const aquariumTypes = ['Freshwater', 'Saltwater', 'Cichlid', 'Coldwater', 'Brackish'];
                    const isAquarium = aquariumTypes.includes(tank.type);

                    const showSideButtons = isWaterChange && isLarge && isAquarium;
                    // ----------------------------------------

                    return (
                      <div key={index} className="task-item">
                        <div className="task-header">
                          <div>
                            <span style={{display:'block', fontWeight:600, color:'var(--text-main)'}}>{task.name}</span>
                            
                            {/* VISIBLE LAST DATE + DAY OF WEEK */}
                            <div style={{fontSize:'0.75rem', marginTop:'2px'}}>
                               <span style={{color:'var(--text-secondary)', marginRight:'6px'}}>
                                  {lastDate ? `Last: ${format(lastDate, 'EEE, MMM d')}` : 'Never'}
                               </span>
                               <span className={`due-text ${isOverdue ? 'red' : 'gray'}`}>
                                  {isOverdue ? `Due ${daysDiff} days ago` : `Due in ${Math.abs(daysDiff)} days`}
                               </span>
                            </div>
                          </div>
                          <button onClick={(e) => toggleHistory(e, uiKey)} style={{border:'none', background:'none', cursor:'pointer', color:'var(--text-secondary)'}}><Clock size={16} /></button>
                        </div>
                        <div className="btn-group">
                          {showSideButtons ? (
                            <>
                              <ConfettiButton onClick={() => onComplete(tank.id, index, 'Left')} className="btn btn-secondary">Left</ConfettiButton>
                              <ConfettiButton onClick={() => onComplete(tank.id, index, 'Right')} className="btn btn-secondary">Right</ConfettiButton>
                            </>
                          ) : (
                            <ConfettiButton onClick={() => onComplete(tank.id, index, null)} className="btn btn-primary"><CheckCircle size={16} /> Complete</ConfettiButton>
                          )}
                        </div>
                        {expandedTask === uiKey && (
                           <div style={{marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid var(--border-color)'}}>
                             <p style={{fontSize:'0.75rem', fontWeight:'bold', color:'var(--text-secondary)', textTransform:'uppercase'}}>History</p>
                             {task.history && task.history.length > 0 ? (
                               <ul style={{listStyle:'none', padding:0, margin:'0.5rem 0'}}>
                                 {task.history.slice(0, 5).map((entry, hIndex) => {
                                     const dateStr = typeof entry === 'string' ? entry : entry.date;
                                     const side = typeof entry === 'object' ? entry.side : null;
                                     const uniqueId = `${tank.id}-${index}-${hIndex}`;
                                     const isEditing = editingEntryId === uniqueId;
                                     return (
                                       <li key={hIndex} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0', borderBottom:'1px dashed var(--border-color)', fontSize:'0.9rem'}}>
                                         {isEditing ? (
                                           <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                                <input type="date" value={editDateValue} onChange={(e) => setEditDateValue(e.target.value)} style={{border:'1px solid #cbd5e1', borderRadius:'4px', padding:'2px 4px', fontSize:'0.85rem'}} />
                                                <button onClick={() => saveEdit(tank.id, index, hIndex)} style={{border:'none', background:'none', color:'var(--status-good-text)', cursor:'pointer'}}><Save size={16}/></button>
                                                <button onClick={() => setEditingEntryId(null)} style={{border:'none', background:'none', color:'var(--text-secondary)', cursor:'pointer'}}><XCircle size={16}/></button>
                                           </div>
                                         ) : (
                                           <div style={{color:'var(--text-secondary)'}}>
                                                {/* UPDATED: INCLUDE DAY OF WEEK IN HISTORY LIST */}
                                                <span style={{fontWeight:500}}>{format(new Date(dateStr), 'EEE, MMM d, yyyy')}</span>
                                                {side && <span style={{marginLeft:'8px', padding:'2px 6px', background:'var(--bg-card)', borderRadius:'4px', fontSize:'0.75rem'}}>{side}</span>}
                                           </div>
                                         )}
                                         {!isEditing && (
                                            <div style={{display:'flex', gap:'0.5rem'}}>
                                                <button onClick={() => startEditing(tank.id, index, hIndex, dateStr)} style={{border:'none', background:'none', color:'var(--primary-color)', cursor:'pointer'}}><Pencil size={14}/></button>
                                                <button onClick={() => onDeleteHistory(tank.id, index, hIndex)} style={{border:'none', background:'none', color:'var(--status-bad-text)', cursor:'pointer'}}><Trash2 size={14}/></button>
                                            </div>
                                         )}
                                       </li>
                                     );
                                 })}
                               </ul>
                             ) : <span style={{color:'var(--text-secondary)', fontStyle:'italic', fontSize:'0.9rem'}}>No history</span>}
                           </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="notes-section">
                    <div className="notes-title">Notes</div>
                    <div className="note-input-group">
                      <input type="text" value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Add a note..." className="note-input" onKeyDown={(e) => e.key === 'Enter' && submitNote(tank.id)} />
                      <button onClick={() => submitNote(tank.id)} className="btn-add"><Plus size={18} /></button>
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
                      ) : <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', fontStyle:'italic', textAlign:'center'}}>No notes yet.</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{textAlign:'center'}}>
        <button onClick={onReset} className="btn-reset"><Trash2 size={14}/> Reset All Data</button>
      </div>
    </div>
  );
};

export default App;