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

    @Column(length = 50, nullable = false, unique = true)
    private String themeId;

    @Column(length = 50, nullable = false)
    private String name;

    @Column(nullable = false)
    private String imageUrl;

    @Column(nullable = false)
    private Integer totalWords;

    @Column(nullable = false)
    private Integer completedWords;
} 