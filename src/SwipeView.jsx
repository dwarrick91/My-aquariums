import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { Droplets } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function SwipeView({ tanks, onComplete, categoryName }) {
  const displayTitle = categoryName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  if (!tanks || tanks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p>No items found in {displayTitle}.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-slate-800 capitalize">{displayTitle}</h2>
      
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Swiper
          modules={[Pagination, Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={true}
          pagination={{ clickable: true }}
          className="w-full max-w-md h-[550px]"
        >
          {tanks.map((tank) => {
            // Find the water change task (usually the first one, or search by name)
            const wcTaskIndex = tank.tasks.findIndex(t => t.name.toLowerCase().includes("water change"));
            const wcTask = wcTaskIndex >= 0 ? tank.tasks[wcTaskIndex] : null;

            return (
              <SwiperSlide key={tank.id} className="bg-white rounded-2xl shadow-xl flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-cyan-500 z-0"></div>
                
                <div className="relative z-10 pt-8 text-center px-4">
                  <div className="w-20 h-20 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center text-3xl mb-3 border-4 border-white">
                    🐠
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{tank.name}</h3>
                  <span className="text-sm text-gray-500">{tank.size} • {tank.type}</span>
                </div>

                <div className="relative z-10 mt-6 px-6 space-y-4 flex-1 overflow-y-auto">
                  {/* Status Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Last Water Change</p>
                    <p className="text-xl font-bold text-slate-800">
                      {wcTask && wcTask.lastCompleted 
                        ? new Date(wcTask.lastCompleted).toLocaleDateString() 
                        : 'Never'}
                    </p>
                  </div>

                  {/* Task List for Mobile */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase">Tasks</p>
                    {tank.tasks.map((task, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                        <span>{task.name}</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">Every {task.frequency} days</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Big Action Button */}
                <div className="mt-auto p-6 relative z-10 bg-white border-t">
                  {wcTask && (
                    <button 
                      onClick={() => onComplete(tank.id, wcTaskIndex)}
                      className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Droplets size={20} />
                      Log Water Change Today
                    </button>
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