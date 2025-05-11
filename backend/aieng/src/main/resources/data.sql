-- (선택) 기존 데이터 삭제
DELETE FROM learning;
DELETE FROM session;
DELETE FROM word;
DELETE FROM theme;
DELETE FROM child;
DELETE FROM user;

-- 부모 유저
INSERT INTO user (id, created_at, updated_at, deleted, nickname, provider_id, provider)
VALUES (1, NOW(), NOW(), false, '엄마곰', 'kakao-123', 'KAKAO');

-- 자녀
INSERT INTO child (id, created_at, updated_at, deleted, name, birthdate, gender, parent_id)
VALUES (1, NOW(), NOW(), false, '하이', '2020-05-01', 'F', 1);

-- 주제 (테마)
INSERT INTO theme (id, created_at, updated_at, deleted, theme_name, image_url, total_words)
VALUES (1, NOW(), NOW(), false, '동물', 'https://example.com/animal.jpg', 3);

-- 단어
INSERT INTO word (id, created_at, updated_at, deleted, theme_id, word_ko, word_en, img_url, tts_url)
VALUES
    (1, NOW(), NOW(), false, 1, '고양이', 'cat', 'https://example.com/cat.jpg', 'https://example.com/cat.mp3'),
    (2, NOW(), NOW(), false, 1, '강아지', 'dog', 'https://example.com/dog.jpg', 'https://example.com/dog.mp3'),
    (3, NOW(), NOW(), false, 1, '토끼', 'rabbit', 'https://example.com/rabbit.jpg', 'https://example.com/rabbit.mp3');

-- 학습 세션
INSERT INTO session (id, created_at, updated_at, deleted, child_id, theme_id, started_at, finished_at, word_count)
VALUES (1, NOW(), NOW(), false, 1, 1, NOW(), NOW(), 3);

-- 학습 기록
INSERT INTO learning (id, created_at, updated_at, deleted, session_id, word_id, learned, learned_at, sentence, img_url, tts_url)
VALUES
    (1, NOW(), NOW(), false, 1, 1, true, NOW(), '고양이를 봤어요', 'https://example.com/cat.jpg', 'https://example.com/cat.mp3'),
    (2, NOW(), NOW(), false, 1, 2, true, NOW(), '강아지를 봤어요', 'https://example.com/dog.jpg', 'https://example.com/dog.mp3');
