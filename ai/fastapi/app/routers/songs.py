from fastapi import APIRouter, Depends
from app.models.song import SongRequest, SongResponse
from app.services.sonauto_service import SonautoService
from app.dependencies import get_s3, get_redis

router = APIRouter()

@router.post("/", response_model=SongResponse)
def generate_custom_song(
    request: SongRequest,
    redis = Depends(get_redis),
    s3 = Depends(get_s3)
):
    result = SonautoService(redis, s3).generate_song(
        user_id=request.user_id,
        mood=request.mood,
        voice=request.voice
    )
    return result