import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { Clock, Trash2, Pencil, Save, XCircle, X, MessageSquare, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import confetti from 'canvas-confetti'; // <--- NEW IMPORT

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// --- 1. NEW: Confetti Helper Function ---
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

// --- 2. NEW: Wrapper Button for Animation ---
const ConfettiButton = ({ onClick, className, children, style }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleClick = (e) => {
    e.stopPropagation(); // Stop swiper from detecting a drag
    setIsAnimating(true);
    triggerCelebration();
    if (onClick) onClick(e);
    
    // Reset animation class after 500ms
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

export default function SwipeView({ tanks, onComplete, onDeleteHistory, onEditHistory, onEditItem, onAddNote, onDeleteNote, categoryName }) {
  const [historyTarget, setHistoryTarget] = useState(null); 
  const [notesOpenId, setNotesOpenId] = useState(null);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editDateValue, setEditDateValue] = useState("");
  const [noteInput, setNoteInput] = useState("");

  let displayTitle = categoryName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  if(categoryName === 'hermit') displayTitle = "Jackson's Hermit Crabs";
  if(categoryName === 'home') displayTitle = "Home Aquariums";
  if(categoryName === 'meemaw') displayTitle = "Meemaw's Tank";
  if(categoryName === 'rodi') displayTitle = "RODI";

  const startEditing = (uniqueId, currentDateStr) => {
    setEditingEntryId(uniqueId);
    const dateObj = new Date(currentDateStr);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    setEditDateValue(`${yyyy}-${mm}-${dd}`);
  };

  const saveEdit = (tankId, taskIndex, histIndex) => {
    if (editDateValue) {
        onEditHistory(tankId, taskIndex, histIndex, editDateValue);
    }
    setEditingEntryId(null);
  };

  const submitNote = (tankId) => {
    if (!noteInput.trim()) return;
    onAddNote(tankId, noteInput);
    setNoteInput("");
  };

  const toggleHistory = (tankId, taskIndex) => {
    if (historyTarget && historyTarget.tankId === tankId && historyTarget.taskIndex === taskIndex) {
        setHistoryTarget(null);
    } else {
        setHistoryTarget({ tankId, taskIndex });
    }
    setNotesOpenId(null);
  };

  const toggleNotes = (id) => {
    setNotesOpenId(notesOpenId === id ? null : id);
    setHistoryTarget(null);
    setNoteInput("");
  };

  const containerStyle = {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '0.5rem',
    overflowX: 'hidden'
  };

  if (!tanks || tanks.length === 0) {
    return (
      <div style={{...containerStyle, justifyContent:'center', color: 'var(--text-secondary)'}}>
        <p>No items found in {displayTitle}.</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{fontSize:'1.25rem', fontWeight:'bold', color:'var(--text-main)', marginBottom:'0.5rem', textTransform:'capitalize', textAlign: 'center'}}>
        {displayTitle}
      </h2>
      
      <div style={{width:'100%', maxWidth:'100%', height:'calc(100vh - 130px)', margin: '0 auto', minHeight: '480px', overflow: 'hidden'}}>
        <Swiper
          modules={[Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={true}
          pagination={{ clickable: true }}
          style={{height:'100%', paddingBottom:'30px'}}
        >
          {tanks.map((tank) => {
            const isLargeTank = parseInt(tank.size) > 29;
            const isTerrarium = tank.type === "Terrarium";
            const isNotesOpen = notesOpenId === tank.id;

            return (
              <SwiperSlide key={tank.id} style={{
                background: 'var(--bg-card)', 
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                height: '100%', position: 'relative'
              }}>
                {/* Header Section */}
                <div style={{height:'80px', background:'var(--primary-gradient)', flexShrink: 0}}></div>
                <div style={{marginTop:'-40px', textAlign:'center', padding:'0 1rem', flexShrink: 0, position:'relative'}}>
                   {/* Notes Button Top Right */}
                   <button onClick={() => toggleNotes(tank.id)} style={{position:'absolute', right:'1rem', top:'50px', border:'none', background:'none', color: isNotesOpen ? 'var(--primary-color)' : 'var(--text-secondary)', cursor:'pointer'}}>
                       <MessageSquare size={22} />
                   </button>

                  <div onClick={() => onEditItem(tank)} style={{width:'80px', height:'80px', margin:'0 auto', background:'var(--bg-card)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem', boxShadow:'0 4px 6px rgba(0,0,0,0.1)', overflow:'hidden', cursor:'pointer', position:'relative'}} title="Tap to Edit Details">
                    {tank.image ? (<img src={tank.image} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />) : (<span>{tank.category === 'hermit' ? '🦀' : (tank.category === 'plants' ? '🌿' : (tank.category === 'rodi' ? '💧' : '🐠'))}</span>)}
                  </div>
                  <h3 style={{fontSize:'1.25rem', fontWeight:'bold', color:'var(--text-main)', margin:'0.5rem 0 0.25rem 0'}}>{tank.name}</h3>
                  <span style={{color:'var(--text-secondary)', fontSize:'0.9rem'}}>{tank.size} • {tank.type}</span>
                </div>

                {/* Task List Section */}
                <div style={{padding:'1rem', flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                    {tank.tasks.map((task, index) => {
                        const lastDate = task.lastCompleted ? new Date(task.lastCompleted) : null;
                        const nextDate = lastDate ? addDays(lastDate, task.frequency) : new Date();
                        const daysDiff = differenceInDays(new Date(), nextDate);
                        const isOverdue = lastDate ? daysDiff > 0 : true;

                        // Specific logic
                        const isWaterChange = task.name.toLowerCase().includes("water change");
                        // Use tank.id === 1 or logic based on size/name
                        const showSplitButtons = isWaterChange && (tank.id === 1 || tank.size.includes('135'));

                        return (
                            <div key={index} style={{
                                background: 'var(--bg-card-secondary)',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem'}}>
                                    <div>
                                        <div style={{fontWeight:'bold', fontSize:'1rem', color:'var(--text-main)'}}>{task.name}</div>
                                        <div style={{fontSize:'0.8rem', color: isOverdue ? 'var(--status-bad-text)' : 'var(--text-secondary)', display:'flex', alignItems:'center', gap:'4px', marginTop:'2px'}}>
                                            {isOverdue && <AlertCircle size={12}/>}
                                            {isOverdue ? `Due ${daysDiff} days ago` : `Due in ${Math.abs(daysDiff)} days`}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => toggleHistory(tank.id, index)} 
                                        style={{background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer', padding:'4px'}}
                                    >
                                        <Clock size={18} />
                                    </button>
                                </div>

                                {/* --- 3. REPLACED BUTTONS WITH ConfettiButton --- */}
                                {showSplitButtons ? (
                                    <div style={{display:'flex', gap:'0.5rem'}}>
                                        <ConfettiButton onClick={() => onComplete(tank.id, index, 'Left')} className="btn-swipe-split">Left</ConfettiButton>
                                        <ConfettiButton onClick={() => onComplete(tank.id, index, 'Right')} className="btn-swipe-split">Right</ConfettiButton>
                                    </div>
                                ) : (
                                    <ConfettiButton onClick={() => onComplete(tank.id, index, null)} className="btn-swipe-full">
                                        <CheckCircle size={18} style={{marginRight:'6px'}}/>
                                        Complete
                                    </ConfettiButton>
                                )}
                            </div>
                        );
                    })}
                    {tank.tasks.length === 0 && (
                        <div style={{textAlign:'center', color:'var(--text-secondary)', fontStyle:'italic', marginTop:'2rem'}}>
                            No tasks configured. Tap the photo to add some.
                        </div>
                    )}
                </div>

                {/* History Overlay */}
                {historyTarget && historyTarget.tankId === tank.id && (
                   (() => {
                       const tIndex = historyTarget.taskIndex;
                       const activeTask = tank.tasks[tIndex];
                       if(!activeTask) return null;

                       return (
                           <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'var(--bg-card)', zIndex:20, display:'flex', flexDirection:'column'}}>
                               <div style={{padding:'1rem', borderBottom:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--bg-card-secondary)'}}>
                                   <span style={{fontWeight:'bold', color:'var(--text-main)'}}>{activeTask.name} History</span>
                                   <button onClick={() => setHistoryTarget(null)} style={{border:'none', background:'none', cursor:'pointer', color:'var(--text-secondary)'}}><X size={20}/></button>
                               </div>
                               <div style={{flex:1, overflowY:'auto', padding:'1rem'}}>
                                   {activeTask.history && activeTask.history.length > 0 ? (
                                       <ul style={{listStyle:'none', padding:0, margin:0}}>
                                           {activeTask.history.map((entry, hIndex) => {
                                               const dateStr = typeof entry === 'string' ? entry : entry.date;
                                               const side = typeof entry === 'object' ? entry.side : null;
                                               const uniqueId = `${tank.id}-${tIndex}-${hIndex}`;
                                               const isEditing = editingEntryId === uniqueId;
                                               return (
                                                   <li key={hIndex} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.75rem 0', borderBottom:'1px dashed var(--border-color)'}}>
                                                       {isEditing ? (
                                                           <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                                               <input type="date" value={editDateValue} onChange={(e) => setEditDateValue(e.target.value)} style={{border:'1px solid #cbd5e1', borderRadius:'4px', padding:'2px', fontSize:'0.85rem'}} />
                                                               <button onClick={() => saveEdit(tank.id, tIndex, hIndex)} style={{border:'none', background:'none', color:'var(--status-good-text)', cursor:'pointer'}}><Save size={16}/></button>
                                                               <button onClick={() => setEditingEntryId(null)} style={{border:'none', background:'none', color:'var(--text-secondary)', cursor:'pointer'}}><XCircle size={16}/></button>
                                                           </div>
                                                       ) : (
                                                           <div style={{color:'var(--text-secondary)', fontSize:'0.9rem'}}>
                                                               <span style={{fontWeight:500}}>{format(new Date(dateStr), 'MMM d, yyyy')}</span>
                                                               {side && <span style={{marginLeft:'8px', padding:'2px 6px', background:'var(--bg-card-secondary)', borderRadius:'4px', fontSize:'0.75rem'}}>{side}</span>}
                                                           </div>
                                                       )}
                                                       {!isEditing && (
                                                           <div style={{display:'flex', gap:'0.5rem'}}>
                                                               <button onClick={() => startEditing(uniqueId, dateStr)} style={{border:'none', background:'none', color:'var(--primary-color)', cursor:'pointer'}}><Pencil size={14}/></button>
                                                               <button onClick={() => onDeleteHistory(tank.id, tIndex, hIndex)} style={{border:'none', background:'none', color:'var(--status-bad-text)', cursor:'pointer'}}><Trash2 size={14}/></button>
                                                           </div>
                                                       )}
                                                   </li>
                                               );
                                           })}
                                       </ul>
                                   ) : <p style={{textAlign:'center', color:'var(--text-secondary)', fontStyle:'italic'}}>No history yet.</p>}
                               </div>
                           </div>
                       );
                   })()
                )}

                {/* Notes Overlay */}
                {isNotesOpen && (
                    <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'var(--bg-card)', zIndex:20, display:'flex', flexDirection:'column'}}>
                        <div style={{padding:'1rem', borderBottom:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--bg-card-secondary)'}}>
                            <span style={{fontWeight:'bold', color:'var(--text-main)'}}>Notes</span>
                            <button onClick={() => setNotesOpenId(null)} style={{border:'none', background:'none', cursor:'pointer', color:'var(--text-secondary)'}}><X size={20}/></button>
                        </div>
                        <div style={{flex:1, overflowY:'auto', padding:'1rem'}}>
                            {tank.notes && tank.notes.length > 0 ? (
                                <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                                    {tank.notes.map((note) => (
                                        <li key={note.id} style={{background:'var(--bg-card-secondary)', padding:'0.75rem', borderRadius:'var(--border-radius)', border:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                            <div style={{display:'flex', flexDirection:'column'}}>
                                                <span style={{fontSize:'0.7rem', color:'var(--text-secondary)', marginBottom:'0.25rem'}}>{format(new Date(note.date), 'MMM d, h:mm a')}</span>
                                                <span style={{color:'var(--text-main)', fontSize:'0.9rem'}}>{note.text}</span>
                                            </div>
                                            <button onClick={() => onDeleteNote(tank.id, note.id)} style={{border:'none', background:'none', color:'var(--text-secondary)', cursor:'pointer'}}><Trash2 size={14} /></button>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p style={{textAlign:'center', color:'var(--text-secondary)', fontStyle:'italic'}}>No notes yet.</p>}
                        </div>
                        <div style={{padding:'1rem', borderTop:'1px solid var(--border-color)', display:'flex', gap:'0.5rem', background:'var(--bg-card-secondary)'}}>
                            <input type="text" value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Add a note..." style={{flex:1, padding:'0.75rem', border:'1px solid var(--border-color)', borderRadius:'0.5rem', outline:'none', background:'var(--bg-card)', color:'var(--text-main)'}} onKeyDown={(e) => e.key === 'Enter' && submitNote(tank.id)} />
                            <button onClick={() => submitNote(tank.id)} style={{background:'var(--primary-color)', color:'var(--btn-text)', border:'none', borderRadius:'0.5rem', width:'44px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><Plus size={20} /></button>
                        </div>
                    </div>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
      
      {/* CSS For Buttons inside Swipe View */}
      <style>{`
        .btn-swipe-full {
            width: 100%;
            padding: 0.75rem;
            background: var(--primary-color);
            color: var(--btn-text);
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s;
        }
        .btn-swipe-full:active { opacity: 0.8; }
        
        .btn-swipe-split {
            flex: 1;
            padding: 0.75rem;
            background: var(--bg-card);
            border: 2px solid var(--primary-color);
            color: var(--primary-color);
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }
        .btn-swipe-split:active { background: var(--primary-color); color: var(--btn-text); }
      `}</style>
    </div>
  );
}