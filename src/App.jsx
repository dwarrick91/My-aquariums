import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useParams, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CheckCircle, Menu, X, Plus, Download, Upload, Save, Settings } from 'lucide-react';
import SwipeView from './SwipeView';
import './App.css'; 

// --- IMPORTS FROM MODULES ---
import { INITIAL_DATA, DEFAULT_CATEGORIES } from './data/initialData';
import ThemeModal from './components/ThemeModal';
import ItemModal from './components/ItemModal';
import Dashboard from './components/Dashboard';

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

  // --- PERSISTENT TIMESTAMP STATE (Backup Only) ---
  const [lastBackedUp, setLastBackedUp] = useState(() => {
    const saved = localStorage.getItem('lastBackedUpV1');
    return saved ? new Date(saved) : null;
  });

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isThemeModalOpen, setThemeModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentTheme === 'original') {
        document.body.className = '';
    } else {
        document.body.className = `theme-${currentTheme}`;
    }
    localStorage.setItem('appTheme', currentTheme);
  }, [currentTheme]);

  // --- AUTO-SAVE (LocalStorage Only) ---
  useEffect(() => {
    localStorage.setItem('aquariumDataV46', JSON.stringify(tanks));
  }, [tanks]);

  useEffect(() => {
    localStorage.setItem('aquariumCategoriesV2', JSON.stringify(categories));
  }, [categories]);

  // --- PERSIST BACKUP TIMESTAMP ---
  useEffect(() => {
    if (lastBackedUp) localStorage.setItem('lastBackedUpV1', lastBackedUp.toISOString());
  }, [lastBackedUp]);

  // --- MANUAL BACKUP (Download File) ---
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
    setLastBackedUp(new Date()); 
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
                    <Save size={12} color={lastBackedUp ? "#60a5fa" : "gray"} />
                    {lastBackedUp ? `File Backup: ${format(lastBackedUp, 'MM/dd/yyyy h:mm:ss a')}` : 'File Backup: Never'}
                </div>
            </div>

            <button onClick={() => {setThemeModalOpen(true); setSidebarOpen(false);}} className="nav-link" style={{background:'none', border:'none', width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer'}}>
              <Settings size={18} /> Select Theme
            </button>
            
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
              <Route path="/" element={<Dashboard tanks={tanks} onComplete={handleComplete} onDeleteHistory={handleDeleteHistory} onEditHistory={handleEditHistory} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} onEditItem={openEditModal} onReset={resetData} />} />
              
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

export default App;