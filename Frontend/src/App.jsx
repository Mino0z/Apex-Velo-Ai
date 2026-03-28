import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { Bike, Shield, Wind, Zap, Activity, LayoutDashboard, Map as MapIcon, Settings, Navigation, Cloud, Volume2, AlertTriangle, Search, Bell, Radio } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const mockRoute = [[50.0647, 19.9450], [50.0614, 19.9365], [50.0580, 19.9340], [50.0520, 19.9400]];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' lub 'simulation'
  const [safetyWeight, setSafetyWeight] = useState(50);
  const [ecoWeight, setEcoWeight] = useState(50);
  const [currentRoute, setCurrentRoute] = useState(mockRoute);
  const [backendStatus, setBackendStatus] = useState("System gotowy");

  const generateRoute = async () => {
    setBackendStatus("Obliczanie optymalnej ścieżki...");
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/test', {
        params: { safety: safetyWeight, eco: ecoWeight }
      });
      setBackendStatus(response.data.message);
    } catch (e) {
      setBackendStatus("Błąd połączenia z silnikiem Apex");
    }
  };

  return (
    <div className="bg-[#09090B] text-[#e5e1e4] font-sans h-screen flex overflow-hidden">
      
      {/* --- BOCZNE MENU (SideNavBar) --- */}
      <nav className="w-72 border-r border-white/5 bg-[#09090B] flex flex-col py-8 px-4 z-50">
        <div className="mb-10 px-4">
          <div className="flex items-center gap-2 mb-1">
            <Bike className="text-[#4FE172]" size={32} />
            <span className="text-2xl font-bold tracking-tighter text-[#4FE172]">Apex Velo AI</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-headline ml-1">The Kinetic Navigator</p>
        </div>

        <div className="flex flex-col gap-2 flex-grow">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-zinc-900 text-[#4FE172] border-l-4 border-[#4FE172]' : 'text-zinc-400 hover:bg-zinc-800/40'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'simulation' ? 'bg-zinc-900 text-[#4FE172] border-l-4 border-[#4FE172]' : 'text-zinc-400 hover:bg-zinc-800/40'}`}
          >
            <Activity size={20} />
            <span className="font-medium">Route Planner</span>
          </button>
        </div>

        <button className="w-full py-4 bg-gradient-to-r from-[#4FE172] to-[#20BF55] text-[#003913] font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10">
          <Zap size={18} fill="currentColor" /> Start Ride
        </button>
      </nav>

      {/* --- GŁÓWNA TREŚĆ --- */}
      <main className="flex-1 flex flex-col relative">
        
        {/* TOP BAR */}
        <header className="h-20 bg-[#09090B]/70 backdrop-blur-xl flex items-center justify-between px-8 border-b border-white/5 z-40">
          <h1 className="text-xl font-black text-[#20BF55] uppercase tracking-tight">
            {activeTab === 'dashboard' ? 'Rider Dashboard' : 'Route Simulation'}
          </h1>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input className="bg-zinc-900 border-none rounded-full py-2 pl-10 pr-4 text-sm w-64" placeholder="Search routes..." />
            </div>
            <Radio size={20} className="text-zinc-400" />
            <div className="w-8 h-8 rounded-full border border-[#4FE172]/20 bg-zinc-800"></div>
          </div>
        </header>

        {/* CONTENT ZALEŻNY OD TABU */}
        <div className="flex-1 relative overflow-hidden">
          
          {/* MAPA (Wspólna dla obu widoków) */}
          <MapContainer center={[50.0614, 19.9365]} zoom={14} className="absolute inset-0 z-0 grayscale contrast-[1.2] brightness-[0.6]">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <Polyline positions={currentRoute} color="#4FE172" weight={6} />
          </MapContainer>

          {/* NAKŁADKA DASHBOARD (Bento Grid) */}
          {activeTab === 'dashboard' && (
            <div className="relative z-10 p-8 grid grid-cols-12 gap-6 h-full content-start pointer-events-none">
              <div className="col-span-4 bg-[#131315]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/5 pointer-events-auto shadow-2xl">
                <h3 className="font-bold text-lg mb-6">Quick Start</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 text-sm font-bold">Nowa Huta</div>
                  <div className="p-4 bg-zinc-900 text-[#4FE172] rounded-xl border border-[#4FE172]/30 font-bold">Rynek Główny</div>
                </div>
                <button className="w-full mt-6 py-3 bg-[#4FE172] text-[#003913] font-bold rounded-xl">Go Now</button>
              </div>

              <div className="col-start-10 col-span-3 space-y-4 pointer-events-auto">
                <MetricCard icon={<Cloud size={18}/>} label="Smog Index" value="24" sub="Optimal" color="border-[#4FE172]" textColor="text-[#4FE172]" />
                <MetricCard icon={<Volume2 size={18}/>} label="Noise Level" value="62" sub="Moderate" color="border-[#ffb95f]" textColor="text-[#ffb95f]" />
                <MetricCard icon={<AlertTriangle size={18}/>} label="Hazard Density" value="0.8" sub="Low Risk" color="border-red-500" textColor="text-red-500" />
              </div>
            </div>
          )}

          {/* NAKŁADKA SIMULATION (Twoje suwaki) */}
          {activeTab === 'simulation' && (
            <div className="relative z-10 p-8 pointer-events-none">
              <div className="w-80 bg-[#131315]/90 backdrop-blur-xl p-6 rounded-2xl border border-white/5 pointer-events-auto shadow-2xl space-y-6">
                <h3 className="font-bold text-[#4FE172]">Algorytm AI</h3>
                <div>
                  <label className="text-xs text-zinc-500 block mb-2 font-bold uppercase">Bezpieczeństwo: {safetyWeight}%</label>
                  <input type="range" className="w-full accent-[#4FE172]" value={safetyWeight} onChange={(e) => setSafetyWeight(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-2 font-bold uppercase">Ekologia: {ecoWeight}%</label>
                  <input type="range" className="w-full accent-[#4FE172]" value={ecoWeight} onChange={(e) => setEcoWeight(Number(e.target.value))} />
                </div>
                <button onClick={generateRoute} className="w-full py-3 bg-[#4FE172] text-[#003913] font-bold rounded-xl">Przelicz trasę</button>
                <p className="text-[10px] text-zinc-400 italic">Status: {backendStatus}</p>
              </div>
            </div>
          )}
        </div>

        {/* DYNAMIC FOOTER */}
        <footer className="h-24 bg-[#09090B] border-t border-white/5 px-8 flex items-center justify-between z-40">
           <div className="flex gap-12">
              <FooterStat label="Travel Time" value="22m" sub="-4m saved" color="text-white" />
              <FooterStat label="Route Exposure" value="Low" sub="PM2.5" color="text-white" />
              <FooterStat label="Safety Score" value="9.8/10" sub="" color="text-[#4FE172]" />
           </div>
           <div className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-xl border border-white/5">
              <span className="flex h-2 w-2 rounded-full bg-[#4FE172] animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Live Traffic Data Active</span>
           </div>
        </footer>
      </main>
    </div>
  );
}

// Pomocnicze komponenty, żeby kod był czytelny
const MetricCard = ({ icon, label, value, sub, color, textColor }) => (
  <div className={`bg-[#131315]/80 backdrop-blur-md p-5 rounded-2xl border-l-4 ${color} shadow-xl`}>
    <div className="flex justify-between items-start mb-2">
      <span className="text-[10px] font-bold uppercase text-zinc-500">{label}</span>
      <span className={textColor}>{icon}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-white">{value}</span>
      <span className={`text-[10px] font-bold uppercase ${textColor}`}>{sub}</span>
    </div>
  </div>
);

const FooterStat = ({ label, value, sub, color }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-bold text-zinc-500 uppercase">{label}</span>
    <span className={`text-xl font-bold ${color}`}>{value} <span className="text-zinc-500 text-xs font-normal ml-1">{sub}</span></span>
  </div>
);

export default App;