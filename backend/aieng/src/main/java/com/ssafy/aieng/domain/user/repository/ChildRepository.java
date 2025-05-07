package com.ssafy.aieng.domain.user.repository;

import com.ssafy.aieng.domain.user.entity.Child;
import com.ssafy.aieng.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChildRepository extends JpaRepository<Child, Integer> {


    Optional<Child> findByParentIdAndId(Integer userId, Integer childId);
}
