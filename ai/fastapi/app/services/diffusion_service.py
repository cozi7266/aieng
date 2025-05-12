import os
from io import BytesIO
from PIL import Image
from pathlib import Path

class DiffusionService:
    def __init__(self):
        print("")
        
    async def generate_image(self, prompt: str) -> bytes:
        # 로컬 테스트 이미지 경로 (예: 프로젝트 루트의 test.png)
        base_dir = Path(__file__).resolve().parent
        test_image_path = (base_dir / ".." / ".." / "test.png").resolve()

        if not test_image_path.exists():
            raise FileNotFoundError(f"테스트 이미지가 존재하지 않습니다: {test_image_path}")

        # 이미지 열기 → BytesIO로 변환
        image = Image.open(test_image_path)
        buf = BytesIO()
        image.save("test_output.png")  # 확인용으로 저장도 가능
        image.save(buf, format="PNG")
        buf.seek(0)
        return buf.read()
