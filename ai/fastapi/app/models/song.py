from pydantic import BaseModel

class SongRequest(BaseModel):
    userId: int
    sessionId: int
    moodName: str
    voiceName: str

class SongResponse(BaseModel):
    songUrl: str
    title: str
    lyricsEn: str
    lyricsKo: str