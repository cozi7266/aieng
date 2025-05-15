from pydantic import BaseModel

class WordRequest(BaseModel):
    childId: int
    sessionId: int
    wordId: int
    word: str

class WordResponse(BaseModel):
    word: str
    sentence: str
    imageUrl: str
    audioUrl: str
