FROM python:3.11-slim

WORKDIR /app

# system deps (raz, cache layer)
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    libspatialindex-dev \
    libgeos-dev \
    && rm -rf /var/lib/apt/lists/*

# pip upgrade
RUN pip install --upgrade pip

# tylko requirements (cache layer!)
COPY requirements.txt .

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt

# dopiero kod
COPY . .

EXPOSE 8000

CMD ["python", "Backend/run_fastapi.py"]
