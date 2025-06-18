import redis
from app.config import settings
from app.utils.logger import logger

class RedisClient:
    def __init__(self):
        try:
            self.client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB
            )
            self.client.ping()
            logger.info("Redis 연결 성공")
        except redis.RedisError as e:
            logger.error(f"Redis 연결 실패: {e}")
            raise RuntimeError("Redis 연결 실패") from e

    def get_client(self):
        return self.client
