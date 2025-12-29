// src/ViewPage.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import TaskItem from './components/TaskItem'; // Import the confetti button component

export default function ViewPage({ allData }) {
  // 1. Grab the category from the URL (e.g., "homeAquariums" or "meemawsTank")
  const { category } = useParams();

  // 2. Get the specific list of tanks, or an empty array if not found
  const tanks = allData[category] || [];

  // 3. specific title helper
  const pageTitle = category === 'meemawsTank' ? "Meemaw's Tank" : "Home Aquariums";

  return (
    <div className="dashboard-container">
      {/* Header with Back Button */}
      <div className="status-banner" style={{ display: 'block' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <Link to="/" className="btn-edit-icon" style={{ textDecoration: 'none', fontSize: '1.2rem' }}>
            ←
          </Link>
          <h2 style={{ margin: 0 }}>{pageTitle}</h2>
        </div>
        <p style={{ margin: 0, opacity: 0.7, paddingLeft: '2.5rem' }}>
          Viewing {tanks.length} Tank(s)
        </p>
      </div>

      {/* List of Tanks in this Category */}
      <div className="tanks-list">
        {tanks.map((tank) => (
          <div key={tank.id} className="tank-card open">
            {/* Card Header (Static Info) */}
            <div className="card-header" style={{ cursor: 'default' }}>
              <div className="tank-info">
                <div className="tank-details">
                  <h3>{tank.name}</h3>
                  <p>
                    {tank.gallons} Gallons • {tank.type}
                    {tank.location && ` • ${tank.location}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body (Tasks & Actions) */}
            <div className="card-body">
              <h4 className="notes-title">Maintenance Tasks</h4>
              
              {/* --- THIS IS WHERE THE MAGIC HAPPENS --- */}
              {/* We use the TaskItem component here so the confetti works */}
              
              <TaskItem 
                taskName="Water Change" 
                dueDate={tank.lastWaterChange ? `Last: ${tank.lastWaterChange}` : "Due Now"}
                isOverdue={!tank.lastWaterChange} // Red text if no date exists
                onComplete={() => console.log(`Water change saved for ${tank.name}`)}
              />

              <TaskItem 
                taskName="Filter Maintenance" 
                dueDate="Due in 5 days"
                isOverdue={false}
                onComplete={() => console.log(`Filter cleaned for ${tank.name}`)}
              />

              {/* Notes Section Placeholder */}
              <div className="notes-section">
                <div className="notes-title">Notes</div>
                <div className="note-input-group">
                  <input type="text" placeholder="Add a note..." className="note-input" />
                  <button className="btn-add">+</button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}