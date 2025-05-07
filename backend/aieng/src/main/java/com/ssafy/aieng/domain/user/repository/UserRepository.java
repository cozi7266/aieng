package com.ssafy.aieng.domain.user.repository;

import com.ssafy.aieng.domain.user.entity.User;
import com.ssafy.aieng.domain.user.enums.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // 소셜 로그인 provider와 providerId가 일치하고 탈퇴하지 않은 사용자 정보를 조회합니다.
    Optional<User> findByProviderAndProviderIdAndDeletedAtIsNull(Provider provider, String providerId);

    // 사용자 ID로 사용자 정보를 조회합니다.
    Optional<User> findById(Integer id);

    // 닉네임이 중복되는지(탈퇴하지 않은 사용자 기준) 확인합니다.
    boolean existsByNicknameAndDeletedAtIsNull(String nickname);

    // 회원탈퇴 (Soft Delete)
    void deleteById(Integer id);

    // 닉네임 중복확인
    boolean existsByNickname(String nickname);
}
