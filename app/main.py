from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.api.v1.endpoints.predict import router as predict_router

app = FastAPI(
    title="Solara API",
    description="AI-driven Solar Optimization Backend",
    version="1.0.0"
)

# 🔥 VERY IMPORTANT FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(predict_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Solara Backend Running 🚀"}