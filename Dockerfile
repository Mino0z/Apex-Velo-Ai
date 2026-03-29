FROM python:3.11-slim

WORKDIR /app

# Optymalizacja: Jedna twarda instalacja zależności systemowych
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    libspatialindex-dev \
    libgeos-dev \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# pip upgrade
RUN pip install --upgrade pip

# Tylko requirements (cache layer)
COPY requirements.txt .

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt

# Dopiero kod (w tym pliki z danymi surowymi)
COPY . .

# Wymuszenie wygenerowania nowego cache podczas budowy (zabezpieczenie ścieżki)
RUN cd AI_Engine && mkdir -p cache && rm -f cache/*.pkl && python import_data_to_cache.py

EXPOSE 8000

CMD ["python", "Backend/run_fastapi.py"]