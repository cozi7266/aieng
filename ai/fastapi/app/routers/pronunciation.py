from fastapi import APIRouter, UploadFile, File, HTTPException
from ..services.pronunciation_service import evaluate_pronunciation
from typing import Dict

router = APIRouter()

@router.post("/evaluate")
async def evaluate_pronunciation_endpoint(
    audio_file: UploadFile = File(...),
    expected_text: str = None
) -> Dict:
    """
    사용자의 영어 발음을 평가합니다.
    
    Args:
        audio_file: 사용자의 음성 파일
        expected_text: 예상되는 텍스트
    
    Returns:
        Dict: 발음 평가 결과
    """
    try:
        result = await evaluate_pronunciation(audio_file, expected_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 