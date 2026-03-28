import sys
import os
import pickle
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path

# 1. KONFIGURACJA ŚCIEŻEK
BASE_DIR = Path(__file__).resolve().parent.parent
AI_ENGINE_DIR = BASE_DIR / "AI_Engine"
CACHE_DIR = AI_ENGINE_DIR / "cache"

# Dodajemy oba foldery do ścieżek, żeby Pickle znalazł 'sourcing_data'
sys.path.append(str(BASE_DIR))
sys.path.append(str(AI_ENGINE_DIR))

# Teraz importy będą działać poprawnie
from AI_Engine.routing_engine import RoutingEngine


# 2. LIFESPAN (Zamiast on_event)
@asynccontextmanager
async def lifespan(app: FastAPI):
    global engine
    print(f"📂 Ładowanie danych z: {CACHE_DIR}")
    try:
        # Pickle potrzebuje dostępu do definicji klas z sourcing_data
        with open(CACHE_DIR / "local_data.pkl", "rb") as f:
            local_data = pickle.load(f)
        with open(CACHE_DIR / "osm_data.pkl", "rb") as f:
            osm_data = pickle.load(f)

        # Inicjalizacja silnika
        engine = RoutingEngine(local_data, osm_data)
        print("✅ Silnik AI gotowy!")
    except Exception as e:
        print(f"❌ Krytyczny błąd startu: {e}")

    yield
    # Tutaj opcjonalnie sprzątanie przy wyłączaniu serwera
    print("👋 Wyłączanie serwera...")
app = FastAPI(
    title="Apex Velo AI API",
    lifespan=lifespan
)

# 2. DEFINICJA ŚCIEŻEK CACHE
# Wskazujemy na AI_Engine/cache/
BASE_DIR = Path(__file__).resolve().parent.parent
CACHE_DIR = BASE_DIR / "AI_Engine" / "cache"


# Modele danych
class RouteRequest(BaseModel):
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    mode: str = "green"


class PlannerRequest(BaseModel):
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float

engine = None
# --- ENDPOINTY ---

@app.get("/health")
def health_check():
    return {"status": "ok", "engine_loaded": engine is not None}


@app.post("/suggest-corridor")
def suggest_corridor(req: PlannerRequest):
    if engine is None:
        raise HTTPException(status_code=503,
                            detail="Silnik AI nie został jeszcze załadowany.")

    try:
        nodes, stats = engine.suggest_new_corridor(
            req.start_lat, req.start_lon,
            req.end_lat, req.end_lon
        )

        coords = engine._route_to_coords(nodes)
        # Formatowanie pod GeoJSON/Leaflet: [lat, lon]
        lat_lon_coords = [[p[1], p[0]] for p in coords]

        return {
            "geometry": {
                "type": "LineString",
                "coordinates": lat_lon_coords
            },
            "statistics": stats
        }
    except Exception as e:
        print(f"Błąd routingu: {e}")
        raise HTTPException(status_code=500,
                            detail="Nie udało się wyznaczyć korytarza.")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)