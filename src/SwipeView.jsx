import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { Droplets } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function SwipeView({ tanks, onComplete, categoryName }) {
  const displayTitle = categoryName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

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
            const wcTaskIndex = tank.tasks.findIndex(t => t.name.toLowerCase().includes("water change")) || 0;
            const wcTask = tank.tasks[wcTaskIndex];

            return (
              <SwiperSlide key={tank.id} style={{
                background: 'white',
                borderRadius: '1rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                height: '520px' 
              }}>
                <div style={{height:'100px', background:'linear-gradient(135deg, #2563eb, #06b6d4)'}}></div>
                
                <div style={{marginTop:'-40px', textAlign:'center', padding:'0 1rem'}}>
                  <div style={{width:'80px', height:'80px', margin:'0 auto', background:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}>
                    🐠
                  </div>
                  <h3 style={{fontSize:'1.5rem', fontWeight:'bold', color:'#1e293b', margin:'1rem 0 0.5rem 0'}}>{tank.name}</h3>
                  <span style={{color:'#64748b', fontSize:'0.875rem'}}>{tank.size} • {tank.type}</span>
                </div>

                <div style={{padding:'2rem', flex:1}}>
                  <div style={{background:'#f8fafc', padding:'1rem', borderRadius:'0.75rem', border:'1px solid #e2e8f0', textAlign:'center', marginBottom:'1.5rem'}}>
                    <p style={{fontSize:'0.75rem', fontWeight:'bold', color:'#64748b', textTransform:'uppercase', margin:0}}>Last Water Change</p>
                    <p style={{fontSize:'1.25rem', fontWeight:'bold', color:'#1e293b', margin:'0.5rem 0 0 0'}}>
                      {wcTask && wcTask.lastCompleted 
                        ? new Date(wcTask.lastCompleted).toLocaleDateString() 
                        : 'Never'}
                    </p>
                  </div>
                  
                  {wcTask && (
                    <button 
                      onClick={() => onComplete(tank.id, wcTaskIndex)}
                      style={{
                        width:'100%', padding:'1rem', background:'#2563eb', color:'white', border:'none', borderRadius:'0.75rem', fontWeight:'bold', fontSize:'1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', boxShadow:'0 4px 6px rgba(37, 99, 235, 0.2)'
                      }}
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