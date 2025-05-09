package com.ssafy.aieng.domain.theme.entity;

import com.ssafy.aieng.global.common.Entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "theme")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Theme extends BaseEntity {

    @Column(name = "theme_id", length = 50, nullable = false, unique = true)
    private String themeId;

    @Column(name = "name", length = 50, nullable = false)
    private String name;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "total_words", columnDefinition = "TINYINT")
    private Byte totalWords;

    @Column(name = "completed_words", columnDefinition = "TINYINT")
    private Byte completedWords;
} 