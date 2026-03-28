import React, { useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import { 
  Bike, LayoutDashboard, Map as MapIcon, Search, Bell, Settings, 
  BarChart3, FileText, Target, TrendingUp, Landmark, 
  ArrowUpRight, Download, Filter, Leaf, HeartPulse, ChevronRight, PlusCircle
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// --- MOCK DANYCH INWESTYCYJNYCH ---
const investmentProjects = [
  { id: 1, name: "Vistula North Express Link", cost: "12.8M PLN", sroi: "4.8x", health: "12.4M", traffic: "28%", score: 92 },
  { id: 2, name: "Old Town Pedestrianization", cost: "4.2M PLN", sroi: "3.2x", health: "8.1M", traffic: "14%", score: 78 },
  { id: 3, name: "District Connectivity Bridge", cost: "31.5M PLN", sroi: "2.1x", health: "5.2M", traffic: "34%", score: 62 }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="bg-[#131315] text-[#e5e1e4] font-sans h-screen flex overflow-hidden">
      
      {/* --- SIDEBAR (Stały element) --- */}
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

        <button className="mt-auto w-full py-3 bg-[#4FE172] text-[#003913] font-black text-[10px] uppercase rounded-xl flex items-center justify-center gap-2">
          <PlusCircle size={14}/> New Simulation
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto bg-[#131315] relative brush-texture">
        
        {/* TOP HEADER */}
        <header className="sticky top-0 h-16 bg-[#131315]/80 backdrop-blur-xl flex items-center justify-between px-8 border-b border-white/5 z-40">
           <div className="flex items-center gap-4">
              <h1 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">{activeTab.replace('_', ' ')}</h1>
           </div>
           <div className="flex items-center gap-6">
              <div className="relative group hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#4FE172]" size={14}/>
                <input className="bg-zinc-900 border-none rounded-full pl-10 pr-4 py-1.5 text-xs w-64 focus:ring-1 focus:ring-[#4FE172]/50 transition-all" placeholder="Search projects or districts..." />
              </div>
              <div className="flex items-center gap-3">
                 <Bell size={18} className="text-zinc-500 cursor-pointer hover:text-white" />
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Strategy" className="w-8 h-8 rounded-full border border-white/10" alt="profile" />
              </div>
           </div>
        </header>

        {/* WORKSPACE */}
        <div className="p-8 max-w-7xl mx-auto">
          
          {/* --- VIEW: INVESTMENT PRIORITIZATION --- */}
          {activeTab === 'investments' && (
            <div className="animate-in fade-in duration-500">
              {/* Header */}
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h2 className="text-4xl font-black font-headline tracking-tighter mb-2">INVESTMENT PRIORITIZATION</h2>
                  <p className="text-zinc-500 max-w-2xl text-sm">Strategic ranking based on Social Return on Investment (SROI) and 2024-2026 cycle targets.</p>
                </div>
                <div className="flex gap-3">
                   <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg text-xs font-bold border border-white/5 hover:bg-zinc-800 transition-all"><Filter size={14}/> Filter</button>
                   <button className="flex items-center gap-2 px-4 py-2 bg-[#4FE172] text-[#003913] rounded-lg text-xs font-black"><Download size={14}/> Export Report</button>
                </div>
              </div>

              {/* Top Bento Cards */}
              <div className="grid grid-cols-12 gap-6 mb-8">
                {/* SROI Hero Card */}
                <div className="col-span-4 bg-zinc-900/50 rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
                   <div className="absolute -top-4 -right-4 text-[#4FE172]/10 group-hover:text-[#4FE172]/20 transition-all">
                      <TrendingUp size={160} />
                   </div>
                   <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-6">Highest Projected SROI</span>
                   <h3 className="text-xl font-bold mb-1">Vistula Corridor Expansion</h3>
                   <div className="text-5xl font-black text-[#4FE172] mb-6 font-headline">4.8x <span className="text-xs font-normal text-zinc-500">Return</span></div>
                   <div className="flex gap-6">
                      <div><p className="text-[10px] text-zinc-500 font-bold uppercase">Smog Red.</p><p className="font-bold text-[#4FE172]">-18.2%</p></div>
                      <div className="w-px bg-white/5 h-8"></div>
                      <div><p className="text-[10px] text-zinc-500 font-bold uppercase">Health Savings</p><p className="font-bold">12.4M/y</p></div>
                   </div>
                </div>

                {/* Impact vs Cost Matrix */}
                <div className="col-span-8 bg-zinc-900/50 rounded-3xl p-8 border border-white/5">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Impact vs. Cost Matrix</h3>
                      <div className="flex gap-4 text-[10px] font-bold">
                         <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#4FE172]"></div> High Priority</span>
                         <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Moderate</span>
                      </div>
                   </div>
                   <div className="h-48 w-full border-l border-b border-white/10 relative flex items-end justify-center">
                      <div className="absolute bottom-[-20px] text-[9px] font-black text-zinc-600 uppercase tracking-widest">Implementation Cost</div>
                      <div className="absolute left-[-40px] top-1/2 -rotate-90 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Social Impact</div>
                      
                      {/* Plot Points */}
                      <div className="absolute top-[20%] left-[80%] w-4 h-4 bg-[#4FE172] rounded-full shadow-lg shadow-[#4FE172]/20 animate-pulse cursor-pointer"></div>
                      <div className="absolute top-[50%] left-[40%] w-3 h-3 bg-[#4FE172]/60 rounded-full border border-[#4FE172] cursor-pointer"></div>
                      <div className="absolute top-[70%] left-[20%] w-2 h-2 bg-orange-500 rounded-full cursor-pointer"></div>
                   </div>
                </div>
              </div>

              {/* Ranking List & Metrics */}
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 space-y-4">
                  <h3 className="text-xl font-bold font-headline mb-4">Infrastructure Rankings</h3>
                  {investmentProjects.map(proj => (
                    <div key={proj.id} className="bg-zinc-900/30 p-5 rounded-2xl border border-white/5 hover:bg-zinc-800/40 transition-all cursor-pointer group flex items-center gap-6">
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center font-black text-[#4FE172]">{proj.id}</div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-sm mb-1 group-hover:text-[#4FE172] transition-colors">{proj.name}</h4>
                        <div className="flex gap-4 text-[10px] font-bold text-zinc-500 uppercase">
                          <span>{proj.cost}</span>
                          <span>{proj.health} Health Sav.</span>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Impact Score</p>
                         <div className="w-24 h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                           <div className="bg-[#4FE172] h-full" style={{width: `${proj.score}%`}}></div>
                         </div>
                      </div>
                      <ChevronRight size={18} className="text-zinc-700 group-hover:text-white" />
                    </div>
                  ))}
                </div>

                {/* Side Stats */}
                <div className="col-span-4 space-y-6">
                   <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
                      <h4 className="text-xs font-black uppercase text-zinc-400 mb-6 tracking-widest">Environmental Yield</h4>
                      <div className="space-y-6">
                         <YieldMetric label="CO2 Offset Combined" value="450 Tons/y" progress={70} />
                         <YieldMetric label="PM2.5 Reduction" value="-14.2%" progress={45} />
                      </div>
                   </div>
                   <div className="bg-gradient-to-br from-[#4FE172]/10 to-transparent p-6 rounded-3xl border border-[#4FE172]/20">
                      <h4 className="font-bold text-sm mb-2">Simulate Budget Shift</h4>
                      <p className="text-[10px] text-zinc-500 leading-relaxed mb-4">Adjust the 2025 budget by ±15% to see ROI impact.</p>
                      <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Run Optimizer</button>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* ... Inne widoki (Dashboard, Analytics itp.) ... */}
          {activeTab === 'dashboard' && <div className="text-center py-20 opacity-20 text-4xl font-black italic">DASHBOARD VIEW ACTIVE</div>}
        </div>
      </main>
    </div>
  );
}

// --- POMOCNICZE KOMPONENTY ---
const NavButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-all ${active ? 'bg-[#4FE172]/10 text-[#4FE172] border-r-4 border-[#4FE172]' : 'text-zinc-500 hover:text-zinc-200'}`}>
    {icon} <span className="text-[10px] font-black uppercase tracking-widest leading-none">{label}</span>
  </button>
);

const YieldMetric = ({ label, value, progress }) => (
  <div>
    <div className="flex justify-between text-[10px] font-bold mb-2">
      <span className="text-zinc-500 uppercase">{label}</span>
      <span className="text-[#4FE172]">{value}</span>
    </div>
    <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
      <div className="bg-[#4FE172] h-full" style={{width: `${progress}%`}}></div>
    </div>
  </div>
);

export default App;