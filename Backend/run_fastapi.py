import sys
import os
import pickle
import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# =========================
# 🔧 PATH FIX (NAJWAŻNIEJSZE)
# =========================
BASE_DIR = Path(__file__).resolve().parent.parent
AI_ENGINE_DIR = BASE_DIR / "AI_Engine"
CACHE_DIR = AI_ENGINE_DIR / "cache"

sys.path.append(str(BASE_DIR))
sys.path.append(str(AI_ENGINE_DIR))

# TERAZ import działa
from AI_Engine.routing_engine import RoutingEngine

# =========================
# GLOBAL STATE
# =========================
engine = None
bike_paths_geojson = None

# =========================
# LIFESPAN
# =========================
@asynccontextmanager
async def lifespan(app: FastAPI):
    global engine, bike_paths_geojson

    print(f"📂 Ładowanie danych z: {CACHE_DIR}")

    try:
        with open(CACHE_DIR / "local_data.pkl", "rb") as f:
            local_data = pickle.load(f)

        with open(CACHE_DIR / "osm_data.pkl", "rb") as f:
            osm_data = pickle.load(f)

        engine = RoutingEngine(local_data, osm_data)
        print("✅ Silnik AI gotowy!")

        # 🔥 CACHE BIKE PATHS (TU, NIE WCZEŚNIEJ!)
        print("📦 Generating bike paths cache...")
        bike_paths_geojson = engine.get_existing_bike_paths(as_geojson=True)
        print(f"✅ Cached {len(json.loads(bike_paths_geojson)['features'])} bike paths")

    except Exception as e:
        print(f"❌ Krytyczny błąd startu: {e}")

    yield
    print("👋 Wyłączanie serwera...")

# =========================
# APP
# =========================
app = FastAPI(
    title="Apex Velo AI API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# MODELE
# =========================
class RouteRequest(BaseModel):
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    mode: str = "green"

# =========================
# ENDPOINTY
# =========================
@app.get("/health")
def health_check():
    return {"status": "ok", "engine_loaded": engine is not None}


@app.post("/suggest-corridor")
def suggest_corridor(req: RouteRequest):
    if engine is None:
        raise HTTPException(status_code=503, detail="Silnik niegotowy")

    nodes, stats = engine.suggest_new_corridor(
        req.start_lat, req.start_lon,
        req.end_lat, req.end_lon,
        mode=req.mode
    )

    coords = engine._route_to_coords(
        nodes,
        start_point=(req.start_lat, req.start_lon),
        end_point=(req.end_lat, req.end_lon)
    )

    lat_lon_coords = [[p[1], p[0]] for p in coords]

    return {
        "geometry": {
            "type": "LineString",
            "coordinates": lat_lon_coords
        },
        "statistics": stats
    }


@app.get("/heatmap/{layer_type}")
def get_heatmap(layer_type: str):
    if engine is None:
        raise HTTPException(status_code=503, detail="Silnik niegotowy")

    if layer_type not in ["noise", "green"]:
        raise HTTPException(status_code=400, detail="Zła warstwa")

    data = engine.get_heatmap_data(layer_type=layer_type, grid_size=40)
    return {"points": data}


@app.get("/bike_paths")
def get_bike_paths():
    if bike_paths_geojson is None:
        raise HTTPException(status_code=503, detail="Brak danych ścieżek")

    return json.loads(bike_paths_geojson)


# =========================
# RUN
# =========================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
