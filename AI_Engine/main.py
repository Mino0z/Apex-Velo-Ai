from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, ValidationError
import os
from openai import AsyncOpenAI
import json
from typing import Literal

# 1. Inicjalizacja aplikacji
app = FastAPI(
    title="Kraków Bike Routes AI",
    description="API do generowania tras rowerowych z użyciem modelu AI.",
    version="1.0.0",
    docs_url="/swagger",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/swagger")

# 2. Konfiguracja Klienta AI (Groq przez interfejs OpenAI)
def get_client() -> AsyncOpenAI:
    api_key = os.environ.get("AI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Brak klucza AI_API_KEY. Ustaw zmienną środowiskową i uruchom ponownie serwis.",
        )

    return AsyncOpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1",  # Przekierowanie na serwery Groq
    )

# 3. Definicja wejścia (Czego oczekujemy od .NET)
class RouteRequest(BaseModel):
    user_prompt: str
    city: str = "Kraków"

# 4. Definicja wyjścia (Co zwracamy do .NET)
class RouteResponse(BaseModel):
    title: str
    description: str
    difficulty: Literal["Easy", "Medium", "Hard"]
    distance_km: float
    waypoints: list[str]

# 5. Główny Endpoint
@app.post("/api/ai/generate-route", response_model=RouteResponse)
async def generate_route(request: RouteRequest):
    client = get_client()

    # System Prompt (Żelazne zasady dla AI)
    system_prompt = """
    Jesteś profesjonalnym przewodnikiem rowerowym w Krakowie i okolicach.
    Użytkownik poda swoje preferencje, a ty wygenerujesz trasę.
    Zwracaj TYLKO surowy JSON, bez żadnego dodatkowego tekstu i bez znaczników markdown.
    Format musi być dokładnie taki:
    {
      "title": "Krótka, chwytliwa nazwa",
      "description": "Zwięzły opis trasy i tego, co na niej widać",
      "difficulty": "Easy, Medium lub Hard",
      "distance_km": 25.5,
      "waypoints": ["Punkt startowy", "Punkt pośredni 1", "Punkt docelowy"]
    }
    """

    try:
        # Strzał do modelu
        response = await client.chat.completions.create(
            model="llama3-8b-8192",
            response_format={"type": "json_object"},  # Wymuszamy JSON
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Miasto: {request.city}. Moje wymagania: {request.user_prompt}"}
            ]
        )

        # Wyciągnięcie tekstu i walidacja struktury odpowiedzi.
        ai_result = response.choices[0].message.content
        if not ai_result:
            raise HTTPException(status_code=502, detail="Model nie zwrócił treści odpowiedzi.")

        parsed = json.loads(ai_result)
        validated = RouteResponse.model_validate(parsed)
        return validated

    except HTTPException:
        raise
    except (IndexError, AttributeError, TypeError):
        raise HTTPException(status_code=502, detail="Nieprawidłowy format odpowiedzi od modelu.")
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Model zwrócił niepoprawny JSON.")
    except ValidationError as exc:
        raise HTTPException(status_code=502, detail=f"Model zwrócił dane niezgodne ze schematem: {exc.errors()}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Błąd podczas generowania trasy: {str(e)}")
