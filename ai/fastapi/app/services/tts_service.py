import os
from pathlib import Path
from google.cloud import texttospeech
from app.config import settings
from app.utils.logger import logger

class TTSService:
    def __init__(self):
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.TTS_API_KEY
        self.client = texttospeech.TextToSpeechClient()
        self.output_dir = Path("tts_outputs")
        self.output_dir.mkdir(parents=True, exist_ok=True)

    async def generate_audio(self, text: str, filename: str = "tts_result") -> bytes:
        logger.info(f"[TTSService] TTS 생성 요청: '{text[:50]}'... (길이: {len(text)}자)")

        ssml_text = f'''
        <speak>
          <break time="500ms"/>
          {text}
        </speak>
        '''

        synthesis_input = texttospeech.SynthesisInput(ssml=ssml_text)

        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name="en-US-Wavenet-F",
            ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.LINEAR16,
            speaking_rate=0.75
        )

        try:
            response = self.client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            audio_bytes = response.audio_content

            # 로컬 저장
            file_path = self.output_dir / f"{filename}.wav"
            with open(file_path, "wb") as out:
                out.write(audio_bytes)

            logger.info(f"[TTSService] TTS 생성 및 저장 완료: {file_path}")
            return audio_bytes

        except Exception as e:
            logger.error(f"[TTSService] TTS 생성 실패: {e}")
            raise RuntimeError("TTS 생성 중 오류가 발생했습니다.") from e
