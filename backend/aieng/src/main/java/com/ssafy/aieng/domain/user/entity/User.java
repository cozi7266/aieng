package com.ssafy.aieng.domain.user.entity;

import com.ssafy.aieng.domain.user.enums.Gender;
import com.ssafy.aieng.domain.user.enums.Provider;
import com.ssafy.aieng.global.common.Entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.springframework.data.annotation.LastModifiedDate;


import java.time.LocalDateTime;

@Entity
@Table(name = "user")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@SQLDelete(sql = "UPDATE user SET deleted_at = DATE_ADD(NOW(), INTERVAL 9 HOUR) WHERE id = ?")
//@Where(clause = "deleted_at IS NULL")
public class User extends BaseEntity {

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Provider provider;

    @Column(name = "provider_id", nullable = false)
    private String providerId;

    @Column(name = "archetype", nullable = false)
    private String archeType;

    @Column(length = 50)
    private String nickname;

    @Column
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(length = 10)
    private String birthdate;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "profile_url")
    private String profileUrl;



    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void updateGender(Gender gender) {
        this.gender = gender;
    }

    public void updateBirthdate(String birthdate) {
        this.birthdate = birthdate;
    }

    public void updateDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    public void updatedProfileUrl(String profileUrl) { this.profileUrl = profileUrl; }


}
