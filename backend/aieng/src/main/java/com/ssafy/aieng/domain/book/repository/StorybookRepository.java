
package com.ssafy.aieng.domain.book.repository;
import com.ssafy.aieng.domain.book.entity.Storybook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StorybookRepository extends JpaRepository<Storybook, Integer> {

    List<Storybook> findAllByChildIdOrderByCreatedAtDesc(Integer childId);
}