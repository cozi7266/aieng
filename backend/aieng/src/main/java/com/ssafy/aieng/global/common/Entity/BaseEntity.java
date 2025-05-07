package com.ssafy.aieng.global.common.Entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
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

    @Column(nullable = false, updatable = false)
    protected LocalDateTime createdAt;

    @Column(nullable = false)
    protected LocalDateTime updatedAt;

    @Column
    protected LocalDateTime deletedAt;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    protected boolean deleted;

    protected void softDelete() {
        this.deleted = true;
        this.deletedAt = LocalDateTime.now();
    }

    protected boolean isAlreadyDeleted() {
        return this.deleted || this.deletedAt != null;
    }

}
