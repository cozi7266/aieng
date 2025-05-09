package com.ssafy.aieng.domain.child.entity;

import com.ssafy.aieng.domain.user.entity.User;
import com.ssafy.aieng.domain.user.enums.Gender;
import com.ssafy.aieng.global.common.Entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import java.time.LocalDate;

@Entity
@Table(name =  "child")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)

public class Child extends BaseEntity {

    @Column(length = 20, nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate birthdate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Column(length = 200)
    private String imgUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private User parent;

    // 아이 프로필 수정
    public void updateChildProfile(String name, Gender gender, LocalDate birthdate, String imgUrl) {
        this.name = name;
        this.gender = gender;
        this.birthdate = birthdate;
        this.imgUrl = imgUrl;
    }

    // 아이 프로필 삭제 (Soft Delete)
    public void deleteChildProfile() {
        this.softDelete();
    }
}