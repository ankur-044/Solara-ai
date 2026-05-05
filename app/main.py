from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from app.api.v1.endpoints.predict import router as predict_router

app = FastAPI(
    title="Solara API",
    description="AI-driven Solar Optimization Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Solara Backend Running 🚀"}

# 🔥 Debug on Render
@app.on_event("startup")
def startup_debug():
    print("ENV CHECK:")
    print("OPENCAGE:", os.getenv("OPENCAGE_API_KEY"))
    print("OPENWEATHER:", os.getenv("OPENWEATHER_API_KEY"))
    print("TOMORROW:", os.getenv("TOMORROW_API_KEY"))