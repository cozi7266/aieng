import json
import requests
import uuid
from datetime import datetime
from app.config import settings

class SonautoService:
    def __init__(self, redis, s3):
        self.redis = redis.get_client()
        self.s3 = s3
        self.base_url = "https://api.sonauto.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {settings.SONAUTO_API_KEY}",
            "Content-Type": "application/json"
        }

    def get_sentences_from_redis(self, child_id: int, session_id: int) -> list[str]:
        pattern = f"word:{child_id}:{session_id}*"
        keys = self.redis.keys(pattern)
        sentences = []

        for key in keys:
            raw = self.redis.get(key)
            if raw:
                data = json.loads(raw)
                sentence = data.get("sentence")
                if sentence:
                    sentences.append(sentence)

        return sentences

    def generate_song(self, child_id: int, session_id: int, mood: str, voice: str) -> dict:
        # 1. Redis에서 문장 수집
        sentences = self.get_sentences_from_redis(child_id, session_id)
        if not sentences:
            raise ValueError("No sentences found in Redis for this user.")

        lyrics = "\n".join(sentences)

        # 2. 프롬프트 구성
        prompt = (
            "Create a fun, catchy children's song in English for kids aged 7 to 8 years old. "
            "The lyrics must be based mostly on the following 5 simple English sentences sequentially, designed for language learning. "
            "Repeat these sentences in a melodic and natural way, like how educational children's songs work. "
            "You may add short and simple connecting sentences, sounds, or phrases if needed, "
            "but keep the added content minimal. "
            "The final song should sound playful, repetitive, and help children memorize these phrases easily.\n\n"
            "song example: Baby Shark, Twinkle Twinkle Little Star/"
            "<sentences>\n" + "\n".join(lyrics)
        )

        # 3. Sonauto 요청
        response = requests.post(
            f"{self.base_url}/generations",
            headers=self.headers,
            json={"prompt": prompt, "num_songs": 1}
        )
        response.raise_for_status()
        task_id = response.json()["task_id"]

        # 4. Polling
        while True:
            status_resp = requests.get(
                f"{self.base_url}/generations/status/{task_id}", headers=self.headers)
            status = status_resp.text.strip('"')
            if status in ["SUCCESS", "FAILURE"]:
                break

        if status == "FAILURE":
            raise RuntimeError("Song generation failed.")

        result = requests.get(f"{self.base_url}/generations/{task_id}", headers=self.headers)
        data = result.json()

        song_url = data["song_paths"][0]
        lyrics_result = data.get("lyrics", lyrics)

        # 5. 다운로드 후 S3 업로드
        song_data = requests.get(song_url)
        song_data.raise_for_status()

        filename = f"song_{child_id}_{session_id}_{uuid.uuid4().hex}.ogg"

        with open(filename, "wb") as f:
            f.write(song_data.content)
            print(f"곡이 로컬에 저장됨: {filename}")

        s3_url = self.s3.upload(song_data.content, filename)

        redis_key = f"song:{child_id}:{session_id}"
        redis_value = {
            "song_url": s3_url,
            "lyrics": lyrics_result,
            "cached_at": datetime.utcnow().isoformat()
        }
        self.redis.set(redis_key, json.dumps(redis_value))
        self.redis.expire(redis_key, 3600)  # TTL: 1시간

        return {
            "songUrl": s3_url,
            "lyrics": lyrics_result
        }
