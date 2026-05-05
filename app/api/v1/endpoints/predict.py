from fastapi import APIRouter
from app.application.pipeline import run_pipeline
from app.schemas.request import PredictRequest

router = APIRouter()

@router.post("/predict")
async def predict(data: PredictRequest):
    result = await run_pipeline(data)
    return result