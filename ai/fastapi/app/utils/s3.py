# utils/s3.py
import boto3
from app.config import settings

class S3Client:
    def __init__(self):
        self.client = boto3.client(
            "s3",
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION,
        )

    def upload(self, file: bytes, filename: str) -> str:
        self.client.put_object(Bucket=settings.S3_BUCKET_NAME, Key=filename, Body=file)
        return f"https://{settings.S3_BUCKET_NAME}.s3.{settings.S3_REGION}.amazonaws.com/{filename}"
