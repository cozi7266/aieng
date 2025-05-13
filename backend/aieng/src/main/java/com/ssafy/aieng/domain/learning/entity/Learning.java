package com.ssafy.aieng.domain.learning.entity;

import com.ssafy.aieng.domain.learning.dto.response.GeneratedContentResult;
import com.ssafy.aieng.domain.word.entity.Word;
import com.ssafy.aieng.global.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

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
    @JoinColumn(name = "group_id")
    private SessionGroup sessionGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id", nullable = false)
    private Word word;

    @Column(nullable = true)
    private String sentence;

    @Column(name = "tts_url", nullable = true)
    private String ttsUrl;

    @Column(name = "img_url", nullable = true)
    private String imgUrl;

    @Column(name = "learned_at")
    private LocalDateTime learnedAt;

    @Column(name = "page_order")
    private Integer pageOrder;

    @Column(nullable = false)
    private boolean learned;

    public boolean isLearned() {
        return learned;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    public void setSessionGroup(SessionGroup group) {
        this.sessionGroup = group;
    }

    public void updateContent(GeneratedContentResult result) {
        this.sentence = result.getSentence();
        this.ttsUrl = result.getAudioUrl();
        this.imgUrl = result.getImageUrl();
        this.learned = true;
        this.learnedAt = LocalDateTime.now();
    }

    public static Learning of(Session session, Word word) {
        return Learning.builder()
                .session(session)
                .word(word)
                .learned(false)
                .build();
    }
}
