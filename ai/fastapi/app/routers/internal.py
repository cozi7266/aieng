from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.dependencies import get_db, get_redis, get_s3
from app.services.sonauto_service import SonautoService
from app.db.models import WordRecord
from app.config import settings
import json

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok"}


@router.get("/debug/db")
def debug_db(db: Session = Depends(get_db)):
    """최근 단어 10개 확인"""
    result = db.execute(text("SHOW TABLES;"))
    tables = [row[0] for row in result.fetchall()]
    return {"tables": tables}


@router.get("/debug/s3")
def debug_s3(s3=Depends(get_s3)):
    """S3 버킷에 있는 최근 파일 10개"""
    response = s3.client.list_objects_v2(Bucket=settings.S3_BUCKET_NAME)
    objects = response.get("Contents", [])[-10:]  # 가장 최근 항목이 뒤에 있을 가능성 ↑
    return [obj["Key"] for obj in objects]


@router.get("/debug/redis")
def debug_redis(redis=Depends(get_redis)):
    """Redis에 등록된 키 전체"""
    keys = redis.client.keys("*")
    # r = redis.get_client()
    # r.delete("learning:1:fuck")
    return [key.decode("utf-8") for key in keys]


@router.get("/debug/redis/user")
def get_user_redis_data(user_id: int, redis = Depends(get_redis)):
    client = redis.client
    pattern = f"learning:{user_id}:*"
    song_key = f"song:{user_id}"

    keys = client.keys(pattern)
    results = {}

    # learning:* 관련 키
    for key in keys:
        raw = client.get(key)
        if raw:
            try:
                results[key] = json.loads(raw)
            except json.JSONDecodeError:
                results[key] = raw.decode()

    # song:{user_id} 키 포함
    song_raw = client.get(song_key)
    if song_raw:
        try:
            results[song_key] = json.loads(song_raw)
        except json.JSONDecodeError:
            results[song_key] = song_raw.decode()

    return results


@router.post("/sonauto")
def generate_dummy_song(s3 = Depends(get_s3)):
    """더미 가사로 동요 생성 테스트"""
    dummy_lyrics = [
        "This is an apple.",
        "This is a banana.",
        "This is a grape.",
        "This is a orange.",
        "Fruits are yummy!"
    ]
    song_url = SonautoService(s3).generate_song(dummy_lyrics)
    return {"song_url": song_url}
