from fastapi import FastAPI
from app.routers import words, songs, internal

app = FastAPI(root_path="/fastapi")

app.include_router(words.router, prefix="/words", tags=["Words"])
app.include_router(songs.router, prefix="/songs", tags=["Songs"])
app.include_router(internal.router, prefix="/internal", tags=["Internal"])