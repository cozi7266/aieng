from pydantic import BaseModel

class SongRequest(BaseModel):
    user_id: int
    mood: str
    voice: str

class SongResponse(BaseModel):
    song_url: str
    lyrics: str