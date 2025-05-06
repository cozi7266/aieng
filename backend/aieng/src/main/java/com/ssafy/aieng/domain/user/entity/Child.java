package com.ssafy.aieng.domain.user.entity;

import com.ssafy.aieng.domain.user.enums.Gender;
import com.ssafy.aieng.global.common.Entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "child")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Child extends BaseEntity {

    @Column(length = 20, nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDateTime birthdate;

    @Column(nullable = false)
    private Gender gender;


}
