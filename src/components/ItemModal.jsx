import React, { useState, useEffect, useRef } from 'react';
import { X, ImageIcon, Trash2 } from 'lucide-react';

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

export default ItemModal;