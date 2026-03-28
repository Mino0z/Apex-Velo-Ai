# Apex Velo - AI Strategic Planner

**Apex Velo** to oparte na sztucznej inteligencji narzędzie do planowania i analizy infrastruktury rowerowej. Aplikacja łączy dane miejskie (takie jak poziom hałasu i zieleń) z zaawansowanym silnikiem trasowania korytarzy, aby pomóc w optymalizacji inwestycji miejskich pod kątem bezpieczeństwa, wydajności i zwrotu społecznego.

![Zrzut ekranu aplikacji Apex Velo](docs/screenshot.png)

---

## 🛠 Technologie
* **Frontend:** React, Vite, Tailwind CSS, Leaflet (z natywną obsługą map i heatmap)
* **Backend:** Python, FastAPI, NetworkX
* **Środowisko:** Docker, Miniconda / pip

---

## 🚀 Jak uruchomić projekt lokalnie

Postępuj zgodnie z poniższymi krokami, aby zainstalować i uruchomić pełne środowisko (Backend AI + Frontend React).

### Wymagania wstępne
Przed rozpoczęciem upewnij się, że masz zainstalowane:
* [Miniconda](https://docs.anaconda.com/free/miniconda/index.html) (do zarządzania środowiskiem Pythona)
* [Docker](https://www.docker.com/products/docker-desktop/) (do konteneryzacji backendu)
* [Node.js i npm](https://nodejs.org/en/download/) (do uruchomienia frontendu)

### 1. Pobranie repozytorium
Sklonuj repozytorium na swój komputer i wejdź do głównego folderu projektu:
```bash
git clone [https://github.com/twoj-profil/apex-velo.git](https://github.com/twoj-profil/apex-velo.git)
cd apex-velo

conda env create -f environment.yml
conda activate apex_project

pip install -r requirements.txt

cd AI_Engine
# Pamiętaj, aby przed wykonaniem kolejnej komendy rozpakować tutaj plik data.zip!
python import_data_to_cache.py
cd ..


docker build -t apex-backend .
docker run -p 8000:8000 apex-backend


cd Frontend
npm install
npm run dev


