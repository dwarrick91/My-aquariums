// src/Homepage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Homepage({ allData }) {
  // Flatten data to show everything at once
  const allTanks = [
    ...allData.homeAquariums, 
    ...allData.meemawsTank
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Overview</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-gray-200">
          <h3 className="font-semibold text-slate-700">Water Change Status</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {allTanks.map((tank) => (
            <div key={tank.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
              <div>
                <div className="font-medium text-gray-900">{tank.name}</div>
                <div className="text-sm text-gray-500">
                   Last: <span className="font-medium">{tank.lastWaterChange}</span>
                </div>
              </div>
              <Link to={`/view/homeAquariums`} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm font-medium">
                View
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}