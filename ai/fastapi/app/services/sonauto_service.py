import json
import requests
import uuid
from datetime import datetime
from app.config import settings
from app.services.gpt_service import GPTService
from app.utils.logger import logger
from app.models.song import SongResponse


class SonautoService:
    def __init__(self, redis, s3, gpt: GPTService):
        try:
            self.redis = redis.get_client()
            logger.info("Redis 클라이언트 주입 완료 (SonautoService)")

            self.s3 = s3
            logger.info("S3 클라이언트 주입 완료 (SonautoService)")

            self.gpt = gpt
            logger.info("GPT 서비스 주입 완료 (SonautoService)")

            self.base_url = "https://api.sonauto.ai/v1"
            self.headers = {
                "Authorization": f"Bearer {settings.SONAUTO_API_KEY}",
                "Content-Type": "application/json"
            }
            logger.info("SonautoService 헤더 및 기본 URL 설정 완료")

            # 옵션: API Key 유효성 간단 체크
            if not settings.SONAUTO_API_KEY:
                raise ValueError("Sonauto API 키가 설정되지 않았습니다.")

            logger.info("SonautoService 초기화 완료")

        except Exception as e:
            logger.error(f"SonautoService 초기화 실패: {e}")
            raise RuntimeError("SonautoService 구성 요소 초기화 중 오류 발생") from e

    def get_sentences_from_redis(self, user_id: int, session_id: int) -> list[str]:
        pattern = f"Learning:user:{user_id}:session:{session_id}:word:*"
        keys = sorted(self.redis.keys(pattern))
        sentences = []

        for key in keys:
            raw = self.redis.get(key)
            if raw:
                data = json.loads(raw)
                sentence = data.get("sentence")
                if sentence:
                    sentences.append(sentence)

        return sentences

    async def generate_song(self, user_id: int, session_id: int, mood_name: str, voice_name: str) -> SongResponse:
        # 1. Redis에서 문장 조회
        sentences = self.get_sentences_from_redis(user_id, session_id)
        if len(sentences) < 5:
            raise ValueError("학습 문장은 정확히 5개여야 합니다.")

        logger.info(f"[Sonauto] 세션 {session_id}에서 문장 {len(sentences)}개 조회 완료")

        # 2. GPT로 가사 및 번역 생성
        title, lyrics_en, lyrics_ko = await self.gpt.generate_lyrics(sentences)
        logger.info("[Sonauto] GPT 가사 생성 완료")

        # 3. Sonauto 요청
        try:
            response = requests.post(
                f"{self.base_url}/generations",
                headers=self.headers,
                json={
                    "tags": ["kids", "nursery rhyme", "happy", "children", "educational", "repetitive"],
                    "prompt": "make song with given lyrics\n Lyrics: " + lyrics_en + "\nVocal Gender: " + voice_name,
                    "num_songs": 1
                }
            )
            response.raise_for_status()
            task_id = response.json()["task_id"]
            logger.info(f"[Sonauto] Task ID 발급됨: {task_id}")
        except Exception as e:
            logger.error(f"[Sonauto] Sonauto API 요청 실패: {e}")
            raise RuntimeError("Sonauto API 요청 실패") from e

        # 4. Polling
        while True:
            status_resp = requests.get(f"{self.base_url}/generations/status/{task_id}", headers=self.headers)
            status = status_resp.text.strip('"')
            if status in ["SUCCESS", "FAILURE"]:
                break

        if status == "FAILURE":
            logger.error("[Sonauto] 노래 생성 실패")
            raise RuntimeError("Song generation failed")

        result = requests.get(f"{self.base_url}/generations/{task_id}", headers=self.headers)
        data = result.json()

        song_url = data["song_paths"][0]
        audio_data = requests.get(song_url)
        audio_data.raise_for_status()

        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        filename = f"users/{user_id}/sessions/{session_id}/song/song_{timestamp}.ogg"   

        try:
            s3_url = self.s3.upload(audio_data.content, filename)
            logger.info("[S3 업로드 완료]")
        except Exception as e:
            logger.error(f"[S3 업로드 실패] {e}")
            raise

        # 6. Redis 저장
        redis_key = f"Song:user:{user_id}:session:{session_id}"
        redis_value = {
            "song_url": s3_url,
            "title": title,
            "lyrics_en": lyrics_en,
            "lyrics_ko": lyrics_ko,
            "mood": mood_name,
            "voice": voice_name,
            "cached_at": datetime.utcnow().isoformat()
        }
        self.redis.set(redis_key, json.dumps(redis_value))
        self.redis.expire(redis_key, 86400)

        logger.info(f"[Sonauto] 노래 생성 완료 및 Redis 저장 완료: {s3_url}")

        return SongResponse(
            songUrl=s3_url,
            title=title,
            lyricsEn=lyrics_en,
            lyricsKo=lyrics_ko
        )
