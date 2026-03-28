import React, { useState, useEffect } from 'react';
import { 
  MapContainer, TileLayer, Polyline, Circle, Marker, Popup, useMapEvents, useMap
} from 'react-leaflet';
import { 
  Bike, LayoutDashboard, Map as MapIcon, Search, Bell, Settings, 
  BarChart3, FileText, Target, Landmark, Activity, ShieldAlert,
  Zap, TrendingUp, Download, Filter, ChevronRight, PlusCircle,
  Leaf, Info, AlertTriangle, MousePointer2, Gauge, Menu, X
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

// --- KOMPONENT DO OBSŁUGI KLIKNIĘĆ NA MAPIE ---
function MapClickHandler({ startPoint, setStartPoint, endPoint, setEndPoint, setPlannedRoute, setCorridorStats }) {
  useMapEvents({
    click(e) {
      // Upewniamy się, że pobieramy same wartości liczbowe
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      if (!startPoint || (startPoint && endPoint)) {
        setStartPoint([lat, lng]);
        setEndPoint(null);
        setPlannedRoute(null);
        setCorridorStats(null);
      } else {
        setEndPoint([lat, lng]);
      }
    }
  });
  return null;
}

// --- KOMPONENT DO DOPASOWANIA WIDOKU MAPY DO TRASY ---
const RouteBoundsFitter = ({ route }) => {
  const map = useMap();
  useEffect(() => {
    if (route && Array.isArray(route) && route.length > 0) {
      try {
        const bounds = L.polyline(route).getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
      } catch (err) {
        console.error("Błąd dopasowania mapy:", err);
      }
    }
  }, [route, map]);
  return null;
};

// --- GŁÓWNA APLIKACJA ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Punkty wybierane na mapie
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [plannedRoute, setPlannedRoute] = useState(null);
  const [corridorStats, setCorridorStats] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Funkcja sugerująca trasę na podstawie punktów startowego i końcowego
  const handleSuggestCorridor = async () => {
	  if (!startPoint || !endPoint) return;

	  setLoadingRoute(true);
	  setCorridorStats(null);
	  try {
		const response = await axios.post('http://127.0.0.1:8000/suggest-corridor', {
		  start_lat: startPoint[0],
		  start_lon: startPoint[1],
		  end_lat: endPoint[0],
		  end_lon: endPoint[1]
		});

		// ... wewnątrz handleSuggestCorridor
		if (response.data?.geometry?.coordinates) {
		  const rawCoords = response.data.geometry.coordinates;
		  
		  // LOGUJEMY DANE - sprawdź czy w konsoli przeglądarki (F12) 
		  // pierwszy element to na pewno liczba ok. 50 (Lat)
		  console.log("Dane docierające do frontendu:", rawCoords[0]); 

		  // Skoro backend wysyła [Lat, Lon], po prostu przypisujemy:
		  setPlannedRoute(rawCoords);
		}
		
		if (response.data?.statistics) {
		  setCorridorStats(response.data.statistics);
		}
	  } catch (error) {
		  console.error('Error calculating route:', error);
		  if (error.response?.status === 500) {
			alert('Silnik AI: Nie znaleziono ścieżki między tymi punktami. Spróbuj kliknąć bliżej głównych dróg.');
		  } else {
			alert('Błąd połączenia z silnikiem AI.');
		  }
		} finally {
		  setLoadingRoute(false);
		}
	};

  // Funkcja sterująca treścią (to tutaj naprawiliśmy "pusty ekran")
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Active Cyclists" value="12,482" sub="+14% from yesterday" icon={Activity} color="text-[#4FE172]" />
              <StatCard label="CO2 Saved" value="84.2 t" sub="Monthly target: 100t" icon={Leaf} color="text-emerald-400" />
              <StatCard label="Avg. Speed" value="18.4 km/h" sub="Urban flow optimal" icon={Zap} color="text-yellow-500" />
              <StatCard label="Safety Incidents" value="0" sub="Last 24 hours" icon={ShieldAlert} color="text-red-500" />
            </div>
            <div className="bg-zinc-900/30 h-64 md:h-96 rounded-[2rem] border border-white/5 flex items-center justify-center border-dashed">
               <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-xs md:text-base text-center px-4">Network Activity Visualization</p>
            </div>
          </div>
        );

      case 'investments':
        return (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0 mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-black font-headline tracking-tighter mb-2">INVESTMENT PRIORITIZATION</h2>
                <p className="text-zinc-500 max-w-2xl text-sm">Strategic ranking of infrastructure projects based on Social ROI.</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                 <button className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg text-xs font-bold border border-white/5"><Filter size={14}/> Filter</button>
                 <button className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-[#4FE172] text-[#003913] rounded-lg text-xs font-black"><Download size={14}/> Export</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
               <div className="md:col-span-4 bg-zinc-900/50 p-8 rounded-[2rem] border border-white/5">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Highest SROI</span>
                  <h3 className="text-2xl font-bold mt-4 mb-2">Vistula Corridor</h3>
                  <div className="text-5xl font-black text-[#4FE172] font-headline">4.8x</div>
               </div>
               <div className="md:col-span-8 bg-zinc-900/50 p-8 rounded-[2rem] border border-white/5 flex items-center justify-center italic text-zinc-600 min-h-[200px]">
                  Priority Matrix Visualization Placeholder
               </div>
            </div>
          </div>
        );

      case 'gap_analysis':
        return (
          <div className="h-[calc(100vh-12rem)] md:h-[70vh] flex flex-col md:flex-row animate-in fade-in">
            <div className="w-full md:w-[75%] bg-zinc-950 rounded-l-[2rem] border border-white/5 border-r-0 overflow-hidden relative min-h-[300px]">
               <div className="absolute inset-0 opacity-40">
                  <MapContainer center={[50.061, 19.936]} zoom={13} zoomControl={false} className="h-full w-full grayscale contrast-125">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <Circle center={[50.061, 19.936]} radius={1000} pathOptions={{color: '#ef4444', fillOpacity: 0.2}} />
                  </MapContainer>
               </div>
               <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-zinc-900/90 backdrop-blur px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">High Deficiency Zone</span>
                  <span className="text-[10px] font-black uppercase tracking-widest sm:hidden">Deficiency Zone</span>
               </div>
            </div>
            <div className="w-full md:w-[25%] bg-zinc-900/50 p-6 md:p-8 rounded-r-[2rem] border border-white/5 space-y-6 md:space-y-8 flex flex-col">
               <h2 className="text-2xl font-black font-headline tracking-tighter">INFRASTRUCTURE GAPS</h2>
               <div className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded-xl">
                  <p className="text-[10px] font-black text-red-500 uppercase">Safety Gap</p>
                  <p className="text-2xl font-black">-24.8%</p>
               </div>
               <div className="space-y-4">
                  <div className="p-4 bg-zinc-800/30 rounded-xl border border-white/5">
                    <p className="text-xs font-bold">Mitte-Wedding Corridor</p>
                    <p className="text-[10px] text-red-500 font-black uppercase mt-1">Critical Priority</p>
                  </div>
               </div>
            </div>
          </div>
        );

      case 'planner':
		  return (
			<div className="flex flex-col md:flex-row h-[calc(100vh-12rem)] md:h-[75vh] animate-in slide-in-from-right-4 duration-500">
               <div className="flex-1 md:w-[75%] bg-zinc-950 rounded-l-[2rem] border border-white/5 border-r-0 overflow-hidden min-h-[300px]">
				  <MapContainer 
					  center={[50.061, 19.936]} 
					  zoom={14} 
					  zoomControl={false} 
					  className="h-full w-full bg-zinc-900" // Usuń grayscale i brightness
					>
					 <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
					 
                     {/* BINDING ZDARZEŃ KLIKNIĘCIA DLA MAPY */}
                     <MapClickHandler 
                        startPoint={startPoint} setStartPoint={setStartPoint}
                        endPoint={endPoint} setEndPoint={setEndPoint}
                        setPlannedRoute={setPlannedRoute} setCorridorStats={setCorridorStats}
                     />

                     {/* MARKERY PRAWIDŁOWYCH ZAZNACZEŃ NA MAPIE */}
                     {startPoint && <Marker position={startPoint} />}
                     {endPoint && <Marker position={endPoint} />}

					 {/* WYŚWIETLANIE TRASY - dodaj sprawdzenie czy plannedRoute to tablica */}
						{Array.isArray(plannedRoute) && plannedRoute.length > 0 && (
						  <>
							<Polyline 
							  positions={plannedRoute} 
							  color="#4FE172" 
							  weight={5} 
							  opacity={0.8} 
							  dashArray="10, 10" 
							/>
							<RouteBoundsFitter route={plannedRoute} />
						  </>
						)}
				  </MapContainer>
			   </div>
			   <div className="w-full md:w-[25%] md:min-w-[320px] bg-zinc-900/50 p-6 rounded-r-[2rem] border border-white/5 overflow-y-auto custom-scrollbar shrink-0 max-h-[50vh] md:max-h-none">
				  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6">Corridor Settings</h3>
				  <div className="space-y-6">
					 <div>
						<label className="text-[10px] font-black text-zinc-500 uppercase">Select Routing Points</label>
						<div className="mt-2 text-xs text-zinc-400 font-mono bg-zinc-950 p-3 rounded-lg border border-white/5">
						  START: {Array.isArray(startPoint) ? `${startPoint[0].toFixed(5)}, ${startPoint[1].toFixed(5)}` : 'Awaiting click...'}
						  <br/>
						  END: {Array.isArray(endPoint) ? `${endPoint[0].toFixed(5)}, ${endPoint[1].toFixed(5)}` : 'Awaiting click...'}
						</div>
                        <p className="text-[10px] text-zinc-500 mt-2">Kliknij na mapę po lewej stronie, aby wyznaczyć punkt A i punkt B.</p>
					 </div>
					 <button 
						onClick={handleSuggestCorridor}
                        disabled={loadingRoute || !startPoint || !endPoint}
						className={`w-full py-4 text-[#003913] font-black rounded-xl uppercase text-[10px] mt-6 md:mt-8 transition-all ${loadingRoute || !startPoint || !endPoint ? 'bg-zinc-600 cursor-not-allowed opacity-50' : 'bg-[#4FE172] hover:brightness-110 active:scale-95'}`}
					 >
						{loadingRoute ? 'Calculating Routing Engine...' : 'Suggest Corridor'}
					 </button>
           
           {corridorStats && (
             <div className="mt-6 p-4 bg-zinc-950 rounded-xl border border-white/10 text-sm animate-in fade-in">
                <p className="font-bold text-[#4FE172] mb-1">Corridor Statistics</p>
                <div className="mt-3 text-xs text-zinc-400 space-y-2">
                   <div className="flex justify-between">
					  <span>Distance:</span>
					  <span className="font-mono text-zinc-200">
						{((corridorStats.distance || 0) / 1000).toFixed(2)} km
					  </span>
					</div>
					<div className="flex justify-between">
					  <span>Noise Index:</span>
					  <span className="font-mono text-zinc-200">
						{(corridorStats.avg_noise || 0).toFixed(1)}%
					  </span>
					</div>
					<div className="flex justify-between">
					  <span>Green Index:</span>
					  <span className="font-mono text-zinc-200">
						{(corridorStats.avg_green || 0).toFixed(1)}%
					  </span>
					</div>
                   <div className="flex justify-between">
                     <span>Safety Focus:</span>
                     <span className="font-mono text-[#4FE172]">{corridorStats.safety_focus}</span>
                   </div>
                </div>
             </div>
           )}
				  </div>
			   </div>
			</div>
		  );

      case 'analytics':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
             <div className="md:col-span-2 bg-zinc-900/30 h-64 md:h-96 rounded-[2rem] border border-white/5 flex items-center justify-center">
                <BarChart3 size={48} className="text-zinc-800" />
             </div>
             <div className="bg-zinc-900/30 p-6 md:p-8 rounded-[2rem] border border-white/5">
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
             <h2 className="text-2xl font-black font-headline tracking-tighter mb-6 md:mb-8">Generated Reports</h2>
             {[1,2,3].map(i => (
               <div key={i} className="bg-zinc-900/50 p-4 md:p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-800/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-zinc-950 rounded-xl text-[#4FE172] shrink-0"><FileText size={20}/></div>
                     <div>
                        <p className="font-bold text-xs md:text-sm line-clamp-1">Monthly Infrastructure Audit - Q{i} 2026</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">PDF • 4.2 MB • Generated 2 days ago</p>
                     </div>
                  </div>
                  <Download size={18} className="text-zinc-600 hidden sm:block" />
               </div>
             ))}
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-2xl bg-zinc-900/30 p-6 md:p-10 rounded-[2rem] border border-white/5 animate-in slide-in-from-top-4">
             <h2 className="text-xl font-black font-headline tracking-tighter mb-6 md:mb-8">SYSTEM SETTINGS</h2>
             <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-2xl">
                   <span className="text-xs font-bold uppercase tracking-widest">Dark Mode AI Interface</span>
                   <div className="w-10 h-5 bg-[#4FE172] rounded-full relative shrink-0"><div className="absolute right-1 top-1 w-3 h-3 bg-[#003913] rounded-full"></div></div>
                </div>
                <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-2xl opacity-50">
                   <span className="text-xs font-bold uppercase tracking-widest">Real-time Traffic Sync</span>
                   <div className="w-10 h-5 bg-zinc-800 rounded-full relative shrink-0"><div className="absolute left-1 top-1 w-3 h-3 bg-zinc-600 rounded-full"></div></div>
                </div>
             </div>
          </div>
        );

      default:
        return <div className="text-zinc-800 font-black text-4xl md:text-6xl italic opacity-10">VIEW_NOT_FOUND</div>;
    }
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="bg-[#131315] text-[#e5e1e4] font-sans h-[100dvh] flex flex-col md:flex-row overflow-hidden w-full">
      
      {/* --- SIDEBAR (DESKTOP) & MOBILE MENU PULLOUT --- */}
      <aside className={`fixed md:relative z-[60] w-64 md:border-r border-white/5 bg-[#09090B] flex flex-col py-6 px-4 h-full transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="mb-10 px-4 flex justify-between items-center">
           <div>
             <div className="flex items-center gap-2 mb-1">
               <div className="p-1.5 bg-[#4FE172]/20 rounded-lg"><Bike className="text-[#4FE172]" size={20}/></div>
               <span className="text-xl font-black text-[#4FE172] tracking-tighter uppercase font-headline">Apex Velo</span>
             </div>
             <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">Planning Intelligence</p>
           </div>
           {/* Przycisk zamknięcia na mobile */}
           <button className="md:hidden text-zinc-500 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
             <X size={24} />
           </button>
        </div>

        <nav className="flex flex-col gap-1 flex-grow overflow-y-auto custom-scrollbar">
          <NavButton active={activeTab === 'dashboard'} onClick={() => handleNavClick('dashboard')} icon={<LayoutDashboard size={18}/>} label="Dashboard" />
          <NavButton active={activeTab === 'investments'} onClick={() => handleNavClick('investments')} icon={<Landmark size={18}/>} label="Investments" />
          <NavButton active={activeTab === 'gap_analysis'} onClick={() => handleNavClick('gap_analysis')} icon={<Target size={18}/>} label="Gap Analysis" />
          <NavButton active={activeTab === 'planner'} onClick={() => handleNavClick('planner')} icon={<MapIcon size={18}/>} label="Route Planner" />
          <NavButton active={activeTab === 'analytics'} onClick={() => handleNavClick('analytics')} icon={<BarChart3 size={18}/>} label="City Analytics" />
          <NavButton active={activeTab === 'reports'} onClick={() => handleNavClick('reports')} icon={<FileText size={18}/>} label="Network Report" />
          <NavButton active={activeTab === 'settings'} onClick={() => handleNavClick('settings')} icon={<Settings size={18}/>} label="Settings" />
        </nav>

        <button className="mt-auto md:mt-4 w-full py-3 bg-[#4FE172] text-[#003913] font-black text-[10px] uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#4FE172]/10 active:scale-95 transition-all shrink-0">
          <PlusCircle size={14}/> New Simulation
        </button>
      </aside>

      {/* MOBILE OVERLAY BACKGROUND */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative h-[100dvh]">
        
        {/* TOP BAR */}
        <header className="h-16 shrink-0 bg-[#131315]/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 border-b border-white/5 z-40">
           <div className="flex items-center gap-3">
              {/* Przycisk Hamburger Menu (Mobile) */}
              <button 
                className="p-2 -ml-2 text-zinc-400 hover:text-white md:hidden rounded-lg hover:bg-white/5"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={20} />
              </button>
              <h1 className="text-sm font-black uppercase tracking-[0.2em] text-[#4FE172] truncate">{activeTab.replace('_', ' ')}</h1>
           </div>
           
           <div className="flex items-center gap-4 md:gap-6">
              <div className="relative group hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#4FE172]" size={14}/>
                <input className="bg-zinc-900 border-none rounded-full pl-10 pr-4 py-1.5 text-xs w-64 focus:ring-1 focus:ring-[#4FE172]/50 transition-all text-white outline-none" placeholder="Search data points..." />
              </div>
              <div className="flex items-center gap-3">
                 <Bell size={18} className="text-zinc-500 cursor-pointer hover:text-white transition-colors" />
                 <div className="h-8 w-8 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Strategy" alt="avatar" className="w-full h-full object-cover" />
                 </div>
              </div>
           </div>
        </header>

        {/* WORKSPACE AREA */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar relative z-10 w-full">
          {renderContent()}
        </div>

        {/* BACKGROUND DECORATION */}
        <div className="absolute bottom-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#4FE172]/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none z-0"></div>
      </main>
    </div>
  );
}