import boto3
import botocore.exceptions
from app.config import settings
from app.utils.logger import logger

class S3Client:
    def __init__(self):
        try:
            self.client = boto3.client(
                "s3",
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY,
                region_name=settings.S3_REGION,
            )
            logger.info("S3 클라이언트 초기화 성공")
        except botocore.exceptions.BotoCoreError as e:
            logger.error(f"S3 클라이언트 초기화 실패: {e}")
            raise RuntimeError("S3 클라이언트 생성 실패") from e

    def upload(self, file: bytes, filename: str) -> str:
        try:
            self.client.put_object(Bucket=settings.S3_BUCKET_NAME, Key=filename, Body=file)
            url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.S3_REGION}.amazonaws.com/{filename}"
            logger.info(f"S3 업로드 성공: {filename}")
            return url
        except botocore.exceptions.BotoCoreError as e:
            logger.error(f"S3 업로드 실패: {filename}, 오류: {e}")
            raise RuntimeError("S3 업로드 실패") from e
