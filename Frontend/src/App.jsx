import React, { useState } from 'react';
import { 
  MapContainer, TileLayer, Polyline, Circle, Marker, Popup 
} from 'react-leaflet';
import { 
  Bike, LayoutDashboard, Map as MapIcon, Search, Bell, Settings, 
  BarChart3, FileText, Target, Landmark, Activity, ShieldAlert,
  Zap, TrendingUp, Download, Filter, ChevronRight, PlusCircle,
  Leaf, Info, AlertTriangle, MousePointer2, Gauge
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// --- ATOMOWE KOMPONENTY UI ---
const NavButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-all w-full ${active ? 'bg-[#4FE172]/10 text-[#4FE172] border-r-4 border-[#4FE172]' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'}`}>
    {icon} <span className="text-[10px] font-black uppercase tracking-widest leading-none">{label}</span>
  </button>
);

const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
    <div className="flex justify-between items-start mb-4">
      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{label}</p>
      <Icon size={18} className={color} />
    </div>
    <div className="text-3xl font-black font-headline mb-1">{value}</div>
    <p className="text-[10px] font-bold text-zinc-600 uppercase">{sub}</p>
  </div>
);

// --- GŁÓWNA APLIKACJA ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [plannedRoute, setPlannedRoute] = useState(null);
  const [routeStats, setRouteStats] = useState(null); // Nowy stan na statystyki z AI
  const [isLoading, setIsLoading] = useState(false); // Stan ładowania

  const handleGenerateRoute = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/suggest-corridor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_lat: 50.061, // Możesz tu potem podpiąć zmienne z markerów
          start_lon: 19.936,
          end_lat: 50.067,
          end_lon: 19.955
        }),
      });

      if (!response.ok) throw new Error('Błąd silnika AI');

      const data = await response.json();
      
      // Backend zwraca [lat, lon], Leaflet to rozumie jako positions
      setPlannedRoute(data.geometry.coordinates);
      setRouteStats(data.statistics);
    } catch (error) {
      console.error("Connection error:", error);
      alert("AI Engine is offline. Start your FastAPI server!");
    } finally {
      setIsLoading(false);
    }
  };

  // Funkcja sterująca treścią (to tutaj naprawiliśmy "pusty ekran")
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-4 gap-6">
              <StatCard label="Active Cyclists" value="12,482" sub="+14% from yesterday" icon={Activity} color="text-[#4FE172]" />
              <StatCard label="CO2 Saved" value="84.2 t" sub="Monthly target: 100t" icon={Leaf} color="text-emerald-400" />
              <StatCard label="Avg. Speed" value="18.4 km/h" sub="Urban flow optimal" icon={Zap} color="text-yellow-500" />
              <StatCard label="Safety Incidents" value="0" sub="Last 24 hours" icon={ShieldAlert} color="text-red-500" />
            </div>
            <div className="bg-zinc-900/30 h-96 rounded-[2rem] border border-white/5 flex items-center justify-center border-dashed">
               <p className="text-zinc-600 font-black uppercase tracking-[0.3em]">Network Activity Visualization</p>
            </div>
          </div>
        );

      case 'investments':
        return (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-4xl font-black font-headline tracking-tighter mb-2">INVESTMENT PRIORITIZATION</h2>
                <p className="text-zinc-500 max-w-2xl text-sm">Strategic ranking of infrastructure projects based on Social ROI.</p>
              </div>
              <div className="flex gap-3">
                 <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg text-xs font-bold border border-white/5"><Filter size={14}/> Filter</button>
                 <button className="flex items-center gap-2 px-4 py-2 bg-[#4FE172] text-[#003913] rounded-lg text-xs font-black"><Download size={14}/> Export</button>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-6">
               <div className="col-span-4 bg-zinc-900/50 p-8 rounded-[2rem] border border-white/5">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Highest SROI</span>
                  <h3 className="text-2xl font-bold mt-4 mb-2">Vistula Corridor</h3>
                  <div className="text-5xl font-black text-[#4FE172] font-headline">4.8x</div>
               </div>
               <div className="col-span-8 bg-zinc-900/50 p-8 rounded-[2rem] border border-white/5 flex items-center justify-center italic text-zinc-600">
                  Priority Matrix Visualization Placeholder
               </div>
            </div>
          </div>
        );

      case 'gap_analysis':
        return (
          <div className="h-[70vh] flex gap-6 animate-in fade-in">
            <div className="w-96 bg-zinc-900/50 p-8 rounded-[2rem] border border-white/5 space-y-8">
               <h2 className="text-2xl font-black font-headline tracking-tighter">INFRASTRUCTURE GAPS</h2>
               <div className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded-xl">
                  <p className="text-[10px] font-black text-red-500 uppercase">Safety Gap</p>
                  <p className="text-2xl font-black">-24.8%</p>
               </div>
               <div className="space-y-4">
                  <div className="p-4 bg-zinc-800/30 rounded-xl border border-white/5">
                    <p className="text-xs font-bold">Mitte-Wedding Corridor</p>
                    <p className="text-[10px] text-red-400 font-black uppercase mt-1 text-red-500">Critical Priority</p>
                  </div>
               </div>
            </div>
            <div className="flex-1 bg-zinc-950 rounded-[2rem] border border-white/5 overflow-hidden relative">
               <div className="absolute inset-0 opacity-40">
                  <MapContainer center={[50.061, 19.936]} zoom={13} zoomControl={false} className="h-full w-full grayscale contrast-125">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <Circle center={[50.061, 19.936]} radius={1000} pathOptions={{color: '#ef4444', fillOpacity: 0.2}} />
                  </MapContainer>
               </div>
               <div className="absolute top-6 left-6 bg-zinc-900/90 backdrop-blur px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">High Deficiency Zone</span>
               </div>
            </div>
          </div>
        );

      case 'planner':
        return (
          <div className="flex gap-6 h-[75vh] animate-in slide-in-from-right-4 duration-500">
            <div className="w-80 bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5 flex flex-col">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6">Route Settings</h3>
              
              <div className="space-y-6 flex-grow">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase">Safety Preference</label>
                  <input type="range" className="w-full accent-[#4FE172] mt-2" />
                </div>
                
                {/* DYNAMICZNE STATYSTYKI Z AI */}
                {routeStats && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[9px] text-zinc-500 uppercase font-black">Distance</p>
                      <p className="text-lg font-bold text-[#4FE172]">{routeStats.Dystans}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[9px] text-zinc-500 uppercase font-black">Greenery</p>
                      <p className="text-lg font-bold text-emerald-400">{routeStats["Udział zieleni"]}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[9px] text-zinc-500 uppercase font-black">Avg. Noise</p>
                      <p className="text-lg font-bold text-yellow-500">{routeStats["Średni hałas"]}</p>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={handleGenerateRoute}
                disabled={isLoading}
                className={`w-full py-4 ${isLoading ? 'bg-zinc-700' : 'bg-[#4FE172]'} text-[#003913] font-black rounded-xl uppercase text-[10px] mt-8 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2`}
              >
                {isLoading ? <Zap className="animate-spin" size={14}/> : <MousePointer2 size={14}/>}
                {isLoading ? "AI is Calculating..." : "Generate Optimal Route"}
              </button>
            </div>

            <div className="flex-1 bg-zinc-950 rounded-[2rem] border border-white/5 overflow-hidden">
              <MapContainer center={[50.0647, 19.9450]} zoom={14} zoomControl={false} className="h-full w-full grayscale brightness-75">
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                
                {plannedRoute && (
                  <>
                    <Polyline positions={plannedRoute} color="#4FE172" weight={6} opacity={0.9} />
                    {/* Markery dla startu i końca */}
                    <Circle center={plannedRoute[0]} radius={20} pathOptions={{color: '#4FE172', fillColor: '#4FE172', fillOpacity: 1}} />
                    <Circle center={plannedRoute[plannedRoute.length - 1]} radius={20} pathOptions={{color: '#fff', fillColor: '#fff', fillOpacity: 1}} />
                  </>
                )}
              </MapContainer>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="grid grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
             <div className="col-span-2 bg-zinc-900/30 h-96 rounded-[2rem] border border-white/5 flex items-center justify-center">
                <BarChart3 size={48} className="text-zinc-800" />
             </div>
             <div className="bg-zinc-900/30 h-96 rounded-[2rem] border border-white/5 p-8">
                <h3 className="font-black uppercase text-[10px] tracking-widest text-zinc-500 mb-4">Top Routes</h3>
                <div className="space-y-4">
                   {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl border border-white/5"></div>)}
                </div>
             </div>
          </div>
        );

      case 'reports':
        return (
          <div className="max-w-4xl space-y-4 animate-in fade-in">
             <h2 className="text-2xl font-black font-headline tracking-tighter mb-8">Generated Reports</h2>
             {[1,2,3].map(i => (
               <div key={i} className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-zinc-800/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-zinc-950 rounded-xl text-[#4FE172]"><FileText size={20}/></div>
                     <div>
                        <p className="font-bold text-sm">Monthly Infrastructure Audit - Q{i} 2026</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase">PDF • 4.2 MB • Generated 2 days ago</p>
                     </div>
                  </div>
                  <Download size={18} className="text-zinc-600" />
               </div>
             ))}
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-2xl bg-zinc-900/30 p-10 rounded-[2rem] border border-white/5 animate-in slide-in-from-top-4">
             <h2 className="text-xl font-black font-headline tracking-tighter mb-8">SYSTEM SETTINGS</h2>
             <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-2xl">
                   <span className="text-xs font-bold uppercase tracking-widest">Dark Mode AI Interface</span>
                   <div className="w-10 h-5 bg-[#4FE172] rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-[#003913] rounded-full"></div></div>
                </div>
                <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-2xl opacity-50">
                   <span className="text-xs font-bold uppercase tracking-widest">Real-time Traffic Sync</span>
                   <div className="w-10 h-5 bg-zinc-800 rounded-full relative"><div className="absolute left-1 top-1 w-3 h-3 bg-zinc-600 rounded-full"></div></div>
                </div>
             </div>
          </div>
        );

      default:
        return <div className="text-zinc-800 font-black text-6xl italic opacity-10">VIEW_NOT_FOUND</div>;
    }
  };

  return (
    <div className="bg-[#131315] text-[#e5e1e4] font-sans h-screen flex overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-white/5 bg-[#09090B] flex flex-col py-6 px-4 z-50">
        <div className="mb-10 px-4">
           <div className="flex items-center gap-2 mb-1">
             <div className="p-1.5 bg-[#4FE172]/20 rounded-lg"><Bike className="text-[#4FE172]" size={20}/></div>
             <span className="text-xl font-black text-[#4FE172] tracking-tighter uppercase font-headline">Apex Velo</span>
           </div>
           <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">Planning Intelligence</p>
        </div>

        <nav className="flex flex-col gap-1 flex-grow">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="Dashboard" />
          <NavButton active={activeTab === 'investments'} onClick={() => setActiveTab('investments')} icon={<Landmark size={18}/>} label="Investments" />
          <NavButton active={activeTab === 'gap_analysis'} onClick={() => setActiveTab('gap_analysis')} icon={<Target size={18}/>} label="Gap Analysis" />
          <NavButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} icon={<MapIcon size={18}/>} label="Route Planner" />
          <NavButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 size={18}/>} label="City Analytics" />
          <NavButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<FileText size={18}/>} label="Network Report" />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18}/>} label="Settings" />
        </nav>

        <button className="mt-auto w-full py-3 bg-[#4FE172] text-[#003913] font-black text-[10px] uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#4FE172]/10 active:scale-95 transition-all">
          <PlusCircle size={14}/> New Simulation
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* TOP BAR */}
        <header className="h-16 bg-[#131315]/80 backdrop-blur-xl flex items-center justify-between px-8 border-b border-white/5 z-40">
           <div className="flex items-center gap-4">
              <h1 className="text-sm font-black uppercase tracking-[0.2em] text-[#4FE172]">{activeTab.replace('_', ' ')}</h1>
           </div>
           <div className="flex items-center gap-6">
              <div className="relative group hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#4FE172]" size={14}/>
                <input className="bg-zinc-900 border-none rounded-full pl-10 pr-4 py-1.5 text-xs w-64 focus:ring-1 focus:ring-[#4FE172]/50 transition-all text-white" placeholder="Search data points..." />
              </div>
              <div className="flex items-center gap-3">
                 <Bell size={18} className="text-zinc-500 cursor-pointer hover:text-white transition-colors" />
                 <div className="h-8 w-8 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Strategy" alt="avatar" />
                 </div>
              </div>
           </div>
        </header>

        {/* WORKSPACE AREA */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {renderContent()}
        </div>

        {/* BACKGROUND DECORATION */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#4FE172]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
      </main>
    </div>
  );
}