import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { Droplets, Clock, Trash2, Pencil, Save, XCircle, X, MessageSquare, Plus } from 'lucide-react';
import { format } from 'date-fns';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function SwipeView({ tanks, onComplete, onDeleteHistory, onEditHistory, onEditItem, onAddNote, onDeleteNote, categoryName }) {
  const [historyOpenId, setHistoryOpenId] = useState(null);
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
    if (editDateValue) onEditHistory(tankId, taskIndex, histIndex, editDateValue);
    setEditingEntryId(null);
  };

  const submitNote = (tankId) => {
    if (!noteInput.trim()) return;
    onAddNote(tankId, noteInput);
    setNoteInput("");
  };

  const toggleHistory = (id) => {
    setHistoryOpenId(historyOpenId === id ? null : id);
    setNotesOpenId(null);
  };

  const toggleNotes = (id) => {
    setNotesOpenId(notesOpenId === id ? null : id);
    setHistoryOpenId(null);
    setNoteInput("");
  };

  const containerStyle = {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', // Vertically center the card
    paddingTop: '0.5rem'
  };

  if (!tanks || tanks.length === 0) {
    return (
      <div style={{...containerStyle, justifyContent:'center', color:'#94a3b8'}}>
        <p>No items found in {displayTitle}.</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{
          fontSize:'1.25rem', 
          fontWeight:'bold', 
          color:'#1e293b', 
          marginBottom:'1rem', 
          textTransform:'capitalize',
          textAlign: 'center'
      }}>
        {displayTitle}
      </h2>
      
      {/* FIX: Height is conservatively calculated to fit safely on mobile screens */}
      <div style={{width:'100%', maxWidth:'400px', height:'calc(100vh - 200px)', margin: '0 auto', minHeight: '400px'}}>
        <Swiper
          modules={[Pagination, Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={true}
          pagination={{ clickable: true }}
          style={{height:'100%', paddingBottom:'30px'}}
        >
          {tanks.map((tank) => {
            const taskKeywords = ["water change", "watering", "replace", "mist"];
            let primaryTaskIndex = tank.tasks.findIndex(t => taskKeywords.some(k => t.name.toLowerCase().includes(k)));
            if (primaryTaskIndex === -1 && tank.tasks.length > 0) primaryTaskIndex = 0;
            const primaryTask = primaryTaskIndex >= 0 ? tank.tasks[primaryTaskIndex] : null;

            const isLargeTank = parseInt(tank.size) > 29;
            const isTerrarium = tank.type === "Terrarium";
            const showSideButtons = isLargeTank && !isTerrarium && primaryTask && primaryTask.name.toLowerCase().includes("water change");

            const latestHistory = primaryTask && primaryTask.history && primaryTask.history.length > 0 ? primaryTask.history[0] : null;
            const lastSide = latestHistory ? latestHistory.side : null;
            
            const isHistoryOpen = historyOpenId === tank.id;
            const isNotesOpen = notesOpenId === tank.id;

            return (
              <SwiperSlide key={tank.id} style={{
                background: 'white',
                borderRadius: '1rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                height: '100%', // Fill the responsive container
                position: 'relative'
              }}>
                {/* Header Image Background */}
                <div style={{height:'80px', background:'linear-gradient(135deg, #2563eb, #06b6d4)', flexShrink: 0}}></div>
                
                <div style={{marginTop:'-40px', textAlign:'center', padding:'0 1rem', flexShrink: 0}}>
                  <div 
                    onClick={() => onEditItem(tank)}
                    style={{
                        width:'80px', height:'80px', margin:'0 auto', 
                        background:'white', borderRadius:'50%', 
                        display:'flex', alignItems:'center', justifyContent:'center', 
                        fontSize:'2rem', boxShadow:'0 4px 6px rgba(0,0,0,0.1)', 
                        overflow:'hidden', cursor:'pointer', position:'relative'
                    }}
                  >
                    {tank.image ? (
                        <img src={tank.image} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                    ) : (
                        <span>{tank.category === 'hermit' ? '🦀' : '🐠'}</span>
                    )}
                  </div>

                  <h3 style={{fontSize:'1.4rem', fontWeight:'bold', color:'#1e293b', margin:'0.5rem 0 0.25rem 0'}}>{tank.name}</h3>
                  <span style={{color:'#64748b', fontSize:'0.85rem'}}>{tank.size} • {tank.type}</span>
                </div>

                <div style={{padding:'1rem 1.5rem', flex:1, display:'flex', flexDirection:'column', justifyContent: 'center'}}>
                  
                  <div style={{position:'relative', background:'#f8fafc', padding:'1rem', borderRadius:'0.75rem', border:'1px solid #e2e8f0', textAlign:'center', marginBottom:'auto'}}>
                    <p style={{fontSize:'0.75rem', fontWeight:'bold', color:'#64748b', textTransform:'uppercase', margin:0}}>
                        {primaryTask ? `Last ${primaryTask.name}` : "Last Action"}
                    </p>
                    <p style={{fontSize:'1.25rem', fontWeight:'bold', color:'#1e293b', margin:'0.5rem 0 0 0'}}>
                      {primaryTask && primaryTask.lastCompleted 
                        ? (
                            <span>
                              {new Date(primaryTask.lastCompleted).toLocaleDateString()}
                              {lastSide && <span style={{marginLeft:'8px', color:'#64748b', fontWeight:'normal'}}>({lastSide})</span>}
                            </span>
                          )
                        : 'Never'}
                    </p>
                    
                    <div style={{position:'absolute', top:'10px', right:'10px', display:'flex', gap:'8px'}}>
                        <button onClick={() => toggleNotes(tank.id)} style={{border:'none', background:'none', color: isNotesOpen ? '#2563eb' : '#94a3b8', cursor:'pointer'}}><MessageSquare size={18} /></button>
                        {primaryTask && (
                            <button onClick={() => toggleHistory(tank.id)} style={{border:'none', background:'none', color: isHistoryOpen ? '#2563eb' : '#94a3b8', cursor:'pointer'}}><Clock size={18} /></button>
                        )}
                    </div>
                  </div>
                  
                  {primaryTask && (
                    <div style={{marginTop:'auto', paddingTop: '1.5rem'}}>
                      {showSideButtons ? (
                        <div style={{display:'flex', gap:'1rem'}}>
                          <button onClick={() => onComplete(tank.id, primaryTaskIndex, 'Left')} style={{flex:1, padding:'1rem', background:'#dbeafe', color:'#1e40af', border:'none', borderRadius:'0.75rem', fontWeight:'bold', fontSize:'1rem', cursor:'pointer'}}>Left</button>
                          <button onClick={() => onComplete(tank.id, primaryTaskIndex, 'Right')} style={{flex:1, padding:'1rem', background:'#dbeafe', color:'#1e40af', border:'none', borderRadius:'0.75rem', fontWeight:'bold', fontSize:'1rem', cursor:'pointer'}}>Right</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => onComplete(tank.id, primaryTaskIndex, null)}
                          style={{
                            width:'100%', padding:'1rem', background:'#2563eb', color:'white', border:'none', borderRadius:'0.75rem', fontWeight:'bold', fontSize:'1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', boxShadow:'0 4px 6px rgba(37, 99, 235, 0.2)'
                          }}
                        >
                          <Droplets size={20} />
                          Log {primaryTask.name}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isHistoryOpen && primaryTask && (
                    <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'white', zIndex:20, display:'flex', flexDirection:'column'}}>
                        <div style={{padding:'1rem', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f8fafc'}}>
                            <span style={{fontWeight:'bold', color:'#334155'}}>History Log</span>
                            <button onClick={() => setHistoryOpenId(null)} style={{border:'none', background:'none', cursor:'pointer'}}><X size={20}/></button>
                        </div>
                        <div style={{flex:1, overflowY:'auto', padding:'1rem'}}>
                            {primaryTask.history && primaryTask.history.length > 0 ? (
                                <ul style={{listStyle:'none', padding:0, margin:0}}>
                                    {primaryTask.history.map((entry, hIndex) => {
                                        const dateStr = typeof entry === 'string' ? entry : entry.date;
                                        const side = typeof entry === 'object' ? entry.side : null;
                                        const uniqueId = `${tank.id}-${primaryTaskIndex}-${hIndex}`;
                                        const isEditing = editingEntryId === uniqueId;
                                        return (
                                            <li key={hIndex} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.75rem 0', borderBottom:'1px dashed #e2e8f0'}}>
                                                {isEditing ? (
                                                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                                        <input type="date" value={editDateValue} onChange={(e) => setEditDateValue(e.target.value)} style={{border:'1px solid #cbd5e1', borderRadius:'4px', padding:'2px', fontSize:'0.85rem'}} />
                                                        <button onClick={() => saveEdit(tank.id, primaryTaskIndex, hIndex)} style={{border:'none', background:'none', color:'#22c55e', cursor:'pointer'}}><Save size={16}/></button>
                                                        <button onClick={() => setEditingEntryId(null)} style={{border:'none', background:'none', color:'#94a3b8', cursor:'pointer'}}><XCircle size={16}/></button>
                                                    </div>
                                                ) : (
                                                    <div style={{color:'#64748b', fontSize:'0.9rem'}}>
                                                        <span style={{fontWeight:500}}>{format(new Date(dateStr), 'MMM d, yyyy')}</span>
                                                        {side && <span style={{marginLeft:'8px', padding:'2px 6px', background:'#f1f5f9', borderRadius:'4px', fontSize:'0.75rem'}}>{side}</span>}
                                                    </div>
                                                )}
                                                {!isEditing && (
                                                    <div style={{display:'flex', gap:'0.5rem'}}>
                                                        <button onClick={() => startEditing(uniqueId, dateStr)} style={{border:'none', background:'none', color:'#3b82f6', cursor:'pointer'}}><Pencil size={14}/></button>
                                                        <button onClick={() => onDeleteHistory(tank.id, primaryTaskIndex, hIndex)} style={{border:'none', background:'none', color:'#ef4444', cursor:'pointer'}}><Trash2 size={14}/></button>
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : <p style={{textAlign:'center', color:'#cbd5e1', fontStyle:'italic'}}>No history yet.</p>}
                        </div>
                    </div>
                )}

                {isNotesOpen && (
                    <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'white', zIndex:20, display:'flex', flexDirection:'column'}}>
                        <div style={{padding:'1rem', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f8fafc'}}>
                            <span style={{fontWeight:'bold', color:'#334155'}}>Notes</span>
                            <button onClick={() => setNotesOpenId(null)} style={{border:'none', background:'none', cursor:'pointer'}}><X size={20}/></button>
                        </div>
                        <div style={{flex:1, overflowY:'auto', padding:'1rem'}}>
                            {tank.notes && tank.notes.length > 0 ? (
                                <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                                    {tank.notes.map((note) => (
                                        <li key={note.id} style={{background:'#f8fafc', padding:'0.75rem', borderRadius:'0.5rem', border:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                            <div style={{display:'flex', flexDirection:'column'}}>
                                                <span style={{fontSize:'0.7rem', color:'#94a3b8', marginBottom:'0.25rem'}}>{format(new Date(note.date), 'MMM d, h:mm a')}</span>
                                                <span style={{color:'#334155', fontSize:'0.9rem'}}>{note.text}</span>
                                            </div>
                                            <button onClick={() => onDeleteNote(tank.id, note.id)} style={{border:'none', background:'none', color:'#cbd5e1', cursor:'pointer'}}><Trash2 size={14} /></button>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p style={{textAlign:'center', color:'#cbd5e1', fontStyle:'italic'}}>No notes yet.</p>}
                        </div>
                        <div style={{padding:'1rem', borderTop:'1px solid #e2e8f0', display:'flex', gap:'0.5rem', background:'#f8fafc'}}>
                            <input type="text" value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Add a note..." style={{flex:1, padding:'0.75rem', border:'1px solid #cbd5e1', borderRadius:'0.5rem', outline:'none'}} onKeyDown={(e) => e.key === 'Enter' && submitNote(tank.id)} />
                            <button onClick={() => submitNote(tank.id)} style={{background:'#2563eb', color:'white', border:'none', borderRadius:'0.5rem', width:'44px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><Plus size={20} /></button>
                        </div>
                    </div>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}