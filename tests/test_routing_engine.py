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

    # Używamy SimpleNamespace zamiast definiowania nowej klasy
    return SimpleNamespace(
        greenery_df=greenery_df,
        noise_map_df=noise_map_df,
        cycling_paths_df=cycling_paths_df
    )

@pytest.fixture
def mock_osm_data():
    buildings_df = gpd.GeoDataFrame(
        {"geometry": [Point(19.945, 50.064).buffer(0.0005)]},
        crs="EPSG:4326")

    return SimpleNamespace(buildings_df=buildings_df)


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
