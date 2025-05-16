package com.ssafy.aieng.domain.theme.entity;

import com.ssafy.aieng.global.common.entity.BaseEntity;
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

    @Column(name = "theme_en", length = 50, nullable = false, unique = true)
    private String themeEn;

    @Column(name = "theme_ko", length = 50, nullable = false, unique = true)
    private String themeKo;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "total_words", columnDefinition = "TINYINT")
    private Byte totalWords;
}
