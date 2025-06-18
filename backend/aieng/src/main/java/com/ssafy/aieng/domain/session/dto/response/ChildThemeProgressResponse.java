package com.ssafy.aieng.domain.session.dto.response;

import com.ssafy.aieng.domain.session.entity.Session;
import com.ssafy.aieng.domain.theme.entity.Theme;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class ChildThemeProgressResponse {

    private Integer themeId;
    private String themeKo;
    private String themeEn;
    private String themeImgUrl;
    private Integer sessionId;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Integer totalWordCount;
    private Integer learnedWordCount;
    private Integer progressRate;
    private boolean isFinished;

    // 세션이 있을 경우, 정적 팩토리 메서드
    public static ChildThemeProgressResponse fromSession(Session session) {
        return ChildThemeProgressResponse.builder()
                .sessionId(session.getId())
                .themeId(session.getTheme().getId())
                .themeKo(session.getTheme().getThemeKo())
                .themeEn(session.getTheme().getThemeEn())
                .themeImgUrl(session.getTheme().getImageUrl())
                .startedAt(session.getStartedAt())
                .finishedAt(session.getFinishedAt())
                .totalWordCount(session.getTotalWordCount())
                .learnedWordCount(session.getLearnedWordCount())
                .progressRate(session.getProgressRate())
                .isFinished(session.getFinishedAt() != null)
                .build();
    }

    // 세션이 없을 경우, 정적 팩토리 메서드
    public static ChildThemeProgressResponse fromThemeOnly(Theme theme) {
        return ChildThemeProgressResponse.builder()
                .themeId(theme.getId())
                .themeKo(theme.getThemeKo())
                .themeEn(theme.getThemeEn())
                .themeImgUrl(theme.getImageUrl())
                .sessionId(null)
                .startedAt(null)
                .finishedAt(null)
                .totalWordCount(6)
                .learnedWordCount(0)
                .progressRate(0)
                .isFinished(false)
                .build();
    }

}
