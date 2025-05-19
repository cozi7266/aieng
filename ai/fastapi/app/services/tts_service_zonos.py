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
                logger.info("Zonos 모델 인스턴스 주입 완료")
            else:
                logger.info("Zonos 사전 학습 모델 로드 중...")
                self.model = Zonos.from_pretrained("Zyphra/Zonos-v0.1-transformer", device=self.device)
                logger.info("Zonos 사전 학습 모델 로드 완료")

            self.sampling_rate = self.model.autoencoder.sampling_rate
            logger.info(f"ZonosService 초기화 완료 (샘플링 레이트: {self.sampling_rate})")

        except Exception as e:
            logger.error(f"ZonosService 초기화 실패: {e}")
            raise RuntimeError("ZonosService 초기화 중 오류 발생") from e

    async def generate_audio(self, text: str, voice_url: str) -> bytes:
        logger.info(f"[ZonosService] Zonos 기반 TTS 요청: '{text[:50]}'")

        try:
            # S3 URL에서 음성 파일 다운로드
            response = requests.get(voice_url)
            response.raise_for_status()

            # 메모리에서 음성 로드
            wav, sr = torchaudio.load(BytesIO(response.content))
            wav = wav.to(self.device)

            # 스피커 임베딩 생성
            speaker = self.model.make_speaker_embedding(wav, sr)

            # 조건 생성 및 음성 생성
            torch.manual_seed(421)
            cond = make_cond_dict(text=text, speaker=speaker, language="en-us")
            conditioning = self.model.prepare_conditioning(cond)
            codes = self.model.generate(conditioning)
            wavs = self.model.autoencoder.decode(codes).cpu()

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
