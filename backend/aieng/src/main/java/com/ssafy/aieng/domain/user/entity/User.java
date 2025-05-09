package com.ssafy.aieng.domain.user.entity;

import com.ssafy.aieng.domain.user.enums.Provider;
import com.ssafy.aieng.global.common.Entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;


@Entity
@Table(name = "user")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@SQLDelete(sql = "UPDATE user SET deleted_at = DATE_ADD(NOW(), INTERVAL 9 HOUR) WHERE id = ?")
public class User extends BaseEntity {

    @Column(length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private Provider provider;

    @Column(length = 150, nullable = false)
    private String providerId;

    @Column(length = 20, nullable = false)
    private String nickname;

    public void markAsDeleted() {
        if (isAlreadyDeleted()) {
            throw new IllegalStateException("이미 탈퇴한 사용자입니다.");
        }
        softDelete();
    }
}
