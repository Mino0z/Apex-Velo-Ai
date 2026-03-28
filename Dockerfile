# =========================
# BASE IMAGE
# =========================
FROM python:3.10-slim

# =========================
# SYSTEM DEPENDENCIES
# =========================
RUN apt-get update && apt-get install -y \
    build-essential \
    gdal-bin \
    libgdal-dev \
    libspatialindex-dev \
    libproj-dev \
    proj-data \
    proj-bin \
    && rm -rf /var/lib/apt/lists/*

ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# =========================
# WORKDIR
# =========================
WORKDIR /app

# =========================
# COPY REQUIREMENTS
# =========================
COPY Backend/requirements.txt .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# =========================
# COPY PROJECT (WAŻNE)
# =========================
COPY Backend ./Backend
COPY AI_Engine ./AI_Engine

# =========================
# PATH FIX
# =========================
ENV PYTHONPATH=/app

# =========================
# PORT
# =========================
EXPOSE 8000

# =========================
# RUN
# =========================
CMD ["uvicorn", "Backend.run_fastapi:app", "--host", "0.0.0.0", "--port", "8000"]
