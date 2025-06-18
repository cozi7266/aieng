from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_redis, get_s3
from app.models.word import WordRequest, WordResponse
from app.services.word_service import WordService

router = APIRouter()

@router.post("/", response_model=WordResponse)
async def generate_word(
    request: WordRequest,
    db: Session = Depends(get_db),
    redis = Depends(get_redis),
    s3 = Depends(get_s3),
):
    service = WordService(db=db, redis=redis, s3=s3)
    return await service.create_word(request)
