-- 유저 더미 데이터
INSERT INTO user (id, created_at, updated_at, deleted_at, deleted, provider, provider_id, nickname)
VALUES
    (1, NOW(), NOW(), NULL, false, 'KAKAO', 'kakao-001', '엄마곰'),
    (2, NOW(), NOW(), NULL, false, 'NAVER', 'naver-002', '아빠곰');

-- 아이 더미 데이터 (부모와 연결)
INSERT INTO child (id, created_at, updated_at, deleted_at, deleted, name, birthdate, gender, parent_id)
VALUES
    (1, NOW(), NOW(), NULL, false, '곰돌이', '2020-03-15', 'M', 1),  -- 부모가 엄마곰 (user_id = 1)
    (2, NOW(), NOW(), NULL, false, '아기곰', '2021-08-01', 'F', 1),  -- 부모가 엄마곰 (user_id = 1)
    (3, NOW(), NOW(), NULL, false, '아기곰2', '2022-05-10', 'M', 2);  -- 부모가 아빠곰 (user_id = 2)
