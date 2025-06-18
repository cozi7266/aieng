from fastapi import APIRouter, Depends, HTTPException, status
from app.models.song import SongRequest, SongResponse
from app.services.sonauto_service import SonautoService
from app.dependencies import get_s3, get_redis
from app.utils.logger import logger

router = APIRouter()

@router.post("/", response_model=SongResponse)
async def generate_custom_song(
    request: SongRequest,
    redis = Depends(get_redis),
    s3 = Depends(get_s3)
):
    logger.info(f"[노래 생성 요청] sessionId={request.sessionId}, mood={request.moodName}, voice={request.voiceName}")
    
    try:
        result = await SonautoService(redis, s3).generate_song(
            user_id=request.userId,
            session_id=request.sessionId,
            mood_name=request.moodName,
            voice_name=request.voiceName
        )
        logger.info(f"[노래 생성 완료] sessionId={request.sessionId} → {result.songUrl}")
        return result

    except Exception as e:
        logger.error(f"[노래 생성 실패] sessionId={request.sessionId}, 오류: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="노래 생성 중 오류가 발생했습니다."
        )
