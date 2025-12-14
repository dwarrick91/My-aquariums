import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { Droplets, Clock, Trash2, Pencil, Save, XCircle, X } from 'lucide-react';
import { format } from 'date-fns';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function SwipeView({ tanks, onComplete, onDeleteHistory, onEditHistory, onEditItem, categoryName }) {
  const [historyOpenId, setHistoryOpenId] = useState(null);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editDateValue, setEditDateValue] = useState("");

  let displayTitle = categoryName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  if(categoryName === 'hermit') {
    displayTitle = "Jackson's Hermit Crabs";
  }

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

  const containerStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '1rem'
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
      <h2 style={{fontSize:'1.5rem', fontWeight:'bold', color:'#1e293b', marginBottom:'1.5rem', textTransform:'capitalize'}}>
        {displayTitle}
      </h2>
      
      <div style={{width:'100%', maxWidth:'450px', height:'600px'}}>
        <Swiper
          modules={[Pagination, Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={true}
          pagination={{ clickable: true }}
          style={{height:'100%', paddingBottom:'40px'}}
        >
          {tanks.map((tank) => {
            const wcTaskIndex = tank.tasks.findIndex(t => t.name.toLowerCase().includes("water change"));
            const wcTask = wcTaskIndex >= 0 ? tank.tasks[wcTaskIndex] : null;

            const isLargeTank = parseInt(tank.size) > 29;
            const isTerrarium = tank.type === "Terrarium";
            const showSideButtons = isLargeTank && !isTerrarium;

            const latestHistory = wcTask && wcTask.history && wcTask.history.length > 0 ? wcTask.history[0] : null;
            const lastSide = latestHistory ? latestHistory.side : null;
            
            const isHistoryOpen = historyOpenId === tank.id;

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
                <div style={{height:'100px', background:'linear-gradient(135deg, #2563eb, #06b6d4)'}}></div>
                
                <div style={{marginTop:'-40px', textAlign:'center', padding:'0 1rem'}}>
                  
                  {/* --- IMAGE / ICON --- */}
                  <div style={{width:'80px', height:'80px', margin:'0 auto', background:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', boxShadow:'0 4px 6px rgba(0,0,0,0.1)', overflow:'hidden'}}>
                    {tank.image ? (
                        <img src={tank.image} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                    ) : (
                        <span>{tank.category === 'hermit' ? '🦀' : '🐠'}</span>
                    )}
                  </div>

                  {/* --- TITLE WITH EDIT BUTTON --- */}
                  <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', marginTop:'1rem', marginBottom:'0.5rem'}}>
                    <h3 style={{fontSize:'1.5rem', fontWeight:'bold', color:'#1e293b', margin:0}}>{tank.name}</h3>
                    <button 
                        onClick={() => onEditItem(tank)}
                        style={{border:'none', background:'none', color:'#94a3b8', cursor:'pointer'}}
                    >
                        <Pencil size={16} />
                    </button>
                  </div>
                  
                  <span style={{color:'#64748b', fontSize:'0.875rem'}}>{tank.size} • {tank.type}</span>
                </div>

                <div style={{padding:'2rem', flex:1, display:'flex', flexDirection:'column'}}>
                  
                  <div style={{position:'relative', background:'#f8fafc', padding:'1rem', borderRadius:'0.75rem', border:'1px solid #e2e8f0', textAlign:'center', marginBottom:'auto'}}>
                    <p style={{fontSize:'0.75rem', fontWeight:'bold', color:'#64748b', textTransform:'uppercase', margin:0}}>Last Water Change</p>
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
                    {wcTask && (
                        <button 
                            onClick={() => setHistoryOpenId(isHistoryOpen ? null : tank.id)}
                            style={{
                                position:'absolute', top:'10px', right:'10px', 
                                border:'none', background:'none', color:'#94a3b8', cursor:'pointer'
                            }}
                        >
                            <Clock size={18} />
                        </button>
                    )}
                  </div>
                  
                  {wcTask && (
                    <div style={{marginTop:'2rem'}}>
                      {showSideButtons ? (
                        <div style={{display:'flex', gap:'1rem'}}>
                          <button 
                            onClick={() => onComplete(tank.id, wcTaskIndex, 'Left')}
                            style={{
                              flex:1, padding:'1rem', background:'#dbeafe', color:'#1e40af', border:'none', borderRadius:'0.75rem', fontWeight:'bold', fontSize:'1rem', cursor:'pointer'
                            }}
                          >
                            Left
                          </button>
                          <button 
                            onClick={() => onComplete(tank.id, wcTaskIndex, 'Right')}
                            style={{
                              flex:1, padding:'1rem', background:'#dbeafe', color:'#1e40af', border:'none', borderRadius:'0.75rem', fontWeight:'bold', fontSize:'1rem', cursor:'pointer'
                            }}
                          >
                            Right
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => onComplete(tank.id, wcTaskIndex, null)}
                          style={{
                            width:'100%', padding:'1rem', background:'#2563eb', color:'white', border:'none', borderRadius:'0.75rem', fontWeight:'bold', fontSize:'1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', boxShadow:'0 4px 6px rgba(37, 99, 235, 0.2)'
                          }}
                        >
                          <Droplets size={20} />
                          Log Water Change Today
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isHistoryOpen && wcTask && (
                    <div style={{
                        position:'absolute', top:0, left:0, width:'100%', height:'100%', 
                        background:'white', zIndex:20, display:'flex', flexDirection:'column'
                    }}>
                        <div style={{padding:'1rem', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f8fafc'}}>
                            <span style={{fontWeight:'bold', color:'#334155'}}>History Log</span>
                            <button onClick={() => setHistoryOpenId(null)} style={{border:'none', background:'none', cursor:'pointer'}}><X size={20}/></button>
                        </div>
                        <div style={{flex:1, overflowY:'auto', padding:'1rem'}}>
                            {wcTask.history && wcTask.history.length > 0 ? (
                                <ul style={{listStyle:'none', padding:0, margin:0}}>
                                    {wcTask.history.map((entry, hIndex) => {
                                        const dateStr = typeof entry === 'string' ? entry : entry.date;
                                        const side = typeof entry === 'object' ? entry.side : null;
                                        const uniqueId = `${tank.id}-${wcTaskIndex}-${hIndex}`;
                                        const isEditing = editingEntryId === uniqueId;

                                        return (
                                            <li key={hIndex} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.75rem 0', borderBottom:'1px dashed #e2e8f0'}}>
                                                {isEditing ? (
                                                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                                        <input 
                                                            type="date" 
                                                            value={editDateValue}
                                                            onChange={(e) => setEditDateValue(e.target.value)}
                                                            style={{border:'1px solid #cbd5e1', borderRadius:'4px', padding:'2px', fontSize:'0.85rem'}}
                                                        />
                                                        <button onClick={() => saveEdit(tank.id, wcTaskIndex, hIndex)} style={{border:'none', background:'none', color:'#22c55e', cursor:'pointer'}}><Save size={16}/></button>
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
                                                        <button 
                                                            onClick={() => startEditing(uniqueId, dateStr)} 
                                                            style={{border:'none', background:'none', color:'#3b82f6', cursor:'pointer'}}
                                                        >
                                                            <Pencil size={14}/>
                                                        </button>
                                                        <button 
                                                            onClick={() => onDeleteHistory(tank.id, wcTaskIndex, hIndex)} 
                                                            style={{border:'none', background:'none', color:'#ef4444', cursor:'pointer'}}
                                                        >
                                                            <Trash2 size={14}/>
                                                        </button>
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
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}