package com.ssafy.aieng.global.service;

import com.ssafy.aieng.global.dto.PresignedUrlDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    public PresignedUrlDto generatePresignedUrl(Integer childId, String contentType, Integer expires) {
        // 파일명 예: voice/{UUID}_{childId}_{timestamp}.m4a
        String extension = contentType != null && contentType.endsWith("wav") ? "wav" : "m4a";
        String fileKey = String.format("voice/%s_%s_%s.%s",
                UUID.randomUUID(), childId, System.currentTimeMillis(), extension);

        // Presigned URL 요청
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileKey)
                .contentType(contentType != null ? contentType : "audio/m4a")
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .putObjectRequest(objectRequest)
                .signatureDuration(Duration.ofSeconds(expires != null ? expires : 300)) // 5분
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

        String presignedUrl = presignedRequest.url().toString();
        String fileUrl = String.format("https://%s.s3.amazonaws.com/%s", bucketName, fileKey);

        return new PresignedUrlDto(presignedUrl, fileUrl);
    }
}
