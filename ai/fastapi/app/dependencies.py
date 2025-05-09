from app.db.session import SessionLocal
from app.utils.redis import RedisClient
from app.utils.s3 import S3Client

# DB 세션
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Redis 클라이언트
def get_redis():
    redis_client = RedisClient()
    return redis_client

# S3 클라이언트
def get_s3():
    s3_client = S3Client()
    return s3_client
