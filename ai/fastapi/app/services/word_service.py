from app.utils.logger import logger
import json
from datetime import datetime
from app.services.gpt_service import GPTService
from app.services.diffusion_service import DiffusionService
from app.services.tts_service import TTSService
from app.models.word import WordRequest, WordResponse


class WordService:
    def __init__(self, s3, redis, db):
        self.s3 = s3
        self.redis = redis.get_client()
        self.db = db

    async def create_word(self, request):
        logger.info(f"[WordService] 예문 생성 시작: session={request.sessionId}, word='{request.wordEn}'")

        try:
            # 1. GPT 예문 생성
            sentence, translation, image_prompt = await GPTService(redis=self.redis).generate_sentence(
                user_id=request.userId,
                session_id=request.sessionId,
                word=request.wordEn,
                theme=request.theme
            )
            logger.info(f"[GPT 완료] 예문: '{sentence}'")

            # 2. 이미지, 오디오 생성
            image_bytes = await DiffusionService().generate_image(image_prompt)
            logger.info("[이미지 생성 완료]")

            audio_bytes = await TTSService().generate_audio(sentence)
            logger.info("[TTS 생성 완료]")

            # 3. S3 업로드
            try:
                image_url = self.s3.upload(file=image_bytes, filename=f"{request.sessionId}_{request.wordEn}_image.png")
                audio_url = self.s3.upload(file=audio_bytes, filename=f"{request.sessionId}_{request.wordEn}_audio.wav")
                logger.info("[S3 업로드 완료]")
            except Exception as e:
                logger.error(f"[S3 업로드 실패] {e}")
                raise

            # 4. Redis 저장
            redis_key = f"Learning:user:{request.userId}:session:{request.sessionId}:word:{request.wordEn}"
            redis_value = {
                "word": request.wordEn,
                "sentence": sentence,
                "translation": translation,
                "image_prompt": image_prompt,
                "image_url": image_url,
                "audio_url": audio_url,
                "cached_at": datetime.utcnow().isoformat()
            }

            self.redis.set(redis_key, json.dumps(redis_value))
            self.redis.expire(redis_key, 3600)
            logger.info(f"[Redis 저장 완료] key={redis_key}")

            # 5. 응답 반환
            return WordResponse(
                wordEn=request.wordEn,
                sentence=sentence,
                translation=translation,
                imagePrompt=image_prompt,
                imageUrl=image_url,
                audioUrl=audio_url
            )

        except Exception as e:
            logger.error(f"[WordService 실패] session={request.sessionId}, word='{request.wordEn}', 오류: {e}")
            raise
