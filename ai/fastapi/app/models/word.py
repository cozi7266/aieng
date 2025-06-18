from pydantic import BaseModel
from typing import Optional

class WordRequest(BaseModel):
    userId: int
    sessionId: int
    wordEn: str
    theme: str
    ttsVoiceUrl: Optional[str] = None  # Zonos (커스텀 보이스)

class WordResponse(BaseModel):
    wordEn: str
    sentence: str
    translation: str
    imagePrompt: str
    imageUrl: str
    audioUrl: str
