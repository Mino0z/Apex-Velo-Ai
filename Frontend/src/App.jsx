import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Circle } from 'react-leaflet';
import { 
  Bike, Zap, Activity, LayoutDashboard, Map as MapIcon, 
  Search, Bell, Radio, Navigation, Edit3,
  BarChart3, Layers, ShieldAlert, Thermometer, FileText, PlusCircle,
  Settings, Heart, Leaf, Gauge, Trash2, CheckCircle2, RefreshCw, ChevronDown,
  Hub, Link2Off, TrendingUp, Info, ExternalLink, AlertTriangle, Target, MousePointer2
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// --- NOWE DANE DLA GAP ANALYSIS ---
const gapZones = [
  { name: "Mitte-Wedding Corridor", status: "CRITICAL", potential: "8.4/10", co2: "+12.4", color: "#ef4444", pos: [50.068, 19.955] },
  { name: "Kreuzberg South Loop", status: "HIGH", potential: "7.9/10", co2: "+8.2", color: "#f97316", pos: [50.055, 19.935] }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [showHeatmap, setShowHeatmap] = useState(true);

  return (
    <div className="bg-[#131315] text-[#e5e1e4] font-sans h-screen flex overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-white/5 bg-[#09090B] flex flex-col py-6 px-4 z-50">
        <div className="mb-10 px-4">
           <span className="text-xl font-black text-[#4FE172] tracking-tighter uppercase font-headline">Apex Velo</span>
           <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">Infrastructure Suite</p>
        </div>

        <nav className="flex flex-col gap-1 flex-grow">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="Dashboard" />
          <NavButton active={activeTab === 'gap_analysis'} onClick={() => setActiveTab('gap_analysis')} icon={<Target size={18}/>} label="Gap Analysis" />
          <NavButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} icon={<MapIcon size={18}/>} label="Route Planner" />
          <NavButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 size={18}/>} label="City Analytics" />
          <NavButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<FileText size={18}/>} label="Network Report" />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18}/>} label="Settings" />
        </nav>

        <button className="mt-auto w-full py-3 bg-gradient-to-r from-[#4FE172] to-emerald-600 text-[#003913] font-black text-[10px] uppercase rounded-xl shadow-lg shadow-emerald-500/10 active:scale-95 transition-all">
          New Simulation
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 relative flex flex-col">
        
        {/* TOP BAR OVERLAY */}
        <header className="absolute top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-8 bg-gradient-to-b from-[#09090B] to-transparent pointer-events-none">
          <div className="pointer-events-auto bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#4FE172] animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#4FE172]">Live Simulation</span>
             </div>
             <div className="h-4 w-px bg-zinc-800"></div>
             <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showHeatmap} onChange={() => setShowHeatmap(!showHeatmap)} className="w-3 h-3 rounded bg-zinc-800 border-zinc-700 text-[#4FE172] focus:ring-0" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Show Heatmap</span>
             </label>
          </div>
          <div className="flex gap-4 pointer-events-auto">
             <div className="w-10 h-10 bg-zinc-900/80 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 cursor-pointer hover:bg-[#4FE172]/20"><Bell size={18}/></div>
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Officer" className="w-10 h-10 rounded-xl border border-white/10" alt="profile" />
          </div>
        </header>

        {/* MAP / CANVAS */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 z-0">
            <MapContainer center={[50.0614, 19.9365]} zoom={14} zoomControl={false} className="h-full w-full grayscale contrast-[1.1] brightness-[0.5]">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {showHeatmap && activeTab === 'gap_analysis' && gapZones.map((z, i) => (
                <Circle key={i} center={z.pos} radius={400} pathOptions={{ color: z.color, fillOpacity: 0.2, stroke: false }} />
              ))}
            </MapContainer>
          </div>

          {/* --- VIEW: INFRASTRUCTURE GAP ANALYSIS --- */}
          {activeTab === 'gap_analysis' && (
            <div className="absolute inset-0 z-10 p-6 flex pointer-events-none">
              
              {/* Left Insights Panel */}
              <div className="w-96 bg-zinc-950/80 backdrop-blur-xl rounded-[2rem] border border-white/5 p-8 pointer-events-auto flex flex-col gap-8 shadow-2xl">
                <div>
                  <span className="text-[10px] font-black text-[#4FE172] uppercase tracking-[0.2em] mb-2 block">Perspective</span>
                  <h2 className="text-3xl font-black font-headline tracking-tighter leading-none">GAP ANALYSIS</h2>
                </div>

                <div className="space-y-4">
                  <GapMetric label="Safety Index Gap" value="-24.8%" status="error" sub="vs Target" />
                  <GapMetric label="Service Deficiency" value="41.2%" status="warning" sub="Unmet Demand" />
                </div>

                <div className="flex-grow overflow-hidden flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Priority Zones</h3>
                    <span className="text-[10px] px-2 py-1 bg-[#4FE172]/10 text-[#4FE172] rounded-full font-bold">TOP 5</span>
                  </div>
                  <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    {gapZones.map((zone, i) => (
                      <ZoneCard key={i} zone={zone} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Legend & Tools */}
              <div className="ml-auto mt-auto flex flex-col gap-4 items-end pointer-events-auto">
                 <div className="bg-zinc-950/80 backdrop-blur-md p-6 rounded-3xl border border-white/5 w-64 shadow-2xl">
                    <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-4 tracking-widest">Map Legend</h4>
                    <div className="space-y-3">
                       <LegendItem color="bg-gradient-to-r from-transparent to-[#4FE172]" label="Existing Network" />
                       <LegendItem color="bg-gradient-to-r from-transparent to-orange-500" label="High Demand Gap" />
                       <div className="h-px bg-white/5 my-2"></div>
                       <div className="text-[10px] text-zinc-500 italic">Analysis based on real-time mobility patterns & historic safety data.</div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* Floating Marker Tool (Simulation) */}
          {activeTab === 'gap_analysis' && (
            <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
               <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-[#4FE172] ring-8 ring-[#4FE172]/20 animate-pulse"></div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-zinc-900 border border-[#4FE172]/30 p-4 rounded-2xl shadow-2xl w-48 text-center backdrop-blur-xl">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Connectivity Index</p>
                    <p className="text-lg font-black text-[#4FE172]">0.12km/km²</p>
                    <p className="text-[9px] text-red-500 font-bold uppercase mt-1">High Deficiency</p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---
const GapMetric = ({ label, value, status, sub }) => (
  <div className={`p-5 rounded-2xl border-l-4 bg-white/5 ${status === 'error' ? 'border-red-500' : 'border-orange-500'}`}>
    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline gap-2">
       <span className={`text-3xl font-black font-headline ${status === 'error' ? 'text-red-500' : 'text-orange-500'}`}>{value}</span>
       <span className="text-[10px] font-bold text-zinc-600">{sub}</span>
    </div>
  </div>
);

const ZoneCard = ({ zone }) => (
  <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-[#4FE172]/30 transition-all cursor-pointer group">
    <div className="flex justify-between items-start mb-3">
      <h4 className="text-xs font-black text-white group-hover:text-[#4FE172] transition-colors">{zone.name}</h4>
      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${zone.status === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
        {zone.status}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-black/20 p-2 rounded-lg text-center">
        <p className="text-[8px] text-zinc-500 uppercase font-bold">Potential</p>
        <p className="text-xs font-black text-[#4FE172]">{zone.potential}</p>
      </div>
      <div className="bg-black/20 p-2 rounded-lg text-center">
        <p className="text-[8px] text-zinc-500 uppercase font-bold">Env. Benefit</p>
        <p className="text-xs font-black text-[#4FE172]">{zone.co2}</p>
      </div>
    </div>
  </div>
);

const NavButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-all ${active ? 'bg-[#4FE172]/10 text-[#4FE172] border-r-4 border-[#4FE172]' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'}`}>
    {icon} <span className="text-[10px] font-black uppercase tracking-widest leading-none">{label}</span>
  </button>
);

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-3">
    <div className={`w-10 h-1.5 rounded-full ${color}`}></div>
    <span className="text-[10px] font-bold text-zinc-400 uppercase">{label}</span>
  </div>
);

export default App;