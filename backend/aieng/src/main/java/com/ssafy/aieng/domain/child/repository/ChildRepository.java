package com.ssafy.aieng.domain.child.repository;

import com.ssafy.aieng.domain.child.entity.Child;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChildRepository extends JpaRepository<Child, Integer> {

    // 자녀 ID로 삭제되지 않은 그림책을 생성일 기준 내림차순 조회
    Optional<Child> findByUserIdAndId(Integer userId, Integer childId);

    // 세션 ID로 연결된 LearningStorybook이 존재하는지 여부 반환
    boolean existsByIdAndUserId(Integer childId, Integer userId);

    // 세션 ID로 그림책(Storybook) 조회
    List<Child> findAllByUserIdAndDeletedFalse(Integer userId);
}
