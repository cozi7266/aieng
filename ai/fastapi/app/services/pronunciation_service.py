# import os
# import tempfile
# from typing import Dict, Optional
# from fastapi import UploadFile
# from google.cloud import speech
# import Levenshtein
# import wave
# import logging
# from app.utils.logger import logger
# import re

# logger = logging.getLogger(__name__)

# # 특수문자 제거 및 소문자 변환
# def clean_text(text: str) -> str:
#     return re.sub(r'[^\w\s]', '', text.lower())

# async def evaluate_pronunciation(audio_file: UploadFile, expected_text: Optional[str] = None) -> Dict:
#     """
#     Google Cloud Speech-to-Text API를 사용하여 발음을 평가합니다.
    
#     Args:
#         audio_file: 사용자의 음성 파일
#         expected_text: 예상되는 텍스트
    
#     Returns:
#         Dict: 발음 평가 결과
#     """
#     logger.info(f"[STT 평가 시작] 업로드된 음성 파일: {audio_file.filename}, 예상 문장: '{expected_text}'")
    
#     # 임시 파일로 저장
#     with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
#         content = await audio_file.read()
#         temp_file.write(content)
#         temp_file_path = temp_file.name

#     try:
#         # WAV 파일의 샘플레이트 확인
#         sample_rate = 16000  # 기본값
#         try:
#             with wave.open(temp_file_path, 'rb') as wav_file:
#                 sample_rate = wav_file.getframerate()
#         except Exception as e:
#             logger.warning(f"WAV 파일 샘플레이트 확인 실패: {str(e)}")

#         # Google Cloud Speech-to-Text 클라이언트 초기화
#         client = speech.SpeechClient()

#         # 오디오 파일 읽기
#         with open(temp_file_path, "rb") as audio_file:
#             content = audio_file.read()

#         # 오디오 설정
#         audio = speech.RecognitionAudio(content=content)
#         config = speech.RecognitionConfig(
#             encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
#             sample_rate_hertz=sample_rate,
#             language_code="en-US",
#             enable_automatic_punctuation=True,
#             model="default",  # 기본 모델 사용
#             use_enhanced=True  # 향상된 모델 사용
#         )

#         # 음성 인식 수행
#         response = client.recognize(config=config, audio=audio)

#         # 결과 처리
#         recognized_text = ""
#         confidence = 0.0
#         if response.results:
#             recognized_text = response.results[0].alternatives[0].transcript
#             confidence = response.results[0].alternatives[0].confidence

#         logger.info(f"[STT] 인식된 문장: '{recognized_text}'")

#         # 발음 정확도 계산
#         accuracy = 0
#         feedback = "잘했어요! 👏"
#         if expected_text:
#             # 특수문자 제거 및 소문자 변환
#             clean_recognized = clean_text(recognized_text)
#             clean_expected = clean_text(expected_text)
            
#             # Levenshtein 거리를 사용하여 유사도 계산
#             distance = Levenshtein.distance(clean_recognized, clean_expected)
#             max_length = max(len(clean_recognized), len(clean_expected))
#             accuracy = ((max_length - distance) / max_length) * 100
            
#             # 피드백 메시지 설정
#             if accuracy < 50:
#                 feedback = "다시 한 번 따라 읽어 볼까요? 🎵"
#             elif accuracy < 80:
#                 feedback = "좋아요! 조금만 더 연습해볼까요? 💪"
#             else:
#                 feedback = "완벽해요! 🌟"

#         result = {
#             "recognized_text": recognized_text,
#             "expected_text": expected_text,
#             "accuracy": round(accuracy, 2) if expected_text else None,
#             "confidence": round(confidence, 2),
#             "feedback": feedback
#         }
        
#         logger.info(f"[STT 평가 완료] 예상='{expected_text}' / 인식='{recognized_text}' / 정확도={accuracy:.1f}% / confidence={confidence:.2f} / feedback='{feedback}'")
#         return result

#     except Exception as e:
#         logger.error(f"[STT 오류] 음성 인식 중 예외 발생: {str(e)}")
#         raise e

#     finally:
#         # 임시 파일 삭제
#         os.unlink(temp_file_path)
