from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

print("🚀 Starting FastAPI app...")

from app.api.v1.endpoints.predict import router as predict_router

app = FastAPI(
    title="Solara API",
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