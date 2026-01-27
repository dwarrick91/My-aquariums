import React, { useState } from 'react';
import { differenceInDays, addDays, format } from 'date-fns';
import { CheckCircle, Clock, Trash2, ChevronUp, ChevronDown, Pencil, Plus, Save, XCircle } from 'lucide-react';
import ConfettiButton from './ConfettiButton'; // Importing from local component

const Dashboard = ({ tanks, onComplete, onDeleteHistory, onEditHistory, onAddNote, onDeleteNote, onEditItem, onReset }) => {
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
                    
                    const gallons = parseInt(tank.size);
                    const isLarge = !isNaN(gallons) && gallons > 29;
                    const isWaterChange = task.name.toLowerCase().includes("water change");
                    
                    const aquariumTypes = ['Freshwater', 'Saltwater', 'Cichlid', 'Coldwater', 'Brackish'];
                    const isAquarium = aquariumTypes.includes(tank.type);

                    const showSideButtons = isWaterChange && isLarge && isAquarium;

                    return (
                      <div key={index} className="task-item">
                        <div className="task-header">
                          <div>
                            <span style={{display:'block', fontWeight:600, color:'var(--text-main)'}}>{task.name}</span>
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

export default Dashboard;