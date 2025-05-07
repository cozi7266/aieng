package com.ssafy.aieng.global.common.Entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Integer id;

    @Builder.Default
    @Column(nullable = false)
    protected LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    protected LocalDateTime updatedAt = LocalDateTime.now();

    @Column
    protected LocalDateTime deletedAt;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    protected boolean deleted = false;

    protected void softDelete() {
        this.deleted = true;
        this.deletedAt = LocalDateTime.now();
    }

    protected boolean isAlreadyDeleted() {
        return this.deleted || this.deletedAt != null;
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
