import json
import requests
import uuid
from datetime import datetime
from app.config import settings

class SonautoService:
    def __init__(self, redis, s3):
        self.redis = redis.client
        self.s3 = s3
        self.base_url = "https://api.sonauto.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {settings.SONAUTO_API_KEY}",
            "Content-Type": "application/json"
        }

    def get_sentences_from_redis(self, user_id: int) -> list[str]:
        pattern = f"learning:{user_id}:*"
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

    def generate_song(self, user_id: int, mood: str, voice: str) -> dict:
        # 1. Redis에서 문장 수집
        sentences = self.get_sentences_from_redis(user_id)
        if not sentences:
            raise ValueError("No sentences found in Redis for this user.")

        lyrics = "\n".join(sentences)

        # 2. 프롬프트 구성
        prompt = (
            f"Create a {mood} children's song using a {voice} voice. "
            f"Use the following lines as the main lyrics, but you may add simple, catchy English lines. "
            f"Target age: 3–6. Melody should be like 'Baby Shark'.\n\n"
            f"<lyrics>\n{lyrics}"
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

        filename = f"song_{user_id}_{uuid.uuid4().hex}.ogg"

        with open(filename, "wb") as f:
            f.write(song_data.content)
            print(f"곡이 로컬에 저장됨: {filename}")

        s3_url = self.s3.upload(song_data.content, filename)

        redis_key = f"song:{user_id}"
        redis_value = {
            "song_url": s3_url,
            "lyrics": lyrics_result,
            "cached_at": datetime.utcnow().isoformat()
        }
        self.redis.set(redis_key, json.dumps(redis_value))
        self.redis.expire(redis_key, 3600)  # TTL: 1시간

        return {
            "song_url": s3_url,
            "lyrics": lyrics_result
        }
