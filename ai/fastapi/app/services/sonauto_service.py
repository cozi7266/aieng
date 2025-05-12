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

    def generate_song(self, child_id: int, session_id: int, mood_name: str, voice_name: str) -> dict:
        # 1. Redis에서 문장 수집
        sentences = self.get_sentences_from_redis(child_id, session_id)
        if not sentences:
            raise ValueError("No sentences found in Redis for this user.")

        lyrics = "\n".join(sentences)

        # 2. 프롬프트 구성
        prompt = f"""
        Create a fun and catchy children's song in English for kids aged 7 to 8.

        🔹 Style: Use a playful, repetitive melody similar to "Baby Shark" or "If You’re Happy and You Know It".
        🔹 Purpose: Language learning – help kids memorize and pronounce the following 5 simple English sentences.
        🔹 Structure: 
        - Repeat each sentence clearly 2–3 times in each verse.
        - Keep each line rhythmically short and singable.
        - Add very minimal connecting phrases or fun interjections like “la la la”, “yeah!” if needed.
        - Ensure the lyrics and melody match naturally.

        🎵 Use a cheerful children's music mood with xylophones, claps, and simple percussion.
        🎤 Voice should be clear, slow, and friendly, suitable for early learners (like a kids' TV show voice).

        <sentences>
        {chr(10).join(lyrics)}

        <mood>
        {mood_name}

        <voice>
        {voice_name}
        """

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
