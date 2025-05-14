package com.ssafy.aieng.domain.child.repository;

import com.ssafy.aieng.domain.child.entity.Child;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChildRepository extends JpaRepository<Child, Integer> {

    // 유저 아이디와 아이 아이디로 아이 프로필 조회
    Optional<Child> findByUserIdAndId(Integer userId, Integer childId);

    // 부모와 이이가 매칭이 맞는지 확인
    boolean existsByIdAndUserId(Integer childId, Integer userId);
}
