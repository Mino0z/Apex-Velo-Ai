import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet';
import { 
  Bike, Zap, Activity, LayoutDashboard, Map as MapIcon, 
  Search, Bell, Radio, Navigation, Edit3,
  BarChart3, Layers, ShieldAlert, Thermometer, FileText, PlusCircle,
  Settings, Heart, Leaf, Gauge, Trash2, CheckCircle2, RefreshCw, ChevronDown
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// --- DATA MOCKS ---
const routes = {
  green: [[50.0647, 19.9450], [50.0680, 19.9550], [50.0750, 19.9600]],
  fastest: [[50.0647, 19.9450], [50.0614, 19.9365], [50.0580, 19.9340]]
};

const incidents = [
  { pos: [50.0620, 19.9400], severity: 'high', label: 'Collision Zone' },
  { pos: [50.0710, 19.9500], severity: 'medium', label: 'High Congestion' }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [selectedRoute, setSelectedRoute] = useState('green');
  const [ridingStyle, setRidingStyle] = useState('eco');

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
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18}/>} label="Settings" />
        </nav>

        {/* User Mini Profile in Sidebar */}
        <div className="mt-auto p-4 border-t border-white/5 flex items-center gap-3">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" className="w-10 h-10 rounded-full border border-[#4FE172]" alt="avatar" />
          <div>
            <p className="text-sm font-bold">Alex Chen</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Pro Navigator</p>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        
        {/* HEADER */}
        <header className="sticky top-0 h-20 bg-[#09090B]/70 backdrop-blur-xl flex items-center justify-between px-8 border-b border-white/5 z-40">
          <h1 className="text-xl font-black text-[#20BF55] uppercase font-headline">
            {activeTab.replace('_', ' ')}
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-zinc-400">
               <Bell size={20} className="hover:text-[#4FE172] cursor-pointer" />
               <Radio size={20} className="hover:text-[#4FE172] cursor-pointer" />
               <ChevronDown size={20} className="hover:text-[#4FE172] cursor-pointer" />
            </div>
          </div>
        </header>

        {/* DYNAMIC CONTENT LAYERS */}
        <div className="flex-1 relative">
          
          {/* MAP LAYER (Only for Dashboard, Planner, Analytics) */}
          {activeTab !== 'settings' && (
            <div className="absolute inset-0 z-0">
              <MapContainer center={[50.0614, 19.9365]} zoom={14} className="h-full w-full grayscale contrast-[1.2] brightness-[0.4]">
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {activeTab === 'planner' && (
                   <Polyline positions={routes[selectedRoute]} color={selectedRoute === 'green' ? "#4FE172" : "#ef4444"} weight={8} />
                )}
                {activeTab === 'analytics' && incidents.map((inc, i) => (
                  <CircleMarker key={i} center={inc.pos} radius={20} pathOptions={{ color: '#ef4444', fillOpacity: 0.3, stroke: false }} />
                ))}
              </MapContainer>
            </div>
          )}

          {/* --- VIEW: SETTINGS & PROFILE --- */}
          {activeTab === 'settings' && (
            <div className="relative z-10 p-10 max-w-5xl mx-auto space-y-12">
              
              {/* Hero Profile Card */}
              <div className="grid grid-cols-12 gap-6 bg-zinc-900/50 p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="col-span-7">
                  <span className="text-[10px] font-black text-[#4FE172] uppercase tracking-[0.2em] mb-2 block">Active Profile</span>
                  <h2 className="text-5xl font-black font-headline tracking-tighter mb-6 uppercase">Alex Chen</h2>
                  <div className="flex gap-4">
                    <StatBadge label="Level" value="Elite Rider" />
                    <StatBadge label="Joined" value="Mar 2024" />
                  </div>
                </div>
                <div className="col-span-5 text-right flex flex-col justify-end">
                   <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Smog Avoided</p>
                   <div className="text-6xl font-black text-[#4FE172] font-headline tracking-tighter">1,248<span className="text-xl ml-2">m³</span></div>
                </div>
                <Leaf className="absolute -right-8 -bottom-8 text-[#4FE172]/5 w-64 h-64" />
              </div>

              {/* Preferences Grid */}
              <div className="grid grid-cols-2 gap-10">
                <section className="space-y-6">
                  <h3 className="font-headline font-bold text-lg flex items-center gap-3">
                    <div className="w-8 h-0.5 bg-[#4FE172]"></div> RIDING STYLE
                  </h3>
                  <div className="space-y-3">
                    <StyleOption 
                      active={ridingStyle === 'eco'} 
                      onClick={() => setRidingStyle('eco')}
                      icon={<Leaf size={20}/>} 
                      title="Eco-friendly" 
                      desc="Prioritize parks and low-emission zones" 
                    />
                    <StyleOption 
                      active={ridingStyle === 'speed'} 
                      onClick={() => setRidingStyle('speed')}
                      icon={<Zap size={20}/>} 
                      title="Speed-priority" 
                      desc="Direct routes using main arteries" 
                    />
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="font-headline font-bold text-lg flex items-center gap-3">
                    <div className="w-8 h-0.5 bg-orange-400"></div> HEALTH DATA
                  </h3>
                  <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center gap-2"><Heart size={16} className="text-red-500"/> Pollution Exposure Tracking</span>
                      <div className="w-10 h-5 bg-[#4FE172] rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase"><span>Weekly Limit</span><span>72%</span></div>
                       <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-orange-400 w-[72%]"></div></div>
                    </div>
                    <button className="w-full py-3 bg-[#4FE172] text-[#003913] font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all">
                      <RefreshCw size={16} /> Sync Apple Health
                    </button>
                  </div>
                </section>
              </div>

              {/* Danger Zone */}
              <div className="pt-10 border-t border-white/5 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                 <div>
                    <h4 className="text-red-500 font-bold">Danger Zone</h4>
                    <p className="text-xs text-zinc-500">Permanently delete your ride history</p>
                 </div>
                 <button className="px-6 py-2 border border-red-500/30 text-red-500 text-xs font-bold rounded-lg hover:bg-red-500/10 transition-colors">
                    Delete Account
                 </button>
              </div>
            </div>
          )}

          {/* ... (Tu trzymaj Dashboard i Planner z poprzednich kroków) ... */}
        </div>
      </main>
    </div>
  );
}

// --- REUSABLE COMPONENTS ---
const NavButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-[#4FE172]/10 text-[#4FE172]' : 'text-zinc-500 hover:text-zinc-200'}`}>
    {icon} <span className="text-xs font-black uppercase tracking-widest">{label}</span>
  </button>
);

const StatBadge = ({ label, value }) => (
  <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5">
    <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-tighter">{label}</p>
    <p className="text-sm font-bold text-white">{value}</p>
  </div>
);

const StyleOption = ({ active, icon, title, desc, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${active ? 'bg-[#4FE172]/5 border-[#4FE172] shadow-lg shadow-emerald-500/5' : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-800'}`}
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-full ${active ? 'bg-[#4FE172] text-[#003913]' : 'bg-zinc-800 text-zinc-500'}`}>{icon}</div>
      <div>
        <h4 className={`font-bold text-sm ${active ? 'text-white' : 'text-zinc-400'}`}>{title}</h4>
        <p className="text-[11px] text-zinc-500">{desc}</p>
      </div>
    </div>
    {active && <CheckCircle2 className="text-[#4FE172]" size={20} />}
  </div>
);

export default App;