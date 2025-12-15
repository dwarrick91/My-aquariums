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

  // --- THEMED BUTTON STYLES ---
  const buttonContainerStyle = {
    marginTop: 'auto', 
    paddingTop: '1rem', 
    width: '100%',
    display: 'flex',
    gap: '1rem',
    height: 'auto', 
    minHeight: '60px' 
  };

  const singleButtonStyle = {
    width: '100%', 
    padding: '1rem', 
    background: 'var(--primary-color)', 
    color: 'var(--btn-text)', 
    border: 'none', 
    borderRadius: 'var(--border-radius)', 
    fontWeight: 'bold', 
    fontSize: '1rem', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '0.5rem', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    height: '100%' 
  };

  const splitButtonStyle = {
    flex: 1, 
    padding: '1rem', 
    background: 'var(--btn-secondary-bg)', 
    color: 'var(--btn-secondary-text)', 
    border: 'none', 
    borderRadius: 'var(--border-radius)', 
    fontWeight: 'bold', 
    fontSize: '1rem', 
    cursor: 'pointer', 
    height: '100%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center'
  };

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
            const taskKeywords = ["water change", "watering", "replace", "mist"];
            let primaryTaskIndex = tank.tasks.findIndex(t => taskKeywords.some(k => t.name.toLowerCase().includes(k)));
            if (primaryTaskIndex === -1 && tank.tasks.length > 0) primaryTaskIndex = 0;
            const primaryTask = primaryTaskIndex >= 0 ? tank.tasks[primaryTaskIndex] : null;

            let buttonLabel = "Log Action";
            if (primaryTask) {
                const lowerName = primaryTask.name.toLowerCase();
                if (lowerName.includes("watering")) buttonLabel = "Log Watering";
                else if (lowerName.includes("replace")) buttonLabel = "Log Replace Filter";
                else if (lowerName.includes("mist")) buttonLabel = "Log Misting";
                else buttonLabel = `Log ${primaryTask.name}`;
            }

            const isLargeTank = parseInt(tank.size) > 29;
            const isTerrarium = tank.type === "Terrarium";
            const showSideButtons = isLargeTank && !isTerrarium && primaryTask && primaryTask.name.toLowerCase().includes("water change");

            const latestHistory = primaryTask && primaryTask.history && primaryTask.history.length > 0 ? primaryTask.history[0] : null;
            const lastSide = latestHistory ? latestHistory.side : null;
            
            const isHistoryOpen = historyOpenId === tank.id;
            const isNotesOpen = notesOpenId === tank.id;

            return (
              <SwiperSlide key={tank.id} style={{
                background: 'var(--bg-card)', 
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                height: '100%', position: 'relative'
              }}>
                <div style={{height:'90px', background:'var(--primary-gradient)', flexShrink: 0}}></div>
                <div style={{marginTop:'-45px', textAlign:'center', padding:'0 1rem', flexShrink: 0}}>
                  <div onClick={() => onEditItem(tank)} style={{width:'90px', height:'90px', margin:'0 auto', background:'var(--bg-card)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem', boxShadow:'0 4px 6px rgba(0,0,0,0.1)', overflow:'hidden', cursor:'pointer', position:'relative'}} title="Tap to Edit Details">
                    {tank.image ? (<img src={tank.image} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />) : (<span>{tank.category === 'hermit' ? '🦀' : (tank.category === 'plants' ? '🌿' : (tank.category === 'rodi' ? '💧' : '🐠'))}</span>)}
                  </div>
                  <h3 style={{fontSize:'1.25rem', fontWeight:'bold', color:'var(--text-main)', margin:'0.75rem 0 0.25rem 0'}}>{tank.name}</h3>
                  <span style={{color:'var(--text-secondary)', fontSize:'0.9rem'}}>{tank.size} • {tank.type}</span>
                </div>

                <div style={{padding:'1rem', flex:1, display:'flex', flexDirection:'column'}}>
                  <div style={{position:'relative', background:'var(--bg-card-secondary)', padding:'1.25rem 1rem', borderRadius:'var(--border-radius)', border:'1px solid var(--border-color)', textAlign:'center', marginBottom:'auto', minHeight: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                    <p style={{fontSize:'0.7rem', fontWeight:'bold', color:'var(--text-secondary)', textTransform:'uppercase', margin:0, paddingRight:'50px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{primaryTask ? `Last ${primaryTask.name}` : "Last Action"}</p>
                    <p style={{fontSize:'1.4rem', fontWeight:'bold', color:'var(--text-main)', margin:'0.5rem 0 0 0'}}>
                      {primaryTask && primaryTask.lastCompleted ? (<span>{new Date(primaryTask.lastCompleted).toLocaleDateString()}{lastSide && <span style={{marginLeft:'8px', color:'var(--text-secondary)', fontWeight:'normal', fontSize:'1rem'}}>({lastSide})</span>}</span>) : 'Never'}
                    </p>
                    <div style={{position:'absolute', top:'10px', right:'10px', display:'flex', gap:'8px'}}>
                        <button onClick={() => toggleNotes(tank.id)} style={{border:'none', background:'none', color: isNotesOpen ? 'var(--primary-color)' : 'var(--text-secondary)', cursor:'pointer'}}><MessageSquare size={18} /></button>
                        {primaryTask && <button onClick={() => toggleHistory(tank.id)} style={{border:'none', background:'none', color: isHistoryOpen ? 'var(--primary-color)' : 'var(--text-secondary)', cursor:'pointer'}}><Clock size={18} /></button>}
                    </div>
                  </div>
                  
                  {primaryTask && (
                    <div style={buttonContainerStyle}>
                      {showSideButtons ? (
                        <>
                          <button onClick={() => onComplete(tank.id, primaryTaskIndex, 'Left')} style={splitButtonStyle}>Left</button>
                          <button onClick={() => onComplete(tank.id, primaryTaskIndex, 'Right')} style={splitButtonStyle}>Right</button>
                        </>
                      ) : (
                        <button onClick={() => onComplete(tank.id, primaryTaskIndex, null)} style={singleButtonStyle}>
                          <Droplets size={20} />
                          {buttonLabel}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isHistoryOpen && primaryTask && (
                    <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'var(--bg-card)', zIndex:20, display:'flex', flexDirection:'column'}}>
                        <div style={{padding:'1rem', borderBottom:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--bg-card-secondary)'}}>
                            <span style={{fontWeight:'bold', color:'var(--text-main)'}}>History Log</span>
                            <button onClick={() => setHistoryOpenId(null)} style={{border:'none', background:'none', cursor:'pointer', color:'var(--text-secondary)'}}><X size={20}/></button>
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
                                            <li key={hIndex} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.75rem 0', borderBottom:'1px dashed var(--border-color)'}}>
                                                {isEditing ? (
                                                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                                        <input type="date" value={editDateValue} onChange={(e) => setEditDateValue(e.target.value)} style={{border:'1px solid #cbd5e1', borderRadius:'4px', padding:'2px', fontSize:'0.85rem'}} />
                                                        <button onClick={() => saveEdit(tank.id, primaryTaskIndex, hIndex)} style={{border:'none', background:'none', color:'var(--status-good-text)', cursor:'pointer'}}><Save size={16}/></button>
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
                                                        <button onClick={() => onDeleteHistory(tank.id, primaryTaskIndex, hIndex)} style={{border:'none', background:'none', color:'var(--status-bad-text)', cursor:'pointer'}}><Trash2 size={14}/></button>
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : <p style={{textAlign:'center', color:'var(--text-secondary)', fontStyle:'italic'}}>No history yet.</p>}
                        </div>
                    </div>
                )}

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
    </div>
  );
}