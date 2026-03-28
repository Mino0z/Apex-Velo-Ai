import requests
import json

BASE_URL = "http://127.0.0.1:8000"


def test_planner_view():
    print("🧪 Testowanie widoku planisty...")
    payload = {
        "start_lat": 50.0614,
        "start_lon": 19.9365,
        "end_lat": 50.0680,
        "end_lon": 19.9550
    }

    response = requests.post(f"{BASE_URL}/suggest-corridor", json=payload)

    if response.status_code == 200:
        data = response.json()
        print("✅ Sukces!")
        print(f"📏 Dystans: {data['statistics']['Dystans']}")
        print(f"🌳 Zieleń: {data['statistics']['Udział zieleni']}")
        # Sprawdzamy czy geometria nie jest pusta
        print(
            f"📍 Liczba punktów trasy: {len(data['geometry']['coordinates'])}")
    else:
        print(f"❌ Błąd {response.status_code}: {response.text}")


def test_heatmap():
    print("\n🌡️ Testowanie heatmapy hałasu...")
    response = requests.get(f"{BASE_URL}/heatmap/noise")
    if response.status_code == 200:
        points = response.json()['points']
        print(f"✅ Pobrano {len(points)} punktów do heatmapy.")
    else:
        print(f"❌ Błąd heatmapy: {response.status_code}")


if __name__ == "__main__":
    try:
        test_planner_view()
        test_heatmap()
    except requests.exceptions.ConnectionError:
        print(
            "🚨 Błąd: Serwer FastAPI nie działa! Uruchom najpierw run_fastapi.py")