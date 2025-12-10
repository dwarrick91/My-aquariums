// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; 
import Homepage from './Homepage';
import SwipeView from './SwipeView.jsx';

// Initial Data
const initialData = {
  homeAquariums: [
    { id: 1, name: "Living Room Tank", lastWaterChange: "2023-10-25", temp: "78°F", ph: "7.2" },
    { id: 2, name: "Bedroom Betta", lastWaterChange: "2023-10-20", temp: "80°F", ph: "7.0" },
    { id: 3, name: "Office Shrimp", lastWaterChange: "2023-10-28", temp: "72°F", ph: "7.5" },
  ],
  hermitCrabs: [
    { id: 4, name: "Main Crabitat", lastWaterChange: "N/A", humidity: "80%" },
  ],
  plants: [
    { id: 5, name: "Monstera", lastWaterChange: "2023-10-26" },
    { id: 6, name: "Pothos", lastWaterChange: "2023-10-22" },
  ],
  meemawsTank: [
    { id: 7, name: "Meemaw's Guppies", lastWaterChange: "2023-10-15", temp: "75°F" },
  ],
  rodi: [
    { id: 8, name: "Basement RODI", lastFilterChange: "2023-09-01", tds: "0" },
  ],
};

export default function App() {
  const [data, setData] = useState(initialData);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // LOGIC: Updates the specific item's date to Today
  const logWaterChange = (categoryKey, itemId) => {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    setData(prevData => {
      const categoryList = prevData[categoryKey];
      const updatedList = categoryList.map(item => {
        if (item.id === itemId) {
          return { ...item, lastWaterChange: today };
        }
        return item;
      });
      return { ...prevData, [categoryKey]: updatedList };
    });
    alert("Water change logged for today!");
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex font-sans">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-4 flex justify-between items-center border-b border-slate-700">
            <h1 className="text-xl font-bold">Tank Tracker</h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white"><X size={24} /></button>
          </div>
          <nav className="p-4 space-y-2">
            <Link to="/" onClick={() => setSidebarOpen(false)} className="block py-2 px-4 hover:bg-slate-800 rounded">Dashboard</Link>
            <div className="pt-4 pb-2 text-xs text-slate-400 uppercase font-bold">Your Lists</div>
            {Object.keys(data).map(key => (
              <Link key={key} to={`/view/${key}`} onClick={() => setSidebarOpen(false)} className="block py-2 px-4 hover:bg-slate-800 rounded capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-white shadow-sm p-4 flex items-center lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-700"><Menu size={24} /></button>
            <span className="ml-4 font-bold text-lg">My Tanks</span>
          </header>

          <div className="flex-1 overflow-auto p-4">
            <Routes>
              {/* Pass the live data to Homepage */}
              <Route path="/" element={<Homepage allData={data} />} />
              
              {/* Pass the update function to SwipeView */}
              <Route path="/view/:categoryId" element={<SwipeViewWrapper data={data} onLog={logWaterChange} />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

function SwipeViewWrapper({ data, onLog }) {
  const { categoryId } = useParams();
  const items = data[categoryId] || [];
  return <SwipeView categoryId={categoryId} items={items} onLog={onLog} />;
}