import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet';
import { 
  Bike, Zap, Activity, LayoutDashboard, Map as MapIcon, 
  Search, Bell, Radio, Wind, Navigation, Edit3,
  BarChart3, Layers, ShieldAlert, Thermometer, FileText, PlusCircle
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Dane testowe
const routes = {
  green: [[50.0647, 19.9450], [50.0680, 19.9550], [50.0750, 19.9600]],
  fastest: [[50.0647, 19.9450], [50.0614, 19.9365], [50.0580, 19.9340]]
};

// Punkty zapalne (Incidents) dla widoku City Analytics
const incidents = [
  { pos: [50.0620, 19.9400], severity: 'high', label: 'Collision Zone' },
  { pos: [50.0710, 19.9500], severity: 'medium', label: 'High Congestion' }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [selectedRoute, setSelectedRoute] = useState('green');

  return (
    <div className="bg-[#131315] text-[#e5e1e4] font-sans h-screen flex overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 border-r border-white/5 bg-[#09090B] flex flex-col py-8 px-4 z-50">
        <div className="mb-10 px-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-[#4FE172]/10 rounded-lg">
              <Bike className="text-[#4FE172]" size={28} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter text-[#4FE172] block leading-none">APEX VELO</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Kinetic Navigator</span>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="Dashboard" />
          <NavButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} icon={<MapIcon size={18}/>} label="Route Planner" />
          <NavButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 size={18}/>} label="City Analytics" />
          <NavButton active={activeTab === 'simulation'} onClick={() => setActiveTab('simulation')} icon={<Activity size={18}/>} label="AI Simulation" />
        </nav>

        <button className="w-full py-4 bg-gradient-to-r from-[#4FE172] to-[#20BF55] text-[#003913] font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all active:scale-95">
          <PlusCircle size={18} /> Start Ride
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative">
        
        {/* HEADER */}
        <header className="h-20 bg-[#09090B]/70 backdrop-blur-xl flex items-center justify-between px-8 border-b border-white/5 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-[#20BF55] uppercase font-headline tracking-tight">
              {activeTab.replace('_', ' ')}
            </h1>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
              {activeTab === 'analytics' ? 'Network Operational View' : 'Live Data Stream'}
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#4FE172] transition-colors" size={16} />
              <input className="bg-zinc-900/50 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-1 focus:ring-[#4FE172] outline-none" placeholder="Search infrastructure..." />
            </div>
            <div className="flex gap-4 text-zinc-400">
               <Bell size={20} className="hover:text-[#4FE172] cursor-pointer transition-colors" />
               <div className="w-10 h-10 rounded-full border border-[#4FE172]/30 p-0.5 shadow-[0_0_15px_rgba(79,225,114,0.1)]">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="rounded-full bg-zinc-800" />
               </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE */}
        <div className="flex-1 relative overflow-hidden bg-[#131315]">
          
          {/* MAPA (Tło dla wszystkich widoków) */}
          <MapContainer center={[50.0614, 19.9365]} zoom={14} className="absolute inset-0 z-0 grayscale contrast-[1.2] brightness-[0.4]">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            
            {/* Rysuj trasy tylko w widoku Planner */}
            {activeTab === 'planner' && (
              <>
                <Polyline positions={routes.green} color={selectedRoute === 'green' ? "#4FE172" : "#3f3f46"} weight={8} />
                <Polyline positions={routes.fastest} color={selectedRoute === 'fastest' ? "#ef4444" : "#3f3f46"} weight={8} />
              </>
            )}

            {/* Rysuj heatmapę/incydenty tylko w City Analytics */}
            {activeTab === 'analytics' && incidents.map((inc, i) => (
              <CircleMarker key={i} center={inc.pos} radius={20} pathOptions={{ color: inc.severity === 'high' ? '#ef4444' : '#f59e0b', fillOpacity: 0.3, stroke: false }}>
                <Popup>{inc.label}</Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* --- LAYER: CITY ANALYTICS (B2G) --- */}
          {activeTab === 'analytics' && (
            <div className="relative z-10 p-8 grid grid-cols-12 gap-6 h-full pointer-events-none">
              {/* Lewe Overlay: Legendy i Filtry */}
              <div className="col-span-3 space-y-4 pointer-events-auto">
                <div className="bg-[#09090B]/90 backdrop-blur-md p-4 rounded-xl border-l-4 border-[#4FE172] shadow-2xl">
                   <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Active Network Nodes</p>
                   <p className="text-2xl font-black text-white">2,482 <span className="text-xs text-[#4FE172] font-normal ml-2">↑ 12%</span></p>
                </div>
                
                <div className="bg-zinc-900/90 backdrop-blur-md p-6 rounded-2xl border border-white/5">
                  <h4 className="text-xs font-black uppercase mb-4 tracking-tighter text-zinc-400">Kinetic Legend</h4>
                  <div className="space-y-3">
                    <LegendItem color="bg-[#4FE172]" label="Apex Velo Corridor" glow />
                    <LegendItem color="bg-zinc-600" label="Standard Bike Lane" />
                    <LegendItem color="bg-red-500" label="Incident Hotzone" pulse />
                  </div>
                </div>
              </div>

              {/* Prawe Overlay: Wykresy i Propozycje */}
              <div className="col-span-4 col-start-9 space-y-6 pointer-events-auto overflow-y-auto pr-2">
                <div className="bg-zinc-900/90 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold">Flow Capacity</h4>
                    <BarChart3 className="text-[#4FE172]" size={18} />
                  </div>
                  <div className="h-24 flex items-end gap-1.5 px-2">
                    {[40, 65, 85, 70, 45, 30].map((h, i) => (
                      <div key={i} style={{ height: `${h}%` }} className={`flex-1 rounded-t-sm transition-all ${h > 70 ? 'bg-[#4FE172]' : 'bg-zinc-800 hover:bg-zinc-700'}`}></div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#4FE172]/5 backdrop-blur-md p-6 rounded-3xl border border-[#4FE172]/20">
                  <h4 className="font-bold mb-4 flex items-center gap-2"><Layers size={18}/> Pending Proposals</h4>
                  <div className="space-y-3">
                    <ProposalCard title="West-End Extension" tag="Priority Alpha" desc="Connecting central hub to residential zones." />
                    <ProposalCard title="River Crossing 4" tag="Review Required" desc="Structural analysis for Node 102." />
                  </div>
                  <button className="w-full mt-6 py-3 bg-zinc-800 text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors">
                    <FileText size={16} /> Generate Full Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ... (Tu trzymaj pozostałe widoki: dashboard, planner, simulation) ... */}
          {activeTab === 'planner' && <div className="z-10 relative p-8"> {/* Logika Plannera z poprzedniego kroku */} </div>}
          
        </div>
      </main>
    </div>
  );
}

// POMOCNICZE KOMPONENTY (REUSABLE)
const NavButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-[#4FE172]/10 text-[#4FE172] shadow-[inset_0_0_20px_rgba(79,225,114,0.05)]' : 'text-zinc-500 hover:text-zinc-200'}`}>
    {icon} <span className="text-xs font-black uppercase tracking-widest">{label}</span>
  </button>
);

const LegendItem = ({ color, label, glow, pulse }) => (
  <div className="flex items-center gap-3">
    <div className={`w-3 h-3 rounded-full ${color} ${glow ? 'shadow-[0_0_8px_rgba(79,225,114,0.8)]' : ''} ${pulse ? 'animate-pulse' : ''}`}></div>
    <span className="text-[10px] font-bold uppercase text-zinc-500">{label}</span>
  </div>
);

const ProposalCard = ({ title, tag, desc }) => (
  <div className="bg-zinc-900/80 p-4 rounded-xl border border-white/5 hover:border-[#4FE172]/30 transition-all cursor-pointer group">
    <div className="flex justify-between items-start mb-2">
      <span className="text-[9px] font-black px-2 py-0.5 bg-[#4FE172]/10 text-[#4FE172] rounded uppercase">{tag}</span>
    </div>
    <h5 className="text-sm font-bold mb-1 group-hover:text-[#4FE172] transition-colors">{title}</h5>
    <p className="text-[11px] text-zinc-500 leading-tight">{desc}</p>
  </div>
);

export default App;