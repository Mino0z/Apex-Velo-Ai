import folium
import pickle
from routing_engine import RoutingEngine
import os

def draw_planner_map():
    # 1. Ładowanie danych
    print("📂 Ładowanie danych z cache...")
    try:
        with open("cache/local_data.pkl", "rb") as f:
            local_data = pickle.load(f)
        with open("cache/osm_data.pkl", "rb") as f:
            osm_data = pickle.load(f)
    except FileNotFoundError:
        print(
            "❌ Błąd: Nie znaleziono plików pkl w folderze cache! Uruchom najpierw skrypt pobierający dane.")
        return

    # Inicjalizacja silnika (wymusi przeładowanie grafu z nowymi cechami)
    # UWAGA: Jeśli zmieniłeś strukturę _enrich_graph, usuń cache/graph.pkl przed uruchomieniem!
    engine = RoutingEngine(local_data, osm_data)

    # 2. Obliczanie Nowego Korytarza (Widok Planisty)
    # Przykład: Odcinek przez obszar, gdzie brakuje ścieżek
    start_lat, start_lon = 50.0689, 19.9060  # Okolice Ronda Mogilskiego
    end_lat, end_lon = 50.0547, 19.9354  # Wawel

    print("🧠 AI oblicza optymalny korytarz...")
    route_nodes, stats = engine.suggest_new_corridor(start_lat, start_lon,
                                                     end_lat, end_lon)

    # Zamiana węzłów na współrzędne dla Folium
    route_coords = engine._route_to_coords(route_nodes)
    route_latlon = [(p[1], p[0]) for p in route_coords]

    # 3. Tworzenie mapy
    m = folium.Map(
        location=[(start_lat + end_lat) / 2, (start_lon + end_lon) / 2],
        zoom_start=14,
        tiles='CartoDB dark_matter'
        # Tryb ciemny lepiej eksponuje kolorowe trasy
    )

    # 4. Dodanie statystyk jako pływający panel (HTML/CSS)
    stats_html = f"""
    <div style="position: fixed; 
                bottom: 50px; left: 50px; width: 300px; height: 160px; 
                background-color: white; border:2px solid grey; z-index:9999; font-size:14px;
                padding: 10px; border-radius: 10px; opacity: 0.9;">
        <h4 style="margin-top:0;">📊 Raport AI Planisty</h4>
        <b>Dystans:</b> {stats['Dystans']}<br>
        <b>Udział zieleni:</b> {stats['procent_zieleni'] if 'procent_zieleni' in stats else stats['Udział zieleni']}<br>
        <b>Średni hałas:</b> {stats['Średni hałas']}<br>
        <small style="color: green;">{stats['Komunikat']}</small>
    </div>
    """
    m.get_root().html.add_child(folium.Element(stats_html))

    # 5. Rysowanie trasy
    # Kolor fioletowy/magenta często oznacza "propozycję" lub "projekt" w urbanistyce
    folium.PolyLine(
        route_latlon,
        color="#FF00FF",
        weight=6,
        opacity=0.9,
        tooltip="Proponowany Nowy Korytarz"
    ).add_to(m)

    # 6. Dodanie markerów z informacją o wymuszonym starcie
    folium.Marker(
        route_latlon[0],
        popup="Punkt wpięcia do istniejącej sieci",
        icon=folium.Icon(color='purple', icon='share-alt', prefix='fa')
    ).add_to(m)

    folium.Marker(
        route_latlon[-1],
        popup="Cel inwestycji",
        icon=folium.Icon(color='red', icon='flag-checkered', prefix='fa')
    ).add_to(m)

    # 7. Opcjonalnie: Rysowanie istniejących ścieżek dla porównania (jeśli masz je w local_data)
    if not local_data.cycling_paths_df.empty:
        folium.GeoJson(
            local_data.cycling_paths_df,
            name="Istniejąca sieć",
            style_function=lambda x: {'color': '#00FF00', 'weight': 2,
                                      'opacity': 0.3}
        ).add_to(m)

    # 8. Zapis i informacja
    m.save("widok_planisty.html")
    print(f"✅ Sukces! Wyniki dla planisty:")
    for k, v in stats.items():
        print(f" - {k}: {v}")
    print("\n🌍 Otwórz plik 'widok_planisty.html' w przeglądarce.")


if __name__ == "__main__":
    draw_planner_map()