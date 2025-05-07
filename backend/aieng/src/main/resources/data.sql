-- 유저 더미 데이터
INSERT INTO user (id, created_at, updated_at, deleted_at, deleted, provider, provider_id, nickname)
VALUES
    (1, NOW(), NOW(), NULL, false, 'KAKAO', 'kakao-001', '엄마곰'),
    (2, NOW(), NOW(), NULL, false, 'NAVER', 'naver-002', '아빠곰');

-- 아이 더미 데이터
INSERT INTO child (id, created_at, updated_at, deleted_at, deleted, name, birthdate, gender)
VALUES
    (1, NOW(), NOW(), NULL, false, '곰돌이', '2020-03-15', 'M'),
    (2, NOW(), NOW(), NULL, false, '아기곰', '2021-08-01', 'F');
