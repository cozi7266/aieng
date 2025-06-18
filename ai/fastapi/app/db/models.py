from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class WordRecord(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String(50), unique=True, index=True)
    sentence = Column(String(255))
    image_url = Column(String(255))
    audio_url = Column(String(255))
