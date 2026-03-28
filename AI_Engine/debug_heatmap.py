import folium
from folium.plugins import HeatMap
import pickle
import os
from routing_engine import RoutingEngine

# --- KONFIGURACJA ŚCIEŻEK ---
with open("cache/local_data.pkl", "rb") as f:
    local_data = pickle.load(f)
with open("cache/osm_data.pkl", "rb") as f:
    osm_data = pickle.load(f)

# Inicjalizacja silnika
engine = RoutingEngine(local_data, osm_data)


def generate_debug_map(layer="noise"):
    print(f"🌡️ Generowanie heatmapy dla: {layer}...")

    # Pobieramy dane (używamy grid_size=60 dla lepszej jakości)
    points = engine.get_heatmap_data(layer_type=layer, grid_size=60)

    if not points:
        print("❌ Brak danych do wyświetlenia (puste punkty)!")
        return

    # Tworzymy mapę scentrowaną na Kraków
    m = folium.Map(location=[50.0647, 19.9450], zoom_start=14,
                   tiles="cartodbpositron")

    # Dodajemy heatmapę
    # Folium oczekuje listy [lat, lon, weight]
    HeatMap(points, radius=15, blur=10, min_opacity=0.3).add_to(m)

    # Opcjonalnie: Dodaj obrys grafu (ulic), żeby widzieć kontekst
    # ox.plot_graph_folium(engine.G, graph_map=m, color="gray", weight=1, opacity=0.5)

    filename = f"debug_heatmap_{layer}.html"
    m.save(filename)
    print(f"✅ Mapa zapisana jako: {filename}. Otwórz ten plik w przeglądarce!")

if __name__ == "__main__":
    # Możesz wygenerować obie, żeby porównać
    generate_debug_map("noise")
    generate_debug_map("green")