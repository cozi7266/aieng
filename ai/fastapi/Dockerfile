FROM pytorch/pytorch:2.6.0-cuda12.4-cudnn9-devel

# 시스템 패키지
RUN apt update && \
    apt install -y espeak-ng libsox-dev sox libsox-fmt-all ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# 작업 디렉토리
WORKDIR /app

# 프로젝트 복사
COPY . .

# 패키지 매니저 설치 및 requirements 설치
RUN pip install uv
RUN uv pip install --system -r requirements.txt

# zonos 모듈 경로 추가
ENV PYTHONPATH="${PYTHONPATH}:/app"

# 포트 오픈
EXPOSE 8000

# FastAPI 실행
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
