from pathlib import Path
from google.oauth2 import service_account
from google.cloud import texttospeech
import logging

from app.db.session import SessionLocal
from app.utils.redis import RedisClient
from app.utils.s3 import S3Client
from app.utils.logger import logger

from app.services.gpt_service import GPTService
from app.services.tts_service_google import GoogleTTSService
from app.services.tts_service_zonos import ZonosService
from app.services.sonauto_service import SonautoService

from Zonos.zonos.model import Zonos
from app.config import settings

# ---- 싱글 인스턴스 ----
redis_client = RedisClient()
s3_client = S3Client()

# 🔐 Google TTS 인증 정보 명시적 주입
google_tts_credentials = service_account.Credentials.from_service_account_file(
    Path(settings.TTS_API_KEY).resolve()
)
google_tts_client = texttospeech.TextToSpeechClient(credentials=google_tts_credentials)
google_tts_service = GoogleTTSService(client=google_tts_client)

# Zonos 모델 로드
logger.info("Zonos 모델 로드 시작...")
zonos_model = Zonos.from_pretrained("Zyphra/Zonos-v0.1-transformer", device="cuda")
logger.info(f"모델 초기 로드 후 디바이스: {next(zonos_model.parameters()).device}")
zonos_model = zonos_model.to("cuda")
logger.info(f"모델 GPU 이동 후 디바이스: {next(zonos_model.parameters()).device}")
zonos_service = ZonosService(model=zonos_model)

# GPT + Sonauto
gpt_service = GPTService(redis=redis_client.get_client())
sonauto_service = SonautoService(redis=redis_client, s3=s3_client, gpt=gpt_service)

# ---- FastAPI DI ----
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_redis():
    return redis_client

def get_s3():
    return s3_client

def get_gpt():
    return gpt_service

def get_google_tts():
    return google_tts_service

def get_zonos_tts():
    return zonos_service

def get_sonauto():
    return sonauto_service
