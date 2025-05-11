package com.ssafy.aieng.domain.learning.entity;

import com.ssafy.aieng.domain.learning.dto.response.GeneratedContentResult;
import com.ssafy.aieng.domain.word.entity.Word;
import com.ssafy.aieng.global.common.entity.BaseEntity;
import lombok.*;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "learning")
public class Learning extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id", nullable = false)
    private Word word;

    @Column(nullable = false)
    private String sentence;

    @Column(name = "tts_url")
    private String ttsUrl;

    @Column(name = "img_url")
    private String imgUrl;

    @Column(name = "learned_at")
    private LocalDateTime learnedAt;

    @Column(nullable = false)
    private boolean learned;

    public static Learning of(Session session, Word word) {
        return Learning.builder()
                .session(session)
                .word(word)
                .sentence(null)
                .ttsUrl(null)
                .imgUrl(null)
                .learned(false)
                .learnedAt(null)
                .build();
    }

} 