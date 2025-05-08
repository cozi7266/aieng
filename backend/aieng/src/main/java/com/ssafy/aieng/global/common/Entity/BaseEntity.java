package com.ssafy.aieng.global.common.Entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column
    private LocalDateTime deletedAt;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    private boolean deleted = false;

    protected void softDelete() {
        this.deleted = true;
        this.deletedAt = LocalDateTime.now();
    }

    protected boolean isAlreadyDeleted() {
        return this.deleted || this.deletedAt != null;
    }

    @PrePersist
    public void prePersist() {
        System.out.println("🔥 @PrePersist 실행됨: " + this);
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;
    }
}
