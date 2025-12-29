// src/Homepage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Homepage({ allData }) {
  // Flatten data but preserve the category for the Link URL
  const allTanks = [
    ...allData.homeAquariums.map(tank => ({ ...tank, category: 'homeAquariums' })),
    ...allData.meemawsTank.map(tank => ({ ...tank, category: 'meemawsTank' }))
  ];

  // Helper to determine dot color
  const getStatusClass = (lastDate) => {
    return lastDate ? 'green' : 'red'; 
  };

  return (
    <div className="dashboard-container">
      
      {/* 1. Summary Banner */}
      <div className="status-banner">
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Aquarium Overview</h2>
          <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
            Total Tanks: {allTanks.length}
          </span>
        </div>
        <div className="status-badge green">
          Active
        </div>
      </div>

      {/* 2. Tank Cards List */}
      <div className="tanks-list">
        {allTanks.map((tank) => (
          <div key={tank.id} className="tank-card">
            {/* Using the .card-header class for the clickable area */}
            <Link 
              to={`/view/${tank.category}`} 
              className="card-header"
              style={{ textDecoration: 'none' }}
            >
              <div className="tank-info">
                {/* The status dot */}
                <div className={`status-dot ${getStatusClass(tank.lastWaterChange)}`}></div>
                
                <div className="tank-details">
                  <div className="title-row">
                    <h3>{tank.name}</h3>
                  </div>
                  <p>Last Change: {tank.lastWaterChange || 'Never'}</p>
                </div>
              </div>
              
              <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>›</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}