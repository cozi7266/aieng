package com.ssafy.aieng.domain.word.entity;

import com.ssafy.aieng.domain.theme.entity.Theme;
import com.ssafy.aieng.global.common.entity.BaseEntity;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "word")
public class Word extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theme_id", nullable = false)
    private Theme theme;

    @Column(name = "word_en", nullable = false, length = 100)
    private String wordEn;

    @Column(name = "word_ko", nullable = false, length = 50)
    private String wordKo;

    @Column(name = "img_url", nullable = false)
    private String imgUrl;

    @Column(name = "tts_url", nullable = false)
    private String ttsUrl;
} 