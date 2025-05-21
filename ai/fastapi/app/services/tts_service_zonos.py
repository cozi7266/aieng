import torch
import torchaudio
import uuid
import requests
from io import BytesIO
from app.utils.logger import logger
from Zonos.zonos.model import Zonos
from Zonos.zonos.conditioning import make_cond_dict


class ZonosService:
    def __init__(self, model: Zonos = None, device: str = "cuda"):
        self.device = device
        try:
            if model:
                self.model = model
                logger.info(f"Zonos 모델 인스턴스 주입 완료 (디바이스: {next(self.model.parameters()).device})")
            else:
                logger.info("Zonos 사전 학습 모델 로드 중...")
                self.model = Zonos.from_pretrained("Zyphra/Zonos-v0.1-transformer", device=self.device)
                logger.info(f"Zonos 사전 학습 모델 로드 완료 (디바이스: {next(self.model.parameters()).device})")

            self.sampling_rate = self.model.autoencoder.sampling_rate
            logger.info(f"ZonosService 초기화 완료 (샘플링 레이트: {self.sampling_rate})")

        except Exception as e:
            logger.error(f"ZonosService 초기화 실패: {e}")
            raise RuntimeError("ZonosService 초기화 중 오류 발생") from e

    async def generate_audio(self, text: str, voice_url: str) -> bytes:
        logger.info(f"[ZonosService] Zonos 기반 TTS 요청: '{text[:50]}'")
        logger.info(f"현재 모델 디바이스: {next(self.model.parameters()).device}")
        logger.info(f"모델 dtype: {next(self.model.parameters()).dtype}")

        try:
            # S3 URL에서 음성 파일 다운로드
            response = requests.get(voice_url)
            response.raise_for_status()

            # 메모리에서 음성 로드
            wav, sr = torchaudio.load(BytesIO(response.content))
            logger.info(f"오디오 로드 후 디바이스: {wav.device}")
            wav = wav.to(self.device)
            logger.info(f"오디오 GPU 이동 후 디바이스: {wav.device}")

            # 스피커 임베딩 생성
            logger.info("스피커 임베딩 생성 시작...")
            speaker = self.model.make_speaker_embedding(wav, sr)
            logger.info(f"스피커 임베딩 디바이스: {speaker.device}")

            # 조건 생성 및 음성 생성
            torch.manual_seed(421)
            cond = make_cond_dict(text=text, speaker=speaker, language="en-us")
            logger.info("조건 생성 완료")
            
            logger.info("조건 준비 시작...")
            conditioning = self.model.prepare_conditioning(cond)
            logger.info(f"조건 준비 완료 (디바이스: {conditioning.device})")
            
            logger.info("음성 생성 시작...")
            codes = self.model.generate(conditioning)
            logger.info(f"코드 생성 완료 (디바이스: {codes.device})")
            
            logger.info("오디오 디코딩 시작...")
            wavs = self.model.autoencoder.decode(codes).cpu()
            logger.info("오디오 디코딩 완료")

            # 앞에 0.5초 정적 추가
            prepend_samples = int(0.5 * self.sampling_rate)
            silence = torch.zeros((1, prepend_samples))
            final_audio = torch.cat([silence, wavs[0]], dim=1)

            # 결과 저장 및 반환
            buf = BytesIO()
            torchaudio.save(buf, final_audio, self.sampling_rate, format="wav")
            buf.seek(0)

            logger.info(f"[ZonosService] TTS 생성 및 반환 완료")
            return buf.read()

        except Exception as e:
            logger.error(f"[ZonosService] Zonos TTS 생성 실패: {e}")
            raise RuntimeError("Zonos TTS 생성 중 오류가 발생했습니다.") from e
