import torch
from fastapi import FastAPI
from app.routers import words, songs, internal, pronunciation
from app.utils.logger import logger

app = FastAPI()

# GPU 사용 가능 여부 확인
logger.info(f"CUDA 사용 가능: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    logger.info(f"현재 사용 중인 GPU: {torch.cuda.get_device_name(0)}")
    logger.info(f"사용 가능한 GPU 개수: {torch.cuda.device_count()}")
else:
    logger.warning("GPU를 사용할 수 없습니다. CPU를 사용합니다.")

app.include_router(words.router, prefix="/words", tags=["Words"])
app.include_router(songs.router, prefix="/songs", tags=["Songs"])
app.include_router(internal.router, prefix="/internal", tags=["Internal"])
app.include_router(pronunciation.router, prefix="/pronunciation", tags=["pronunciation"])