from pydantic import BaseModel

class WordRequest(BaseModel):
    userId: int
    sessionId: int
    wordEn: str
    theme: str

class WordResponse(BaseModel):
    wordEn: str
    sentence: str
    translation: str
    imagePrompt: str
    imageUrl: str
    audioUrl: str
