import torch
import torchaudio
import torch.nn.functional as F

from zonos.model import Zonos
from zonos.conditioning import make_cond_dict

device = "cuda"  # GPU 사용을 명시

# 모델 로드
# model = Zonos.from_pretrained("Zyphra/Zonos-v0.1-hybrid", device=device)
model = Zonos.from_pretrained("Zyphra/Zonos-v0.1-transformer", device=device)

# 입력 오디오 (speaker embedding 생성용)
wav, sampling_rate = torchaudio.load("assets/exampleaudio_4.mp3")
wav = wav.to(device)  # 오디오도 GPU로 옮기기
speaker = model.make_speaker_embedding(wav, sampling_rate)

# 조건 설정
torch.manual_seed(421)
cond_dict = make_cond_dict(
    text="혜민아 잘 잤어? 프로젝트 때문에 고생 많다.",
    speaker=speaker,
    language="ko"
)
conditioning = model.prepare_conditioning(cond_dict)

# 코드 생성
codes = model.generate(conditioning)

# 디코딩 (디코더가 GPU에 있으면 CPU로 옮겨야 저장 가능)
wavs = model.autoencoder.decode(codes).cpu()

# 앞부분 무음 추가 (0.5초)
prepend_duration = 0.5  # 초
sampling_rate = model.autoencoder.sampling_rate
prepend_samples = int(prepend_duration * sampling_rate)
silence = torch.zeros((1, prepend_samples))

# 무음 + 생성된 오디오 결합
final_audio = torch.cat([silence, wavs[0]], dim=1)

# 저장
torchaudio.save("sample2.wav", final_audio, sampling_rate)