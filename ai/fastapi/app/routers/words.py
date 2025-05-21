from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_redis, get_s3
from app.models.word import WordRequest, WordResponse
from app.services.word_service import WordService
from app.utils.logger import logger

router = APIRouter()

@router.post("/", response_model=WordResponse)
async def generate_word(
    request: WordRequest,
    db: Session = Depends(get_db),
    redis = Depends(get_redis),
    s3 = Depends(get_s3),
):
    logger.info(f"[단어 생성 요청] sessionId={request.sessionId}, word='{request.wordEn}'")
    
    try:
        service = WordService(db=db, redis=redis, s3=s3)
        response = await service.create_word(request)
        logger.info(f"[단어 생성 완료] word='{response.wordEn}' 생성 완료")
        return response
    except Exception as e:
        logger.error(f"[단어 생성 실패] word='{request.wordEn}', 오류: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="단어 생성 중 오류가 발생했습니다."
        )
