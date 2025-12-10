// src/SwipeView.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function SwipeView({ categoryId, items, onLog }) {
  const displayTitle = categoryId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-slate-800">{displayTitle}</h2>
      
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Swiper
          modules={[Pagination, Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={true}
          pagination={{ clickable: true }}
          className="w-full max-w-md h-[600px] rounded-2xl"
        >
          {items.map((item) => (
            <SwiperSlide key={item.id} className="bg-white rounded-2xl shadow-xl flex flex-col relative overflow-hidden">
              {/* Header Gradient */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-cyan-400 z-0"></div>
              
              <div className="relative z-10 pt-16 text-center px-4">
                <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center text-4xl mb-4 border-4 border-white">
                  🐠
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{item.name}</h3>
              </div>

              {/* Stats */}
              <div className="relative z-10 mt-6 px-6 space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Last Changed</p>
                  <p className="text-xl font-bold text-slate-800">{item.lastWaterChange || 'Never'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold">Temp</p>
                    <p className="font-medium text-slate-800">{item.temp || '--'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold">pH</p>
                    <p className="font-medium text-slate-800">{item.ph || '--'}</p>
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="mt-auto p-6 relative z-10">
                <button 
                  onClick={() => onLog(categoryId, item.id)}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Log Water Change (Today)
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}