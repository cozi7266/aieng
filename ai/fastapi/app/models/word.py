from pydantic import BaseModel

class WordRequest(BaseModel):
    user_id: int
    word: str

class WordResponse(BaseModel):
    word: str
    sentence: str
    image_url: str
    audio_url: str
