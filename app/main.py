from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load env
load_dotenv()

app = FastAPI(
    title="Solara API",
    description="AI-driven Solar Optimization Backend",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 SAFE IMPORT (prevents startup crash)
try:
    from app.api.v1.endpoints.predict import router as predict_router
    app.include_router(predict_router, prefix="/api/v1")
    print("✅ Router loaded successfully")
except Exception as e:
    print("❌ ROUTER LOAD ERROR:", str(e))

# Root
@app.get("/")
def root():
    return {"message": "Solara Backend Running 🚀"}

# Health check (IMPORTANT for Render)
@app.get("/health")
def health():
    return {"status": "ok"}

# Startup debug
@app.on_event("startup")
async def startup_event():
    print("🔥 APP STARTED SUCCESSFULLY")
    print("ENV CHECK:")
    print("OPENWEATHER:", os.getenv("OPENWEATHER_API_KEY"))
    print("OPENCAGE:", os.getenv("OPENCAGE_API_KEY"))