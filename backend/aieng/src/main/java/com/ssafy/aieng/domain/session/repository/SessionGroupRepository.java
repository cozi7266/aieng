package com.ssafy.aieng.domain.session.repository;

import com.ssafy.aieng.domain.session.entity.SessionGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionGroupRepository extends JpaRepository<SessionGroup, Integer> {

    Page<SessionGroup> findAllBySessionIdAndDeletedFalse(Integer sessionId, PageRequest pageRequest);
}
