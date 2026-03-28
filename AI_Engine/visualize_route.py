import folium
import pickle
from routing_engine import RoutingEngine

def draw_map():
    # 1. Ładowanie danych
    with open("cache/local_data.pkl", "rb") as f:
        local_data = pickle.load(f)
    with open("cache/osm_data.pkl", "rb") as f:
        osm_data = pickle.load(f)

    engine = RoutingEngine(local_data, osm_data)

    # 2. Obliczanie trasy
    # Rynek Główny -> Wawel
    route_coords = engine.compute_route(50.0617, 19.9373, 50.0547, 19.9354, mode="green")

    # 3. Tworzenie mapy Folium (środek na trasie)
    # DARK MODE
    # m = folium.Map(
    #     location=[50.0617, 19.9373],
    #     zoom_start=15,
    #     tiles='CartoDB dark_matter'
    # )

    # LIGHT MODE
    m = folium.Map(
        location=[50.0617, 19.9373],
        zoom_start=15,
        tiles='CartoDB positron'
    )

    # 4. Rysowanie trasy (Uwaga: Folium przyjmuje [lat, lon], a OSMnx zwraca [lon, lat])
    route_latlon = [(p[1], p[0]) for p in route_coords]
    folium.PolyLine(route_latlon, color="green", weight=5, opacity=0.8, tooltip="Zielona Trasa").add_to(m)

    # 5. Dodanie markerów startu i końca
    folium.Marker(route_latlon[0], popup="Start", icon=folium.Icon(color='blue')).add_to(m)
    folium.Marker(route_latlon[-1], popup="Meta", icon=folium.Icon(color='red')).add_to(m)

    # 6. Zapis do pliku
    m.save("index.html")
    print("🌍 Mapa została wygenerowana! Otwórz plik index.html w przeglądarce.")

if __name__ == "__main__":
    draw_map()