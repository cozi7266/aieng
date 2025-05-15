package com.ssafy.aieng.domain.session.dto.response;

import com.ssafy.aieng.domain.session.entity.Session;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class SessionResponse {

    private Integer sessionId;
    private String childName;
    private Integer themeId;
    private String themeName;
    private String themeImgUrl;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Integer totalWordCount;
    private Integer learnedWordCount;
    private Integer progressRate;
    private boolean isFinished;

    // 정적 팩토리 메서드
    public static SessionResponse of(Session session) {
        return SessionResponse.builder()
                .sessionId(session.getId())
                .childName(session.getChild().getName())
                .themeId(session.getTheme().getId())
                .themeName(session.getTheme().getThemeName())
                .themeImgUrl(session.getTheme().getImageUrl())
                .startedAt(session.getStartedAt())
                .finishedAt(session.getFinishedAt())
                .totalWordCount(session.getTotalWordCount())
                .learnedWordCount(session.getLearnedWordCount())
                .progressRate(session.getProgressRate())
                .isFinished(session.getFinishedAt() != null)
                .build();
    }
}
