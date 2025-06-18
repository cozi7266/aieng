import json
import time
import aiohttp
import asyncio
from io import BytesIO
from PIL import Image
from pathlib import Path

class DiffusionService:
    def __init__(self):
        self.OUTPUT_DIR = Path("/workspace/ComfyUI/output")  # ComfyUI의 저장 폴더
        self.WORKFLOW_FILE = Path("/workspace/S12P31B104/ai/fastapi/app/workflows/ComfyUI_GG.json")
        self.COMFY_API = "http://175.121.93.70:51577"

        self.PROMPT_NODE_ID = "33"  # CLIPTextEncode
        self.OUTPUT_NODE_ID = "9"   # SaveImage

    async def generate_image(self, prompt: str) -> bytes:
        try:
            with open(self.WORKFLOW_FILE, "r", encoding="utf-8") as f:
                prompt_data = json.load(f)
        except Exception as e:
            raise RuntimeError(f"[DiffusionService] 워크플로우 로드 실패: {str(e)}")

        if self.PROMPT_NODE_ID not in prompt_data:
            raise RuntimeError(f"[DiffusionService] 프롬프트 노드({self.PROMPT_NODE_ID})가 없습니다.")
        
        # ✅ 프롬프트 입력 변경
        prompt_data[self.PROMPT_NODE_ID]["inputs"]["text"] = prompt
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{self.COMFY_API}/prompt", json={"prompt": prompt_data}) as res:
                if res.status != 200:
                    raise RuntimeError(f"[DiffusionService] ComfyUI 전송 실패: {await res.text()}")
                res_json = await res.json()
                prompt_id = res_json.get("prompt_id")
                if not prompt_id:
                    raise RuntimeError("[DiffusionService] ComfyUI 응답에 prompt_id 없음")

            # polling
            outputs = {}
            for _ in range(300):
                async with session.get(f"{self.COMFY_API}/history/{prompt_id}") as hist_res:
                    if hist_res.status != 200:
                        raise RuntimeError(f"[DiffusionService] 히스토리 조회 실패: {await hist_res.text()}")
                    data = await hist_res.json()
                    if prompt_id not in data:
                        await asyncio.sleep(1)
                        continue
                    prompt_data_block = data[prompt_id]
                    outputs = prompt_data_block.get("outputs", {})
                    if self.OUTPUT_NODE_ID in outputs and outputs[self.OUTPUT_NODE_ID]:
                        break
                await asyncio.sleep(1)
            else:
                raise RuntimeError("[DiffusionService] 출력 이미지 없음")

            # 결과 노드 정보 파싱
            output_node_data = outputs.get(self.OUTPUT_NODE_ID)
            img_info = output_node_data[0] if isinstance(output_node_data, list) else output_node_data
            if not img_info or "images" not in img_info or not img_info["images"]:
                raise RuntimeError("[DiffusionService] 이미지 정보가 비어있습니다.")

            filename = img_info["images"][0].get("filename")
            subfolder = img_info["images"][0].get("subfolder", "")
            if not filename:
                filename = f"generated_{int(time.time())}.png"

            full_path = self.OUTPUT_DIR / subfolder / filename

            if not full_path.exists():
                candidates = list(self.OUTPUT_DIR.rglob("*.png"))
                if candidates:
                    candidates.sort(key=lambda f: f.stat().st_mtime, reverse=True)
                    full_path = candidates[0]
                else:
                    raise RuntimeError(
                        f"[DiffusionService] ComfyUI 응답은 있었지만 파일이 존재하지 않습니다.\n"
                        f"예상 파일: {full_path}"
                    )

            # 이미지 메모리 로드 후 bytes로 반환 (S3 업로드용)
            with Image.open(full_path) as image:
                buf = BytesIO()
                image.save(buf, format="PNG")
                buf.seek(0)
                return buf.read()
