-- 유저 더미 데이터
INSERT INTO user (id, created_at, updated_at, deleted_at, deleted, provider, provider_id, nickname)
VALUES
    (1, NOW(), NOW(), NULL, false, 'KAKAO', 'kakao-001', '엄마곰'),
    (2, NOW(), NOW(), NULL, false, 'NAVER', 'naver-002', '아빠곰');

-- 아이 더미 데이터 (부모와 연결)
INSERT INTO child (id, created_at, updated_at, deleted_at, deleted, name, birthdate, gender, parent_id)
VALUES
(1, NOW(), NOW(), NULL, false, '곰돌이', '2020-03-15', 'M', 1),
(2, NOW(), NOW(), NULL, false, '아기곰', '2021-08-01', 'F', 1);


-- 테마 더미 데이터
INSERT INTO theme (id, created_at, updated_at, deleted_at, deleted, theme_id, name, image_url, total_words, completed_words)
VALUES
    (1, NOW(), NOW(), NULL, false, 'fruit', '과일', 'https://s3.amazonaws.com/{bucket_name}/images/fruit_icon.png', 5, 4),
    (2, NOW(), NOW(), NULL, false, 'animal', '동물', 'https://s3.amazonaws.com/{bucket_name}/images/animal_icon.png', 5, 1),
    (3, NOW(), NOW(), NULL, false, 'color', '색깔', 'https://s3.amazonaws.com/{bucket_name}/images/color_icon.png', 5, 2),
    (4, NOW(), NOW(), NULL, false, 'number', '숫자', 'https://s3.amazonaws.com/{bucket_name}/images/number_icon.png', 5, 2),
    (5, NOW(), NOW(), NULL, false, 'family', '가족', 'https://s3.amazonaws.com/{bucket_name}/images/family_icon.png', 5, 2);
