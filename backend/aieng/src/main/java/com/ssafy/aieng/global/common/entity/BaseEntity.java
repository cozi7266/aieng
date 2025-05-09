package com.ssafy.aieng.global.common.entity;

import com.ssafy.aieng.global.common.enums.BaseStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@MappedSuperclass
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BaseStatus status = BaseStatus.ACTIVE;

    @Column
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) this.status = BaseStatus.ACTIVE;
    }

    @PreUpdate
    protected void onUpdate() {
        if (this.status == BaseStatus.ACTIVE) {
            this.updatedAt = LocalDateTime.now();
        }
    }

    protected void softDelete() {
        if (this.status == BaseStatus.DELETED) {
            throw new IllegalStateException("삭제 되었습니다.");
        }
        this.status = BaseStatus.DELETED;
        this.deletedAt = LocalDateTime.now();
    }

    protected boolean isAlreadyDeleted() {
        return this.status == BaseStatus.DELETED;
    }
}
