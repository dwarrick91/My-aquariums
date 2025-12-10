import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { Droplets, MessageSquare, X, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function SwipeView({ tanks, onComplete, onAddNote, onDeleteNote, categoryName }) {
  const [viewingNotesId, setViewingNotesId] = useState(null);
  const [noteInput, setNoteInput] = useState("");

  let displayTitle = categoryName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  if(categoryName === 'hermit') displayTitle = "Jackson's Hermit Crabs";

  const handleAddSubmit = (tankId) => {
    if(!noteInput.trim()) return;
    onAddNote(tankId, noteInput);
    setNoteInput("");
  };

  const containerStyle = {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', 
    paddingTop: '1rem',
  };

  const swiperWrapperStyle = {
    width: '100%',
    maxWidth: '400px',
    height: '600px',
    margin: '0 auto',
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
      <h2 style={{fontSize:'1.5rem', fontWeight:'bold', color:'#1e293b', marginBottom:'1.5rem', textTransform:'capitalize', textAlign:'center'}}>
        {displayTitle}
      </h2>
      
      <div style={swiperWrapperStyle}>
        <Swiper
          modules={[Pagination, Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          centeredSlides={true}
          navigation={true}
          pagination={{ clickable: true }}
          style={{height:'100%', paddingBottom:'40px'}}
        >
          {tanks.map((tank) => {
            const isViewingNotes = viewingNotesId === tank.id;
            
            // --- SMART TASK SEARCH: Water Change OR Watering OR Replace Filter ---
            const wcTaskIndex = tank.tasks.findIndex(t => 
                t.name.toLowerCase().includes("water change") || 
                t.name.toLowerCase().includes("watering") ||
                t.name.toLowerCase().includes("replace")
            );
            const wcTask = wcTaskIndex >= 0 ? tank.tasks[wcTaskIndex] : null;
            
            const isLargeTank = parseInt(tank.size) > 29;
            const isTerrarium = tank.type === "Terrarium";
            const showSideButtons = isLargeTank && !isTerrarium;
            
            const latestHistory = wcTask && wcTask.history && wcTask.history.length > 0 ? wcTask.history[0] : null;
            const lastSide = latestHistory ? latestHistory.side : null;

            // --- SMART LABELING ---
            let lastWaterLabel = "Last Water Change";
            let buttonLabel = "Log Water Change Today";
            let mainIcon = '🐠';

            if (tank.category === 'plants') {
                lastWaterLabel = "Last Watered";
                buttonLabel = "Log Watered Today";
                mainIcon = '🪴';
            } else if (tank.category === 'rodi') {
                lastWaterLabel = "Last Replaced";
                buttonLabel = "Log Replaced Today";
                mainIcon = '💧';
            } else if (tank.category === 'hermit') {
                mainIcon = '🦀';
            }

            return (
              <SwiperSlide key={tank.id} style={{
                background: 'white',
                borderRadius: '1rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                height: '540px',
                position: 'relative' 
              }}>
                <div style={{height:'100px', background:'linear-gradient(135deg, #2563eb, #06b6d4)', flexShrink: 0}}></div>
                
                <div style={{marginTop:'-40px', textAlign:'center', padding:'0 1rem', flexShrink: 0}}>
                  <div style={{width:'80px', height:'80px', margin:'0 auto', background:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}>
                    {mainIcon}
                  </div>
                  <h3 style={{fontSize:'1.5rem', fontWeight:'bold', color:'#1e293b', margin:'1rem 0 0.5rem 0'}}>{tank.name}</h3>
                  <span style={{color:'#64748b', fontSize:'0.875rem'}}>{tank.size} • {tank.type}</span>
                </div>

                <div style={{padding:'1.5rem', flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>
                  
                  {!isViewingNotes ? (
                    <>
                      <div style={{background:'#f8fafc', padding:'1rem', borderRadius:'0.75rem', border:'1px solid #e2e8f0', textAlign:'center'}}>
                        <p style={{fontSize:'0.75rem', fontWeight:'bold', color:'#64748b', textTransform:'uppercase', margin:0}}>{lastWaterLabel}</p>
                        <p style={{fontSize:'1.25rem', fontWeight:'bold', color:'#1e293b', margin:'0.5rem 0 0 0'}}>
                          {wcTask && wcTask.lastCompleted 
                            ? (
                                <span>
                                  {new Date(wcTask.lastCompleted).toLocaleDateString()}
                                  {lastSide && <span style={{marginLeft:'8px', color:'#64748b', fontWeight:'normal'}}>({lastSide})</span>}
                                </span>
                              )
                            : 'Never'}
                        </p>
                      </div>

                      <div style={{display:'flex', justifyContent:'center', marginTop:'1rem'}}>
                        <button 
                          onClick={() => setViewingNotesId(tank.id)}
                          style={{
                            background:'none', border:'none', color:'#64748b', display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', fontSize:'0.9rem'
                          }}
                        >
                          <MessageSquare size={18} />
                          <span>View Notes {tank.notes && tank.notes.length > 0 && `(${tank.notes.length})`}</span>
                        </button>
                      </div>
                      
                      {wcTask && (
                        <div style={{marginTop:'auto'}}>
                          {showSideButtons ? (
                            <div style={{display:'flex', gap:'1rem'}}>
                              <button onClick={() => onComplete(tank.id, wcTaskIndex, 'Left')} style={{flex:1, padding:'1rem', background:'#dbeafe', color:'#1e40af', border:'none', borderRadius:'0.75rem', fontWeight:'bold', fontSize:'1rem', cursor:'pointer'}}>Left</button>
                              <button onClick={() => onComplete(tank.id, wcTaskIndex, 'Right')} style={{flex:1, padding:'1rem', background:'#dbeafe', color:'#1e40af', border:'none', borderRadius:'0.75rem', fontWeight:'bold', fontSize:'1rem', cursor:'pointer'}}>Right</button>
                            </div>
                          ) : (
                            <button onClick={() => onComplete(tank.id, wcTaskIndex, null)} style={{width:'100%', padding:'1rem', background:'#2563eb', color:'white', border:'none', borderRadius:'0.75rem', fontWeight:'bold', fontSize:'1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', boxShadow:'0 4px 6px rgba(37, 99, 235, 0.2)'}}>
                              <Droplets size={20} /> {buttonLabel}
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                        <span style={{fontWeight:'bold', color:'#334155'}}>Notes</span>
                        <button onClick={() => setViewingNotesId(null)} style={{background:'none', border:'none', cursor:'pointer'}}><X size={20} /></button>
                      </div>

                      <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1rem', paddingRight:'0.5rem'}}>
                        {tank.notes && tank.notes.length > 0 ? (
                          tank.notes.map(note => (
                            <div key={note.id} style={{background:'#f1f5f9', padding:'0.75rem', borderRadius:'0.5rem', fontSize:'0.85rem', display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                              <div>
                                <div style={{fontSize:'0.7rem', color:'#94a3b8', marginBottom:'0.25rem'}}>{format(new Date(note.date), 'MMM d, h:mm a')}</div>
                                <div style={{color:'#334155'}}>{note.text}</div>
                              </div>
                              <button onClick={() => onDeleteNote(tank.id, note.id)} style={{background:'none', border:'none', color:'#cbd5e1', cursor:'pointer'}}><Trash2 size={14} /></button>
                            </div>
                          ))
                        ) : <div style={{textAlign:'center', color:'#cbd5e1', fontStyle:'italic', marginTop:'2rem'}}>No notes yet</div>}
                      </div>

                      <div style={{display:'flex', gap:'0.5rem'}}>
                        <input 
                          type="text" 
                          placeholder="Add note..." 
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddSubmit(tank.id)}
                          style={{flex:1, padding:'0.75rem', borderRadius:'0.5rem', border:'1px solid #e2e8f0', fontSize:'0.9rem'}}
                        />
                        <button onClick={() => handleAddSubmit(tank.id)} style={{background:'#334155', color:'white', border:'none', borderRadius:'0.5rem', padding:'0 1rem', cursor:'pointer'}}>
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}