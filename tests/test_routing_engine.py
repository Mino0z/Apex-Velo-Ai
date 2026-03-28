import pytest
from shapely.geometry import Point, LineString
import geopandas as gpd
from AI_Engine.routing_engine import RoutingEngine
from types import SimpleNamespace

# === MOCK DATA ===
@pytest.fixture
def mock_local_data():
    # Greenery
    greenery_df = gpd.GeoDataFrame(
        {"geometry": [Point(19.9450, 50.0647).buffer(0.001)]}, crs="EPSG:4326")
    # Noise
    noise_map_df = gpd.GeoDataFrame(
        {"geometry": [Point(19.9450, 50.0647).buffer(0.001)], "isov1": [5]},
        crs="EPSG:4326")
    # Bike paths
    cycling_paths_df = gpd.GeoDataFrame(
        {"geometry": [LineString([(19.944, 50.064), (19.946, 50.065)])]},
        crs="EPSG:4326")

    bike_racks_df = gpd.GeoDataFrame(
        {"geometry": [Point(19.9455, 50.0645)]}, crs="EPSG:4326")

    return SimpleNamespace(
        greenery_df=greenery_df,
        noise_map_df=noise_map_df,
        cycling_paths_df=cycling_paths_df,
        bike_racks_df=bike_racks_df  # NOWE
    )

@pytest.fixture
def mock_osm_data():
    buildings_df = gpd.GeoDataFrame(
        {"geometry": [Point(19.945, 50.064).buffer(0.0005)]},
        crs="EPSG:4326")

    tram_df = gpd.GeoDataFrame(
        {"geometry": [LineString([(19.940, 50.060), (19.950, 50.070)])]},
        crs="EPSG:4326")

    return SimpleNamespace(
        buildings_df=buildings_df,
        tram_df=tram_df
    )


# === TEST ROUTING ENGINE INITIALIZATION ===
def test_engine_init(mock_local_data, mock_osm_data):
    engine = RoutingEngine(mock_local_data, mock_osm_data)
    assert hasattr(engine, "G"), "Graph not built"


# === TEST ROUTE COMPUTATION ===
def test_compute_route(mock_local_data, mock_osm_data):
    engine = RoutingEngine(mock_local_data, mock_osm_data)

    route = engine.compute_route(
        start_lat=50.064, start_lon=19.944,
        end_lat=50.065, end_lon=19.946,
        mode="green"
    )

    # Sprawdź czy zwrócono listę współrzędnych
    assert isinstance(route, list)
    assert len(route) > 0
    # Wszystkie elementy muszą być tuple (x, y)
    assert all(isinstance(p, tuple) and len(p) == 2 for p in route)


def test_suggest_new_corridor(mock_local_data, mock_osm_data):
    engine = RoutingEngine(mock_local_data, mock_osm_data)

    # Wywołujemy nową metodę
    route, stats = engine.suggest_new_corridor(
        start_lat=50.064, start_lon=19.944,
        end_lat=50.065, end_lon=19.946
    )

    # 1. Sprawdź czy zwrócono krotkę (trasa, statystyki)
    assert isinstance(route, list)
    assert isinstance(stats, dict)

    # 2. Sprawdź czy statystyki zawierają kluczowe dane
    assert "Dystans" in stats
    assert "Udział zieleni" in stats
    assert "Średni hałas" in stats


def test_graph_enrichment_features(mock_local_data, mock_osm_data):
    engine = RoutingEngine(mock_local_data, mock_osm_data)

    # Pobierz losową krawędź z grafu
    u, v, data = next(iter(engine.G.edges(data=True)))
    features = data.get("features", {})

    # Sprawdź czy nowe cechy zostały obliczone
    assert "heat" in features, "Brak cechy heat w grafie"
    assert "tram" in features, "Brak cechy tram w grafie"
    assert "poi" in features, "Brak cechy poi (stojaki) w grafie"


def test_planning_start_node_constraint(mock_local_data, mock_osm_data):
    engine = RoutingEngine(mock_local_data, mock_osm_data)

    # Wykonujemy routing
    route, _ = engine.suggest_new_corridor(50.064, 19.944, 50.065, 19.946)

    # Pobieramy pierwszy węzeł trasy
    start_node_id = route[0]

    # Sprawdzamy, czy ten węzeł (lub krawędź z niego wychodząca) ma cechę bike=1
    # To potwierdzi, że algorytm "dociągnął" start do istniejącej sieci
    success = False
    for _, _, d in engine.G.edges(start_node_id, data=True):
        if d.get("features", {}).get("bike", 0) > 0:
            success = True
            break

    assert success, "Trasa nie zaczyna się na istniejącej infrastrukturze rowerowej!"