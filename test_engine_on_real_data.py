import pickle
import sys
from AI_Engine.routing_engine import RoutingEngine
from AI_Engine import sourcing_data

# Mapowanie starej nazwy na nową dla pickle
sys.modules['sourcing_data'] = sourcing_data

def main():
    # 1. Wczytanie danych z cache
    print("📂 Ładowanie danych z plików pkl...")
    with open("AI_Engine/cache/local_data.pkl", "rb") as f:
        local_data = pickle.load(f)
    with open("AI_Engine/cache/osm_data.pkl", "rb") as f:
        osm_data = pickle.load(f)

    # 2. Inicjalizacja silnika na PRAWDZIWYCH danych
    print("⚙️ Inicjalizacja silnika routingu...")
    engine = RoutingEngine(local_data, osm_data)

    # 3. Przykładowa trasa (Rynek Główny -> Wawel)
    print("🚲 Obliczanie trasy 'green'...")
    route = engine.compute_route(
        start_lat=50.0617, start_lon=19.9373,
        end_lat=50.0547, end_lon=19.9354,
        mode="green"
    )

    print(f"✅ Znaleziono trasę o długości {len(route)} punktów.")
    print(f"Pierwsze 3 punkty: {route[:3]}")

if __name__ == "__main__":
    main()