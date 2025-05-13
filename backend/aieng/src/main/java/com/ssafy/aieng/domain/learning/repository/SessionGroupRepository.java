package com.ssafy.aieng.domain.learning.repository;

import com.ssafy.aieng.domain.learning.entity.SessionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionGroupRepository extends JpaRepository<SessionGroup, Integer> {
}
