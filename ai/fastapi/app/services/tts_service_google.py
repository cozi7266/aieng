import os
from google.cloud import texttospeech
from app.utils.logger import logger


class GoogleTTSService:
    def __init__(self, client: texttospeech.TextToSpeechClient = None):
        try:
            if client:
                self.client = client
                logger.info("Google TTS 클라이언트 인스턴스 주입 완료")
            else:
                logger.info("Google TTS 클라이언트 초기화 중...")
                self.client = texttospeech.TextToSpeechClient()
                logger.info("Google TTS 클라이언트 초기화 완료")

        except Exception as e:
            logger.error(f"Google TTS 클라이언트 초기화 실패: {e}")
            raise RuntimeError("Google TTS 클라이언트 초기화 중 오류 발생") from e

    async def generate_audio(self, text: str, gender: str = False) -> bytes:
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
            name="en-US-Wavenet-D" if gender == "MALE" else "en-US-Wavenet-F",
            ssml_gender=texttospeech.SsmlVoiceGender.MALE if gender == "MALE" else texttospeech.SsmlVoiceGender.FEMALE
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

            logger.info(f"[TTSService] TTS 생성 및 저장 완료")
            return audio_bytes

        except Exception as e:
            logger.error(f"[TTSService] TTS 생성 실패: {e}")
            raise RuntimeError("TTS 생성 중 오류가 발생했습니다.") from e
