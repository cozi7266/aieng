from pydantic import BaseModel

class SongRequest(BaseModel):
    childId: int
    sessionId: int
    moodName: str
    voiceName: str

class SongResponse(BaseModel):
    songUrl: str
    lyrics: str