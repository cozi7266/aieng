package com.ssafy.aieng.domain.learning.entity;

import com.ssafy.aieng.domain.session.entity.Session;
import com.ssafy.aieng.domain.word.entity.Word;
import com.ssafy.aieng.global.common.Entity.BaseEntity;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "learning")
public class Learning extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

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
} 