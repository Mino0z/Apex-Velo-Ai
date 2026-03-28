import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Bike, Shield, Wind, Zap, Activity, Info, Map as MapIcon } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// --- STYLE KOLEGI (Tailwind & Custom) ---
// Upewnij się, że w index.css masz tailwinda lub dodaj <script src="https://cdn.tailwindcss.com"></script> w index.html

const mockRoute = [[50.0647, 19.9450], [50.0614, 19.9365], [50.0580, 19.9340], [50.0520, 19.9400]];

function App() {
  const [safetyWeight, setSafetyWeight] = useState(50);
  const [ecoWeight, setEcoWeight] = useState(50);
  const [currentRoute, setCurrentRoute] = useState(mockRoute);
  const [backendStatus, setBackendStatus] = useState("System gotowy");
  const [loading, setLoading] = useState(false);

  const generateRoute = async () => {
    setLoading(true);
    setBackendStatus("Analiza korytarza powietrznego...");
    
    // Wizualne "drganie" trasy
    setCurrentRoute(currentRoute.map(p => [p[0] + (Math.random() - 0.5) * 0.001, p[1] + (Math.random() - 0.5) * 0.001]));

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/test', {
        params: { safety: safetyWeight, eco: ecoWeight }
      });
      setBackendStatus(response.data.message);
    } catch (e) {
      setBackendStatus("Błąd połączenia z Apex Engine");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  return (
    <div className="bg-[#131315] text-[#e5e1e4] font-sans h-screen flex flex-col overflow-hidden">
      
      {/* HEADER - Inspirowany designem kolegi */}
      <header className="h-16 border-b border-white/5 bg-[#131315]/80 backdrop-blur-xl flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Bike className="text-[#4fe172]" size={24} />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#4fe172] to-[#20bf55] bg-clip-text text-transparent font-headline">
            Apex Velo AI
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-zinc-500">
          <span className="text-[#4fe172] border-b-2 border-[#4fe172]">Symulacja</span>
          <span className="hover:text-white cursor-pointer transition-colors">Analityka</span>
          <div className="w-8 h-8 rounded-full border border-[#4fe172]/20 bg-zinc-800 ml-4"></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR LEWY - Parametry i Kontrola */}
        <aside className="w-80 border-r border-white/5 bg-[#131315] p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h2 className="text-[#4fe172] font-black text-xs uppercase tracking-widest mb-1">City Planning</h2>
            <p className="text-zinc-500 text-[10px]">Infrastructure Dashboard v1.0</p>
          </div>

          {/* STATUS BOX */}
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
             <div className="flex items-center gap-2 mb-2">
                <Activity size={14} className="text-[#4fe172]" />
                <span className="text-[10px] font-bold uppercase text-zinc-400">Status Silnika</span>
             </div>
             <p className="text-xs text-white italic">"{backendStatus}"</p>
          </div>

          {/* KONTROLKI SUWAKÓW */}
          <section className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Parametry Algorytmu</label>
            
            <div className="space-y-4">
              <div className="bg-zinc-900/30 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold flex items-center gap-2"><Shield size={14} /> Bezpieczeństwo</span>
                  <span className="text-xs text-[#4fe172]">{safetyWeight}%</span>
                </div>
                <input 
                  type="range" className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#4fe172]"
                  value={safetyWeight} onChange={(e) => setSafetyWeight(Number(e.target.value))} 
                />
              </div>

              <div className="bg-zinc-900/30 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold flex items-center gap-2"><Wind size={14} /> Ekologia</span>
                  <span className="text-xs text-[#4fe172]">{ecoWeight}%</span>
                </div>
                <input 
                  type="range" className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#4fe172]"
                  value={ecoWeight} onChange={(e) => setEcoWeight(Number(e.target.value))} 
                />
              </div>
            </div>
          </section>

          <button 
            onClick={generateRoute}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#4fe172] to-[#20bf55] text-[#003913] font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
          >
            <Zap size={18} fill="currentColor" />
            {loading ? "PRZELICZANIE..." : "GENERUJ SYMULACJĘ"}
          </button>
        </aside>

        {/* MAIN CONTENT - MAPA */}
        <main className="flex-1 relative bg-zinc-900">
          <MapContainer center={[50.0614, 19.9365]} zoom={14} className="h-full w-full grayscale contrast-[1.1] brightness-[0.7]">
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <Polyline positions={currentRoute} color="#4fe172" weight={6} opacity={0.8} />
            <Marker position={[50.0647, 19.9450]}><Popup>Start</Popup></Marker>
            <Marker position={[50.0520, 19.9400]}><Popup>Koniec</Popup></Marker>
          </MapContainer>

          {/* FLOATING CARD - Z designu kolegi */}
          <div className="absolute top-6 left-6 z-[1000] w-72">
            <div className="bg-[#131315]/90 backdrop-blur-md p-5 rounded-2xl border-l-4 border-[#4fe172] shadow-2xl">
              <span className="text-[10px] font-black text-[#4fe172] uppercase tracking-tighter">Current Scenario</span>
              <h3 className="text-xl font-bold text-white mt-1">Kraków City Center</h3>
              <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">Analiza redukcji hałasu i smogu dla nowej trasy rowerowej.</p>
            </div>
          </div>
        </main>
      </div>

      {/* FOOTER - Statystyki z designu kolegi */}
      <footer className="h-32 border-t border-white/5 bg-[#131315] px-8 py-4 flex items-center gap-8 overflow-x-auto">
        <div className="flex-shrink-0">
          <h4 className="text-[10px] font-black text-zinc-500 uppercase mb-2">Impact Scenarios</h4>
        </div>
        <div className="flex gap-6">
           {[
             { label: "PM2.5 Exposure", val: "-15%", color: "text-[#4fe172]" },
             { label: "Cycling Uptake", val: "+22%", color: "text-[#4fe172]" },
             { label: "Noise Pollution", val: "-8dB", color: "text-[#ffb95f]" },
           ].map((stat, i) => (
             <div key={i} className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 min-w-[160px]">
               <p className="text-[9px] uppercase font-bold text-zinc-500">{stat.label}</p>
               <p className={`text-xl font-bold ${stat.color}`}>{stat.val}</p>
             </div>
           ))}
        </div>
      </footer>
    </div>
  );
}

export default App;