import os
import pickle
import networkx as nx
import osmnx as ox
import geopandas as gpd
import numpy as np
import pandas as pd
from shapely.ops import unary_union

# ===== CONFIG =====
CACHE_DIR = "cache"
GRAPH_FILE = os.path.join(CACHE_DIR, "graph.pkl")  # wersjonowanie cache

KRAKOW_CENTER = (50.0647, 19.9450)
DIST = 1000

# ===== WEIGHTS =====
WEIGHTS = {
    "green": {
        "noise": 0.5,
        "density": 0.5,
        "heat": 0.5,
        "green": 5.0,
        "poi": 1.0,
        "tram": 0.5
    },
    "safe": {
        "noise": 4.0,
        "density": 2.0,
        "heat": 2.0,
        "green": 1.0,
        "poi": 0.5,
        "tram": 3.0
    },
    "fast": {
        "noise": 0.1,
        "density": 0.1,
        "heat": 0.1,
        "green": 0.1,
        "poi": 0.1,
        "tram": 0.1
    }
}

# ===== PLANNING WEIGHTS =====

PLANNING_MODES = {
    "green": {
        "noise": 0.5,
        "density": 0.5,
        "heat": 0.5,
        "green": 5.0,
        "poi": 1.0,
        "tram": 0.5
    },
    "safe": {
        "noise": 4.0,
        "density": 2.0,
        "heat": 2.0,
        "green": 1.0,
        "poi": 0.5,
        "tram": 3.0
    },
    "fast": {
        "noise": 0.1,
        "density": 0.1,
        "heat": 0.1,
        "green": 0.1,
        "poi": 0.1,
        "tram": 0.1
    }
}

class RoutingEngine:

    def __init__(self, local_data, osm_data=None):
        self.local_data = local_data
        self.osm_data = osm_data
        os.makedirs(CACHE_DIR, exist_ok=True)

        if os.path.exists(GRAPH_FILE):
            print("📦 Loading graph from cache...")
            with open(GRAPH_FILE, "rb") as f:
                self.G = pickle.load(f)
        else:
            print("⚙️ Building graph...")
            self.G = self._build_graph()
            print("⚙️ Enriching graph...")
            self._enrich_graph()
            print("💾 Saving graph to cache...")
            with open(GRAPH_FILE, "wb") as f:
                pickle.dump(self.G, f)

    # =========================
    # GRAPH
    # =========================
    def _build_graph(self):
        return ox.graph_from_point(KRAKOW_CENTER, dist=DIST, network_type="bike")

    def _ensure_crs(self, gdf, target_crs):
        if gdf.crs is None:
            raise ValueError("GeoDataFrame has no CRS!")

        if gdf.crs != target_crs:
            return gdf.to_crs(target_crs)
        return gdf

    # =========================
    # ENRICHMENT
    # =========================
    def _enrich_graph(self):
        print("⏳ Enriching graph with robust spatial joins...")

        # 1. Przygotowanie danych krawędzi
        edges = ox.graph_to_gdfs(self.G, nodes=False)
        # Standardowy układ metryczny dla Polski (PUWG 1992)
        WORKING_CRS = "EPSG:2180"

        # Tworzymy kopię metryczną z buforem 1m dla pewności przecięć
        edges_m = edges.to_crs(WORKING_CRS)
        edges_poly = edges_m.copy()
        edges_poly["geometry"] = edges_m.geometry.buffer(1.0)

        # Inicjalizacja kolumn
        for col in ["green", "noise", "density", "heat", "tram_penalty",
                    "poi_score", "bike"]:
            edges[col] = 0.0

        # =========================
        # 🌳 GREENERY (EPSG:2180)
        # =========================
        if not self.local_data.greenery_df.empty:
                green = self.local_data.greenery_df.to_crs(WORKING_CRS)
                temp_edges = edges_poly.reset_index()

                joined = gpd.sjoin(temp_edges, green, how="left",
                                   predicate="intersects")

                # Sprawdzamy, które wiersze mają przypisany obiekt zieleni
                # index_right pojawia się tylko w joinie 'left'/'right', ale bezpieczniej
                # jest sprawdzić dowolną kolumnę z ramki 'green' (np. pierwszą)
                green_col = green.columns[0]
                has_green = joined[~joined[green_col].isna()]

                if not has_green.empty:
                    # Zaznaczamy krawędzie, które mają choć trochę zieleni
                    green_marks = has_green.groupby(['u', 'v', 'key']).size()
                    edges["green"] = (green_marks > 0).astype(float).reindex(
                        edges.index, fill_value=0)

        # =========================
        # 🔊 NOISE (EPSG:2178 -> 2180)
        # =========================
        if not self.local_data.noise_map_df.empty:
            noise = self.local_data.noise_map_df.to_crs(WORKING_CRS)
            joined = gpd.sjoin(edges_poly, noise, how="left",
                               predicate="intersects")

            # Szukamy kolumny z wartością hałasu (isov1, isophone, itp.)
            noise_col = next((c for c in joined.columns if
                              "iso" in c.lower() or "noise" in c.lower()),
                             None)

            if noise_col:
                # Konwersja na liczby i średnia dla krawędzi
                joined[noise_col] = pd.to_numeric(joined[noise_col],
                                                  errors='coerce')
                noise_stats = joined.groupby(level=[0, 1, 2])[noise_col].mean()
                edges["noise"] = noise_stats.reindex(edges.index, fill_value=0)
                if edges["noise"].max() > 0:
                    edges["noise"] /= edges["noise"].max()

        # =========================
        # 🏢 DENSITY (Budynki z OSM)
        # =========================
        if self.osm_data and not self.osm_data.buildings_df.empty:
                    buildings = self.osm_data.buildings_df.to_crs(WORKING_CRS)

                    # KLUCZOWY FIX: reset_index() sprawia, że u, v, key stają się zwykłymi kolumnami
                    temp_edges = edges_poly.reset_index()

                    # Robimy sjoin: sprawdzamy, które budynki są w buforze krawędzi
                    joined = gpd.sjoin(buildings, temp_edges, how="inner",
                                       predicate="intersects")

                    if not joined.empty:
                        # Grupujemy po oryginalnych kolumnach indeksu (u, v, key)
                        density = joined.groupby(['u', 'v', 'key']).size()

                        # Przypisujemy wyniki z powrotem do głównej ramki edges
                        # Reindex sprawi, że krawędzie bez budynków dostaną 0
                        edges["density"] = density.reindex(edges.index,
                                                           fill_value=0)

                        if edges["density"].max() > 0:
                            edges["density"] /= edges["density"].max()

        # =========================
        # reszta cech (tramwaje, stojaki, bike) - analogicznie z to_crs(WORKING_CRS)
        # =========================
        # (Tutaj dodaj swoją logikę dla tram_penalty i poi_score używając WORKING_CRS)

        # 🌡️ HEAT PROXY
        edges["heat"] = (edges["density"] - 0.7 * edges["green"]).clip(lower=0)
        if edges["heat"].max() > 0:
            edges["heat"] /= edges["heat"].max()

        # Normalizacja długości
        edges["length_norm"] = edges["length"] / edges["length"].max()

        # PRZYPISANIE DO GRAFU
        print(
            f"📊 Stats: Green > 0: {len(edges[edges['green'] > 0])}, Noise > 0: {len(edges[edges['noise'] > 0])}")

        feat_cols = ["noise", "green", "density", "heat", "tram_penalty",
                     "poi_score", "bike", "length_norm"]
        for (u, v, k), row in edges.iterrows():
            self.G[u][v][k]["features"] = row[feat_cols].to_dict()
            self.G[u][v][k]["features"]["length"] = row["length"]

        print("✅ Graph enrichment complete.")

    # =========================
    # COST
    # =========================
    def _cost(self, f, w):
        return (
            w["noise"] * f["noise"] +
            w["density"] * f["density"] -
            w["green"] * f["green"] -
            w["bike"] * f["bike"] +
            0.3 * f["length_norm"]
        )

    # =========================
    # ROUTING
    # =========================
    def compute_route(self, start_lat, start_lon, end_lat, end_lon, mode="green"):
        weights = WEIGHTS.get(mode, WEIGHTS["green"])

        start = ox.distance.nearest_nodes(self.G, start_lon, start_lat)
        end = ox.distance.nearest_nodes(self.G, end_lon, end_lat)

        def weight(u, v, data):
            if "features" in data:
                return self._cost(data["features"], weights)
            return data.get("length", 100) / 1000

        route = nx.shortest_path(self.G, start, end, weight=weight)
        return self._route_to_coords(route)

    # =========================
    # OUTPUT
    # =========================
    def _route_to_coords(self, route, start_point=None, end_point=None):
        coords = []

        for u, v in zip(route[:-1], route[1:]):
            edge = list(self.G[u][v].values())[0]
            geom = edge.get("geometry")

            if geom is not None:
                coords.extend(list(geom.coords))
            else:
                coords.append((self.G.nodes[u]["x"], self.G.nodes[u]["y"]))

        # 🔥 DODAJ TO:
        if start_point:
            coords.insert(0, (start_point[1], start_point[0]))  # (lon, lat)

        if end_point:
            coords.append((end_point[1], end_point[0]))

        return coords

    # =========================
    # PLANNING
    # =========================
    def suggest_new_corridor(self, start_lat, start_lon, end_lat, end_lon, mode="green"):
        start_node = ox.distance.nearest_nodes(self.G, start_lon, start_lat)
        end_node = ox.distance.nearest_nodes(self.G, end_lon, end_lat)
        print(f"🚴 Mode: {mode}")
        weights = PLANNING_MODES.get(mode, PLANNING_MODES["green"])

        def planning_weight(u, v, data):
            f = data.get("features", {})

            overlap_penalty = 1.0 if f.get("bike", 0) > 0 else 0

            cost = (
                    weights["noise"] * f.get("noise", 0) +
                    weights["heat"] * f.get("heat", 0) +
                    weights["density"] * f.get("density", 0) +
                    weights["tram"] * f.get("tram_penalty", 0) +
                    overlap_penalty -
                    weights["green"] * f.get("green", 0) -
                    weights["poi"] * f.get("poi_score", 0) +
                    + 0.5 * f.get("length_norm", 0)
            )
            return max(0.01, cost)

        route = nx.shortest_path(self.G, start_node, end_node, weight=planning_weight)
        return route, self.get_route_stats(route)

    # =========================
    # STATS
    # =========================
    def get_route_stats(self, route):
        total_len = 0
        green_len = 0
        noise_values = []

        for u, v in zip(route[:-1], route[1:]):
            edge_data = self.G.get_edge_data(u, v)
            if edge_data:
                data = list(edge_data.values())[0]
                f = data.get("features", {})

                length = data.get("length", 0)
                total_len += length

                if f.get("green", 0) > 0:
                    green_len += length

                noise_values.append(f.get("noise", 0))

        avg_noise = sum(noise_values) / len(noise_values) if noise_values else 0
        green_pct = (green_len / total_len * 100) if total_len > 0 else 0

        return {
            "Dystans": f"{round(total_len, 1)} m",
            "Udział zieleni": f"{round(green_pct, 1)}%",
            "Średni hałas": f"{round(avg_noise * 100, 1)}%",
            "Komunikat": "Trasa zoptymalizowana."
        }

    def get_heatmap_data(self, layer_type="noise", grid_size=50):
        """
        Generuje dane do heatmapy.
        layer_type: "noise" lub "green" lub "heat"
        grid_size: gęstość siatki (im więcej, tym dokładniejsza mapa, ale wolniejsza)
        """
        """
                Generuje dane do heatmapy dla warstw: noise, green, heat.
                """
        # 1. Granice obszaru
        nodes, _ = ox.graph_to_gdfs(self.G)
        min_lon, min_lat, max_lon, max_lat = nodes.total_bounds

        # 2. Siatka punktów
        lat_coords = np.linspace(min_lat, max_lat, grid_size)
        lon_coords = np.linspace(min_lon, max_lon, grid_size)
        points = [
            {'geometry': ox.utils_geo.Point(lon, lat), 'lat': lat, 'lon': lon}
            for lat in lat_coords for lon in lon_coords]

        grid_gdf = gpd.GeoDataFrame(points, crs="EPSG:4326")
        heatmap_points = []

        # --- WARSTWA: GREEN ---
        if layer_type == "green":
            if self.local_data.greenery_df.empty:
                return []

            green = self.local_data.greenery_df.to_crs("EPSG:4326")
            joined = gpd.sjoin(grid_gdf, green, how="inner",
                               predicate="within")

            for _, row in joined.iterrows():
                heatmap_points.append([row['lat'], row['lon'], 0.8])
            return heatmap_points

        # --- WARSTWA: NOISE ---
        elif layer_type == "noise":
            if self.local_data.noise_map_df.empty:
                return []

            noise = self.local_data.noise_map_df.to_crs("EPSG:4326")
            val_col = next((c for c in noise.columns if "iso" in c.lower()),
                           None)

            joined = gpd.sjoin(grid_gdf, noise, how="inner",
                               predicate="within")
            for _, row in joined.iterrows():
                try:
                    val = float(row[val_col]) if val_col else 0.5
                    heatmap_points.append(
                        [row['lat'], row['lon'], val / 150.0])
                except:
                    continue
            return heatmap_points

        return []
