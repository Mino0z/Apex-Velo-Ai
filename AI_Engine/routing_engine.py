import os
import pickle
import networkx as nx
import osmnx as ox
import geopandas as gpd
import numpy as np
from shapely.geometry import Point

# ===== CONFIG =====
CACHE_DIR = "cache"
GRAPH_FILE = os.path.join(CACHE_DIR, "graph.pkl")

KRAKOW_CENTER = (50.0647, 19.9450)
DIST = 1000  # meters (decrease if slow)

# ===== WEIGHTS =====
WEIGHTS = {
    "green": {"noise": 0.3, "density": 0.2, "green": 0.8, "bike": 0.5},
    "safe":  {"noise": 0.7, "density": 0.3, "green": 0.4, "bike": 0.6},
    "fast":  {"noise": 0.1, "density": 0.1, "green": 0.1, "bike": 0.2}
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
        G = ox.graph_from_point(KRAKOW_CENTER, dist=DIST, network_type="bike")
        #G = ox.simplify_graph(G)
        return G

    # =========================
    # FEATURE ENGINEERING
    # =========================
    # def _enrich_graph(self):
    #     edges = ox.graph_to_gdfs(self.G, nodes=False)
    #
    #     # Spatial index (CRUCIAL for performance)
    #     noise_sindex = self.local_data.noise_map_df.sindex
    #     green_sindex = self.local_data.greenery_df.sindex
    #
    #     # --- Noise ---
    #     def get_noise(geom):
    #         possible = list(noise_sindex.intersection(geom.bounds))
    #         subset = self.local_data.noise_map_df.iloc[possible]
    #         matches = subset[subset.intersects(geom)]
    #         if len(matches) == 0:
    #             return 0
    #         return matches["isov1"].mean()
    #
    #     # --- Green ---
    #     def get_green(geom):
    #         possible = list(green_sindex.intersection(geom.bounds))
    #         subset = self.local_data.greenery_df.iloc[possible]
    #         return int(subset.intersects(geom).any())
    #
    #     # --- Density ---
    #     buildings = self.osm_data.buildings_df if self.osm_data else None
    #
    #     def get_density(geom):
    #         if buildings is None:
    #             return 0
    #         buffer = geom.buffer(40)
    #         return buildings.intersects(buffer).sum()
    #
    #     # --- Bike path ---
    #     bike_paths = self.local_data.cycling_paths_df
    #
    #     def is_bike_path(geom):
    #         return int(bike_paths.intersects(geom).any())
    #
    #     print("⏳ Computing features (this may take a few minutes once)...")
    #
    #     edges["noise"] = edges.geometry.apply(get_noise)
    #     edges["green"] = edges.geometry.apply(get_green)
    #     edges["density"] = edges.geometry.apply(get_density)
    #     edges["bike"] = edges.geometry.apply(is_bike_path)
    #
    #     # Normalize (important!)
    #     edges["noise"] = edges["noise"] / (edges["noise"].max() + 1e-6)
    #     edges["density"] = edges["density"] / (edges["density"].max() + 1e-6)
    #
    #     # Attach back to graph
    #     for (u, v, k), row in edges.iterrows():
    #         self.G[u][v][k]["features"] = {
    #             "noise": row["noise"],
    #             "green": row["green"],
    #             "density": row["density"],
    #             "bike": row["bike"],
    #             "length": row["length"]
    #         }

    def _enrich_graph(self):
        # 1. Konwersja grafu na krawędzie
        edges = ox.graph_to_gdfs(self.G, nodes=False)
        buildings = self.osm_data.buildings_df if self.osm_data else None

        print(
            "⏳ Computing features (using safe spatial joins & deduplication)...")

        # --- GĘSTOŚĆ (Density) ---
        edges["density"] = 0
        if buildings is not None and not buildings.empty:
            edges_projected = edges.to_crs(epsg=2178)
            buildings_projected = buildings.to_crs(epsg=2178)

            edges_poly = edges_projected.copy()
            edges_poly["geometry"] = edges_projected.geometry.buffer(40)

            joined = gpd.sjoin(buildings_projected, edges_poly, how="inner",
                               predicate="intersects")

            if not joined.empty and "index_right" in joined.columns:
                # Grupujemy po index_right i liczymy unikalne budynki
                density_counts = joined.groupby("index_right").size()
                edges["density"] = density_counts.reindex(edges.index,
                                                          fill_value=0)

        # --- ZIELEŃ (Green) ---
        edges["green"] = 0
        if not self.local_data.greenery_df.empty:
            green_data = self.local_data.greenery_df.to_crs(edges.crs)
            green_joined = gpd.sjoin(edges, green_data, how="left",
                                     predicate="intersects")

            if "index_right" in green_joined.columns:
                # Usuwamy duplikaty indeksów przed przypisaniem
                has_green = ~green_joined['index_right'].isna()
                # Wybieramy tylko te wiersze, które faktycznie mają zieleń i bierzemy max (1/0) na indeks
                green_series = has_green.groupby(level=0).max().astype(int)
                edges["green"] = green_series.reindex(edges.index,
                                                      fill_value=0)

        # --- HAŁAS (Noise) ---
        noise_sindex = self.local_data.noise_map_df.sindex

        def get_noise(geom):
            possible = list(noise_sindex.intersection(geom.bounds))
            subset = self.local_data.noise_map_df.iloc[possible]
            matches = subset[subset.intersects(geom)]
            return matches["isov1"].mean() if len(matches) > 0 else 0

        edges["noise"] = edges.geometry.apply(get_noise)

        # --- ŚCIEŻKI ROWEROWE (Bike) ---
        edges["bike"] = 0
        if not self.local_data.cycling_paths_df.empty:
            bike_data = self.local_data.cycling_paths_df.to_crs(edges.crs)
            bike_joined = gpd.sjoin(edges, bike_data, how="left",
                                    predicate="intersects")

            if "index_right" in bike_joined.columns:
                has_bike = ~bike_joined['index_right'].isna()
                bike_series = has_bike.groupby(level=0).max().astype(int)
                edges["bike"] = bike_series.reindex(edges.index, fill_value=0)

        # --- NORMALIZACJA I ZAPIS ---
        edges["noise"] = edges["noise"] / (edges["noise"].max() + 1e-6)
        edges["density"] = edges["density"] / (edges["density"].max() + 1e-6)

        for (u, v, k), row in edges.iterrows():
            self.G[u][v][k]["features"] = {
                "noise": row["noise"],
                "green": row["green"],
                "density": row["density"],
                "bike": row["bike"],
                "length": row["length"]
            }
        print("✅ Features computed successfully!")

    # =========================
    # COST FUNCTION
    # =========================
    def _cost(self, features, weights):
        return (
            weights["noise"] * features["noise"] +
            weights["density"] * features["density"] -
            weights["green"] * features["green"] -
            weights["bike"] * features["bike"] +
            0.1 * features["length"] / 1000  # slight distance penalty
        )

    # =========================
    # ROUTING
    # =========================
    def compute_route(self, start_lat, start_lon, end_lat, end_lon, mode="green"):

        weights = WEIGHTS.get(mode, WEIGHTS["green"])

        start = ox.distance.nearest_nodes(self.G, start_lon, start_lat)
        end = ox.distance.nearest_nodes(self.G, end_lon, end_lat)

        def weight(u, v, data):
            # SPRAWDZAMY CZY KRAWĘDŹ MA NASZE CECHY
            if "features" in data:
                return self._cost(data["features"], weights)

            # Jeśli krawędź nie ma cech (np. błąd grafu), zwracamy długość w km
            # jako domyślny, neutralny koszt
            return data.get("length", 100) / 1000

        route = nx.shortest_path(self.G, start, end, weight=weight)

        return self._route_to_coords(route)

    # =========================
    # OUTPUT
    # =========================
    def _route_to_coords(self, route):
        coords = []

        for u, v in zip(route[:-1], route[1:]):
            edge = list(self.G[u][v].values())[0]
            geom = edge.get("geometry")

            if geom is not None:
                coords.extend(list(geom.coords))
            else:
                coords.append((self.G.nodes[u]["x"], self.G.nodes[u]["y"]))

        return coords