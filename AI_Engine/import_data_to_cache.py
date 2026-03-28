import pickle
from sourcing_data import LocalGeoData, OpenStreetMapData, BicycleCounterData
import os

local_data = LocalGeoData()
bicycle_data = BicycleCounterData()

if os.path.exists("cache/osm_data.pkl"):
    print("Skipping OSM download, cache exists.")
else:
    osm_data = OpenStreetMapData()

with open("cache/local_data.pkl", "wb") as f:
    pickle.dump(local_data, f)
with open("cache/osm_data.pkl", "wb") as f:
    pickle.dump(osm_data, f)
with open("cache/bicycle_data.pkl", "wb") as f:
    pickle.dump(bicycle_data, f)
