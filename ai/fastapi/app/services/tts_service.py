from google.cloud import texttospeech
from app.config import settings
import os

class TTSService:
    def __init__(self):
        # 환경 변수는 시스템에서 설정하거나 여기서 수동 지정 가능
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.TTS_API_KEY
        self.client = texttospeech.TextToSpeechClient()

    async def generate_audio(self, text: str) -> bytes:
        # SSML 처리: 0.5초 쉬고 말하기
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

        response = self.client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        output_file = "tts_result.wav"
        with open(output_file, 'wb') as out:
            out.write(response.audio_content)
            print(f"음성 파일 저장 완료: {output_file}")

        return response.audio_content  # bytes 반환
