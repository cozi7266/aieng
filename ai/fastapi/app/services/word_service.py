import json
from datetime import datetime
from app.services.gpt_service import GPTService
from app.services.diffusion_service import DiffusionService
from app.services.tts_service import TTSService
from app.models.word import WordRequest, WordResponse

class WordService:
    def __init__(self, s3, redis, db):
        self.s3 = s3
        self.redis = redis.client
        self.db = db

    async def create_word(self, request: WordRequest) -> WordResponse:
        # 1. GPT 문장 생성
        sentence = await GPTService().generate_sentence(request.word)

        # 2. 문장 적합성 확인
        if not GPTService().is_sentence_appropriate(sentence):
            raise ValueError("Generated sentence not appropriate for children")

        # 3. 이미지, TTS 생성
        image_bytes = await DiffusionService().generate_image(sentence)
        audio_bytes = await TTSService().generate_audio(sentence)

        # 4. S3 업로드
        image_url = self.s3.upload(file=image_bytes, filename=f"{request.user_id}_{request.word}_image.png")
        audio_url = self.s3.upload(file=audio_bytes, filename=f"{request.user_id}_{request.word}_audio.wav")

        # 5. Redis 저장
        redis_key = f"learning:{request.user_id}:{request.word}"
        redis_value = {
            "word": request.word,
            "sentence": sentence,
            "image_url": image_url,
            "audio_url": audio_url,
            "cached_at": datetime.utcnow().isoformat()
        }
        self.redis.set(redis_key, json.dumps(redis_value))
        self.redis.expire(redis_key, 3600)  # TTL 1시간

        # 6. 결과 반환
        return WordResponse(
            word=request.word,
            sentence=sentence,
            image_url=image_url,
            audio_url=audio_url
        )
