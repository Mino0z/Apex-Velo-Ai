from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Konfiguracja CORS - pozwala Reactowi na bezpieczne połączenie
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/test")
async def test_route(
    safety: int = Query(50), 
    eco: int = Query(50)
):
    # Te dane zobaczysz w terminalu Anacondy, gdy klikniesz przycisk w React
    print(f"Otrzymano zapytanie o trasę! Preferencje -> Bezpieczeństwo: {safety}%, Ekologia: {eco}%")
    
    # Tutaj w przyszłości kolega wstawi wywołanie swojego algorytmu z NetworkX/OSMnx
    # Na razie odsyłamy potwierdzenie, żeby React wiedział, że wszystko gra
    return {
        "status": "success",
        "message": f"PRZYJĄŁEM! Twoje suwaki to: S={safety} i E={eco}",
        "received_params": {"safety": safety, "eco": eco}
    }

if __name__ == "__main__":
    import uvicorn
    # Odpalamy na porcie 8000
    uvicorn.run(app, host="127.0.0.1", port=8000)