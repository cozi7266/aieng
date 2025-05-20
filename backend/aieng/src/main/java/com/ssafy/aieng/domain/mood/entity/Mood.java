package com.ssafy.aieng.domain.mood.entity;

import com.ssafy.aieng.global.common.entity.BaseEntity;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "mood")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Mood extends BaseEntity {

    @Column(name = "name", length = 50, nullable = false)
    private String name;

    @Builder
    public Mood(String name) {
        this.name = name;
    }
} 