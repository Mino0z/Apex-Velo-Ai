from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# To pozwala Reactowi gadać z Pythonem bez błędów bezpieczeństwa (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/test")
async def test_route():
    return {"message": "Cześć! Tu Python. SafeTransit nadaje z Krakowa!", "status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)