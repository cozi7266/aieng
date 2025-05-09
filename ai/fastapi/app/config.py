from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str

    # Redis
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_DB: int

    # S3
    S3_ACCESS_KEY: str
    S3_SECRET_KEY: str
    S3_BUCKET_NAME: str
    S3_REGION: str

    # External APIs
    OPENAI_API_KEY: str
    OPENAI_BASE_URL: str
    TTS_API_KEY: str
    SONAUTO_API_KEY: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# 전역 인스턴스 생성
settings = Settings()
