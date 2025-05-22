import os
import tempfile
import uuid
import subprocess
from typing import Dict, Optional
from fastapi import UploadFile
from google.cloud import speech
import Levenshtein
import wave
import logging
import re
from urllib.parse import unquote

logger = logging.getLogger(__name__)

def clean_text(text: str) -> str:
    """특수문자 제거 및 소문자 변환"""
    return re.sub(r'[^\w\s]', '', text.lower())

def get_duration(input_path: str) -> float:
    """FFmpeg로 오디오 길이 확인"""
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", input_path],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True
        )
        return float(result.stdout.decode().strip())
    except Exception as e:
        logger.warning(f"[오디오 길이 확인 실패] {input_path}: {str(e)}")
        return 0.0

async def convert_to_wav(input_path: str) -> str:
    """FFmpeg를 사용하여 입력 오디오를 wav(16kHz, mono)로 변환"""
    output_path = os.path.join(tempfile.gettempdir(), f"{uuid.uuid4()}.wav")
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", "-f", "wav", output_path],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True
        )
        return output_path
    except subprocess.CalledProcessError as e:
        logger.error(f"[FFmpeg 변환 실패] {e.stderr.decode()}")
        raise RuntimeError("오디오 파일 변환에 실패했습니다.")

async def evaluate_pronunciation(audio_file: UploadFile, expected_text: Optional[str] = None) -> Dict:
    try:
        expected_text = unquote(expected_text or "").strip()
    except Exception as e:
        logger.warning(f"[expected_text 디코딩 실패] {e}")
        expected_text = ""

    logger.info(f"[STT 평가 시작] 업로드된 파일: {audio_file.filename}, 예상 문장: '{expected_text}'")

    ext = os.path.splitext(audio_file.filename)[-1].lower()

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_input_file:
        content = await audio_file.read()
        temp_input_file.write(content)
        temp_input_path = temp_input_file.name

    temp_wav_path = None

    try:
        # 모든 포맷 → WAV 변환
        temp_wav_path = await convert_to_wav(temp_input_path)
        audio_path = temp_wav_path
        encoding = speech.RecognitionConfig.AudioEncoding.LINEAR16
        sample_rate = 16000
        try:
            with wave.open(audio_path, 'rb') as wav_file:
                sample_rate = wav_file.getframerate()
        except Exception as e:
            logger.warning(f"[샘플레이트 확인 실패] {str(e)}")

        # 오디오 길이 확인
        duration = get_duration(audio_path)
        logger.info(f"[오디오 길이] {audio_path} => {duration:.2f}초")
        if duration < 0.5:
            logger.warning(f"[무시됨] 오디오 길이가 너무 짧습니다 (0.5초 미만)")
            return {
                "recognized_text": "",
                "expected_text": expected_text,
                "accuracy": 0.0,
                "confidence": 0.0,
                "feedback": "음성이 녹음되지 않았어요. 다시 말해볼까요? 🎤"
            }

        # 모델 자동 선택
        def select_model(text: Optional[str]) -> str:
            if not text:
                return "default"
            word_count = len(text.strip().split())
            return "command_and_search" if word_count <= 2 else "default"

        selected_model = select_model(expected_text)
        logger.info(f"[모델 선택] '{expected_text}' → 모델: {selected_model}")

        # Speech contexts 설정
        speech_contexts = []
        if expected_text:
            try:
                speech_contexts.append(
                    speech.SpeechContext(
                        phrases=[expected_text],
                        boost=20.0
                    )
                )
            except Exception as e:
                logger.warning(f"[speech_contexts 생성 실패] '{expected_text}' → {e}")

        config = speech.RecognitionConfig(
            encoding=encoding,
            sample_rate_hertz=sample_rate,
            language_code="en-US",
            enable_automatic_punctuation=(selected_model == "default"),
            model=selected_model,
            use_enhanced=True,
            speech_contexts=speech_contexts
        )

        client = speech.SpeechClient()
        with open(audio_path, "rb") as f:
            content = f.read()

        audio = speech.RecognitionAudio(content=content)
        response = client.recognize(config=config, audio=audio)

        recognized_text = ""
        confidence = 0.0
        if response.results:
            recognized_text = response.results[0].alternatives[0].transcript
            confidence = response.results[0].alternatives[0].confidence

        logger.info(f"[STT 결과] 인식된 문장: '{recognized_text}'")

        # 발음 유사도 평가
        accuracy = None
        feedback = "잘했어요! 👏"
        if expected_text:
            clean_recognized = clean_text(recognized_text)
            clean_expected = clean_text(expected_text)
            distance = Levenshtein.distance(clean_recognized, clean_expected)
            max_length = max(len(clean_recognized), len(clean_expected))
            accuracy = ((max_length - distance) / max_length) * 100

            if accuracy < 10:
                feedback = "다시 한 번 따라 읽어 볼까요? 🎵"
            else:
                feedback = "잘했어요! 🌟"

        result = {
            "recognized_text": recognized_text,
            "expected_text": expected_text,
            "accuracy": round(accuracy, 2) if accuracy is not None else None,
            "confidence": round(confidence, 2),
            "feedback": feedback
        }

        logger.info(f"[STT 평가 완료] {result}")
        return result

    except Exception as e:
        logger.error(f"[STT 오류] {str(e)}")
        raise e

    finally:
        for path in [temp_input_path, temp_wav_path]:
            try:
                if path and os.path.exists(path):
                    os.unlink(path)
            except Exception as e:
                logger.warning(f"[임시 파일 삭제 실패] {path}: {str(e)}")
