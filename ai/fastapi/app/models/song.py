from pydantic import BaseModel

class SongRequest(BaseModel):
    childId: int
    sessionId: int
    mood: str
    voice: str

class SongResponse(BaseModel):
    songUrl: str
    lyrics: str