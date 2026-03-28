import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline, CircleMarker } from 'react-leaflet';
import { 
  Bike, Zap, Activity, LayoutDashboard, Map as MapIcon, 
  Search, Bell, Radio, Wind, Volume2, AlertTriangle, 
  Navigation, Park, Timer, TrendingUp, ChevronDown, Edit3
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Przykładowe trasy do porównania
const routes = {
  green: [[50.0647, 19.9450], [50.0680, 19.9550], [50.0750, 19.9600]],
  fastest: [[50.0647, 19.9450], [50.0614, 19.9365], [50.0580, 19.9340]]
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'simulation', 'planner'
  const [selectedRoute, setSelectedRoute] = useState('green');
  const [safetyWeight, setSafetyWeight] = useState(50);
  const [ecoWeight, setEcoWeight] = useState(50);

  return (
    <div className="bg-[#09090B] text-[#e5e1e4] font-sans h-screen flex overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 border-r border-white/5 bg-[#09090B] flex flex-col py-8 px-4 z-50">
        <div className="mb-10 px-4">
          <div className="flex items-center gap-2 mb-1">
            <Bike className="text-[#4FE172]" size={32} />
            <span className="text-2xl font-bold tracking-tighter text-[#4FE172] font-headline">Apex Velo AI</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-headline ml-1">The Kinetic Navigator</p>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
          <NavButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} icon={<MapIcon size={20}/>} label="Route Planner" />
          <NavButton active={activeTab === 'simulation'} onClick={() => setActiveTab('simulation')} icon={<Activity size={20}/>} label="Analytics (AI)" />
        </nav>

        <button className="w-full py-4 bg-gradient-to-r from-[#4FE172] to-[#20BF55] text-[#003913] font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform active:scale-95">
          <Zap size={18} fill="currentColor" /> Start Ride
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative">
        
        {/* TOP BAR */}
        <header className="h-20 bg-[#09090B]/70 backdrop-blur-xl flex items-center justify-between px-8 border-b border-white/5 z-40">
          <h1 className="text-xl font-black text-[#20BF55] uppercase font-headline">
            {activeTab === 'dashboard' ? 'User Overview' : activeTab === 'planner' ? 'Route Selection' : 'AI Simulation'}
          </h1>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input className="bg-zinc-900 border-none rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-1 focus:ring-[#4FE172]" placeholder="Search destinations..." />
            </div>
            <div className="flex gap-4 text-zinc-400">
               <Bell size={20} className="hover:text-[#4FE172] cursor-pointer" />
               <Radio size={20} className="hover:text-[#4FE172] cursor-pointer" />
               <div className="w-9 h-9 rounded-full border border-[#4FE172]/20 bg-zinc-800 overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
               </div>
            </div>
          </div>
        </header>

        {/* MAP & OVERLAYS */}
        <div className="flex-1 relative">
          <MapContainer center={[50.0614, 19.9365]} zoom={14} className="absolute inset-0 z-0 grayscale contrast-[1.2] brightness-[0.5]">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <Polyline positions={routes.green} color={selectedRoute === 'green' ? "#4FE172" : "#3f3f46"} weight={selectedRoute === 'green' ? 8 : 4} opacity={selectedRoute === 'green' ? 1 : 0.4} />
            <Polyline positions={routes.fastest} color={selectedRoute === 'fastest' ? "#ef4444" : "#3f3f46"} weight={selectedRoute === 'fastest' ? 8 : 4} opacity={selectedRoute === 'fastest' ? 1 : 0.4} />
          </MapContainer>

          {/* 1. DASHBOARD OVERLAY */}
          {activeTab === 'dashboard' && (
            <div className="relative z-10 p-8 grid grid-cols-12 gap-6 pointer-events-none">
              <div className="col-span-4 bg-zinc-900/80 backdrop-blur-xl p-6 rounded-2xl border border-white/5 pointer-events-auto shadow-2xl">
                <h3 className="font-bold text-lg mb-6 font-headline">Quick Start</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-zinc-500"></div>
                    <span className="text-sm">42nd St, Manhattan, NY</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-800/80 rounded-xl border border-[#4FE172]/30">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#4FE172] shadow-[0_0_8px_#4FE172]"></div>
                      <span className="text-sm font-bold">Central Park South</span>
                    </div>
                    <Edit3 size={14} className="text-[#4FE172]" />
                  </div>
                </div>
                <button className="w-full mt-8 py-4 bg-[#4FE172] text-[#003913] font-black rounded-xl hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20">GO NOW</button>
              </div>
            </div>
          )}

          {/* 2. ROUTE PLANNER OVERLAY */}
          {activeTab === 'planner' && (
            <div className="relative z-10 p-8 grid grid-cols-12 gap-6 h-full pointer-events-none overflow-hidden">
              <div className="col-span-4 flex flex-col gap-4 pointer-events-auto overflow-y-auto pr-2">
                
                {/* Green Path Card */}
                <div 
                  onClick={() => setSelectedRoute('green')}
                  className={`p-6 rounded-2xl border-l-4 transition-all cursor-pointer shadow-2xl ${selectedRoute === 'green' ? 'bg-zinc-800 border-[#4FE172]' : 'bg-zinc-900/60 border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="bg-[#4FE172]/10 text-[#4FE172] text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Recommended</span>
                      <h3 className="text-2xl font-black font-headline mt-2">Green Path</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-[#4FE172]">24<span className="text-xs ml-1">min</span></div>
                      <div className="text-[10px] text-zinc-500 uppercase">5.2 km</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <MiniStat label="Smog" value="12%" color="bg-[#4FE172]" w="w-[12%]" />
                    <MiniStat label="Noise" value="58dB" color="bg-[#4FE172]" w="w-[40%]" />
                  </div>
                </div>

                {/* Fastest Path Card */}
                <div 
                  onClick={() => setSelectedRoute('fastest')}
                  className={`p-6 rounded-2xl border-l-4 transition-all cursor-pointer shadow-xl ${selectedRoute === 'fastest' ? 'bg-zinc-800 border-red-500' : 'bg-zinc-900/60 border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold font-headline text-zinc-400">Fastest</h3>
                    <div className="text-right">
                      <div className="text-2xl font-black text-zinc-400">18<span className="text-xs ml-1">min</span></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <MiniStat label="Smog" value="64%" color="bg-red-500" w="w-[64%]" />
                    <MiniStat label="Noise" value="82dB" color="bg-red-500" w="w-[80%]" />
                  </div>
                </div>
              </div>
              
              {/* Bottom Metrics Chip */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="bg-zinc-900/90 backdrop-blur-xl p-4 rounded-2xl border border-white/5 flex gap-10 items-center pointer-events-auto">
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-zinc-500 font-bold">AQI Index</span>
                      <span className="text-2xl font-black text-[#4FE172] font-headline">32 <span className="text-[10px] bg-[#4FE172]/20 px-2 py-0.5 rounded ml-2">Excellent</span></span>
                   </div>
                   <div className="w-[1px] h-10 bg-white/10"></div>
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-zinc-500 font-bold">Wind Speed</span>
                      <span className="text-2xl font-black font-headline">12<span className="text-xs font-medium ml-1">km/h</span></span>
                   </div>
                </div>
                <div className="bg-[#4FE172] p-6 rounded-2xl pointer-events-auto cursor-pointer shadow-2xl shadow-emerald-500/20 active:scale-95 transition-transform">
                   <Navigation size={32} className="text-[#003913]" fill="currentColor" />
                </div>
              </div>
            </div>
          )}

          {/* 3. SIMULATION OVERLAY */}
          {activeTab === 'simulation' && (
            <div className="relative z-10 p-8 pointer-events-none">
              <div className="w-80 bg-zinc-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/5 pointer-events-auto shadow-2xl space-y-6">
                <h3 className="font-bold text-[#4FE172] font-headline">AI Algorithm Tuning</h3>
                <Slider label="Safety Weight" val={safetyWeight} setVal={setSafetyWeight} />
                <Slider label="Ecological Focus" val={ecoWeight} setVal={setEcoWeight} />
                <button className="w-full py-3 bg-[#4FE172] text-[#003913] font-bold rounded-xl hover:brightness-110">Re-calculate Paths</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Komponenty pomocnicze
const NavButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? 'bg-zinc-900 text-[#4FE172] border-l-4 border-[#4FE172]' : 'text-zinc-500 hover:text-zinc-200'}`}>
    {icon} <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
  </button>
);

const MiniStat = ({ label, value, color, w }) => (
  <div className="bg-black/20 p-2 rounded-lg">
    <div className="text-[9px] uppercase text-zinc-500 mb-1">{label}</div>
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold">{value}</span>
      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} ${w}`}></div>
      </div>
    </div>
  </div>
);

const Slider = ({ label, val, setVal }) => (
  <div>
    <div className="flex justify-between mb-2">
      <label className="text-xs text-zinc-500 uppercase font-bold">{label}</label>
      <span className="text-xs text-[#4FE172]">{val}%</span>
    </div>
    <input type="range" className="w-full accent-[#4FE172]" value={val} onChange={(e) => setVal(e.target.value)} />
  </div>
);

export default App;