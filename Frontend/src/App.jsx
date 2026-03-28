import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet';
import { 
  Bike, Zap, Activity, LayoutDashboard, Map as MapIcon, 
  Search, Bell, Radio, Navigation, Edit3,
  BarChart3, Layers, ShieldAlert, Thermometer, FileText, PlusCircle,
  Settings, Heart, Leaf, Gauge, Trash2, CheckCircle2, RefreshCw, ChevronDown,
  Hub, Link2Off, TrendingUp, Info, ExternalLink
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// --- DATA MOCKS ---
const corridorData = [
  { id: 'CX-402', name: 'Downtown Central Bypass', length: '1.42 Miles', spec: 'Barrier-Separated', impact: '9.8/10', status: 'high' },
  { id: 'CX-811', name: 'Riverside Extension', length: '0.85 Miles', spec: 'Curb-Protected', impact: '8.4/10', status: 'medium' },
  { id: 'CX-129', name: 'University Link Phase II', length: '2.10 Miles', spec: 'Two-Way Cycleway', impact: '9.2/10', status: 'high' }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [selectedRoute, setSelectedRoute] = useState('green');

  return (
    <div className="bg-[#131315] text-[#e5e1e4] font-sans h-screen flex overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 border-r border-white/5 bg-[#09090B] flex flex-col py-8 px-4 z-50">
        <div className="mb-10 px-4">
          <div className="flex items-center gap-3">
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
          <NavButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<FileText size={18}/>} label="Connectivity Report" />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18}/>} label="Settings" />
        </nav>

        <div className="mt-auto p-4 border-t border-white/5">
           <button className="w-full py-3 bg-zinc-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all">
             New Simulation
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        
        {/* HEADER */}
        <header className="sticky top-0 h-20 bg-[#09090B]/70 backdrop-blur-xl flex items-center justify-between px-8 border-b border-white/5 z-40">
          <div className="flex items-center gap-4">
             <h1 className="text-xl font-black text-[#20BF55] uppercase font-headline">
               {activeTab.replace('_', ' ')}
             </h1>
          </div>
          <div className="flex items-center bg-zinc-900/50 px-4 py-2 rounded-full border border-white/5">
            <Search size={14} className="text-zinc-500 mr-2" />
            <input className="bg-transparent border-none focus:ring-0 text-xs w-48" placeholder="Search corridors..." />
          </div>
        </header>

        {/* WORKSPACE */}
        <div className="flex-1 p-8">
          
          {/* --- VIEW: CONNECTIVITY REPORT --- */}
          {activeTab === 'reports' && (
            <div className="max-w-7xl mx-auto space-y-10">
              {/* Report Header */}
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-black font-headline tracking-tighter mb-2">NETWORK CONNECTIVITY</h2>
                  <p className="text-zinc-500 max-w-xl text-sm">Visualizing urban cycling permeability and infrastructure cohesion across the metro area.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global Connectivity Score</span>
                  <div className="text-6xl font-black text-[#4FE172] font-headline">74.2</div>
                </div>
              </div>

              {/* Top Section: Map & Critical Links */}
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8 bg-zinc-900/50 rounded-3xl h-[450px] relative overflow-hidden border border-white/5">
                  <div className="absolute inset-0 grayscale opacity-30">
                     <MapContainer center={[50.0614, 19.9365]} zoom={13} zoomControl={false} className="h-full w-full">
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                     </MapContainer>
                  </div>
                  <div className="absolute top-6 left-6 p-4 bg-zinc-950/80 backdrop-blur-md rounded-2xl border border-white/10">
                    <h4 className="text-[10px] font-black uppercase mb-3">Connectivity Heatmap</h4>
                    <div className="space-y-2">
                       <LegendItem color="bg-[#4FE172]" label="Fully Integrated" />
                       <LegendItem color="bg-orange-500" label="Disconnected" />
                       <LegendItem color="bg-red-500" label="Broken Link" />
                    </div>
                  </div>
                </div>

                <div className="col-span-4 space-y-6">
                   <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-3xl">
                      <h4 className="text-red-500 font-bold flex items-center gap-2 mb-4 text-sm uppercase tracking-wider">
                        <Link2Off size={16}/> Critical Broken Links
                      </h4>
                      <div className="space-y-3">
                         <LinkIssue title="Bridge St. Intersection" desc="200m gap between bike lanes" />
                         <LinkIssue title="Westside Viaduct" desc="Hazardous arterial crossing" />
                      </div>
                   </div>
                   <div className="bg-[#4FE172]/5 border border-[#4FE172]/20 p-6 rounded-3xl">
                      <h4 className="text-[#4FE172] font-bold flex items-center gap-2 mb-2 text-sm uppercase tracking-wider">
                        Transit Integration
                      </h4>
                      <div className="text-3xl font-black mb-4">88% <span className="text-xs font-normal text-zinc-500">+12% vs LY</span></div>
                      <div className="flex items-end gap-1 h-12">
                         {[30, 50, 45, 70, 60, 90].map((h, i) => (
                           <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-[#4FE172]/40 rounded-t-sm"></div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>

              {/* Bottom Section: Table */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-6 font-headline tracking-tight">Recommended Connecting Corridors</h3>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5">
                      <th className="pb-4">Corridor ID</th>
                      <th className="pb-4">Project Name</th>
                      <th className="pb-4">Length</th>
                      <th className="pb-4 text-right">Impact Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {corridorData.map((row, i) => (
                      <tr key={i} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                        <td className="py-6 font-mono text-xs text-zinc-500">{row.id}</td>
                        <td className="py-6 font-bold">{row.name}</td>
                        <td className="py-6 text-zinc-400 text-sm">{row.length}</td>
                        <td className={`py-6 text-right font-black ${row.status === 'high' ? 'text-[#4FE172]' : 'text-orange-400'}`}>
                          {row.impact}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ... Pozostałe widoki ... */}
          {activeTab === 'dashboard' && <div className="text-center py-20 opacity-20 text-4xl font-black">DASHBOARD VIEW</div>}
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

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase">
    <div className={`w-2 h-2 rounded-full ${color}`}></div> {label}
  </div>
);

const LinkIssue = ({ title, desc }) => (
  <div className="p-4 bg-black/20 rounded-xl flex justify-between items-center group cursor-pointer hover:bg-black/40 transition-all">
    <div>
      <h5 className="text-xs font-bold text-white mb-0.5">{title}</h5>
      <p className="text-[10px] text-zinc-500">{desc}</p>
    </div>
    <ChevronDown size={14} className="-rotate-90 text-zinc-600 group-hover:text-white" />
  </div>
);

export default App;