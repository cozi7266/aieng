-- 유저 더미 데이터
INSERT INTO user (id, created_at, updated_at, deleted_at, deleted, provider, provider_id, nickname)
VALUES
    (1, NOW(), NOW(), NULL, false, 'KAKAO', 'kakao-001', '엄마곰'),
    (2, NOW(), NOW(), NULL, false, 'NAVER', 'naver-002', '아빠곰');

-- 아이 더미 데이터 (부모와 연결)
INSERT INTO child (id, created_at, updated_at, deleted_at, deleted, name, birthdate, gender, parent_id)
VALUES
    (1, NOW(), NOW(), NULL, false, '곰돌이', '2020-03-15', 'M', 1),
    (2, NOW(), NOW(), NULL, false, '아기곰', '2021-08-01', 'F', 2);

-- 테마 더미 데이터
INSERT INTO theme (id, created_at, updated_at, deleted_at, deleted, theme_name, image_url, total_words)
VALUES
    (1, NOW(), NOW(), NULL, false, '과일', 'https://s3.amazonaws.com/aieng-bucket/themes/fruit_theme.png', 20),
    (2, NOW(), NOW(), NULL, false, '동물', 'https://s3.amazonaws.com/aieng-bucket/themes/animal_theme.png', 20),
    (3, NOW(), NOW(), NULL, false, '색깔', 'https://s3.amazonaws.com/aieng-bucket/themes/color_theme.png', 20),
    (4, NOW(), NOW(), NULL, false, '숫자', 'https://s3.amazonaws.com/aieng-bucket/themes/number_theme.png', 20),
    (5, NOW(), NOW(), NULL, false, '가족', 'https://s3.amazonaws.com/aieng-bucket/themes/family_theme.png', 20);

-- 단어 더미 데이터
INSERT INTO word (id, theme_id, word_en, word_ko, img_url, tts_url, created_at, updated_at, deleted_at, deleted)
VALUES
    -- 과일 테마(theme_id: 1) 단어들
    (1, 1, 'apple', '사과', 'https://s3.amazonaws.com/aieng-bucket/words/apple.png', 'https://s3.amazonaws.com/aieng-bucket/words/apple.mp3', NOW(), NOW(), NULL, false),
    (2, 1, 'banana', '바나나', 'https://s3.amazonaws.com/aieng-bucket/words/banana.png', 'https://s3.amazonaws.com/aieng-bucket/words/banana.mp3', NOW(), NOW(), NULL, false),
    (3, 1, 'orange', '오렌지', 'https://s3.amazonaws.com/aieng-bucket/words/orange.png', 'https://s3.amazonaws.com/aieng-bucket/words/orange.mp3', NOW(), NOW(), NULL, false),
    (4, 1, 'grape', '포도', 'https://s3.amazonaws.com/aieng-bucket/words/grape.png', 'https://s3.amazonaws.com/aieng-bucket/words/grape.mp3', NOW(), NOW(), NULL, false),
    (5, 1, 'melon', '멜론', 'https://s3.amazonaws.com/aieng-bucket/words/melon.png', 'https://s3.amazonaws.com/aieng-bucket/words/melon.mp3', NOW(), NOW(), NULL, false),

    -- 동물 테마(theme_id: 2) 단어들
    (6, 2, 'cat', '고양이', 'https://s3.amazonaws.com/aieng-bucket/words/cat.png', 'https://s3.amazonaws.com/aieng-bucket/words/cat.mp3', NOW(), NOW(), NULL, false),
    (7, 2, 'dog', '강아지', 'https://s3.amazonaws.com/aieng-bucket/words/dog.png', 'https://s3.amazonaws.com/aieng-bucket/words/dog.mp3', NOW(), NOW(), NULL, false),
    (8, 2, 'bird', '새', 'https://s3.amazonaws.com/aieng-bucket/words/bird.png', 'https://s3.amazonaws.com/aieng-bucket/words/bird.mp3', NOW(), NOW(), NULL, false),
    (9, 2, 'rabbit', '토끼', 'https://s3.amazonaws.com/aieng-bucket/words/rabbit.png', 'https://s3.amazonaws.com/aieng-bucket/words/rabbit.mp3', NOW(), NOW(), NULL, false),
    (10, 2, 'bear', '곰', 'https://s3.amazonaws.com/aieng-bucket/words/bear.png', 'https://s3.amazonaws.com/aieng-bucket/words/bear.mp3', NOW(), NOW(), NULL, false),

    -- 색깔 테마(theme_id: 3) 단어들
    (11, 3, 'red', '빨간색', 'https://s3.amazonaws.com/aieng-bucket/words/red.png', 'https://s3.amazonaws.com/aieng-bucket/words/red.mp3', NOW(), NOW(), NULL, false),
    (12, 3, 'blue', '파란색', 'https://s3.amazonaws.com/aieng-bucket/words/blue.png', 'https://s3.amazonaws.com/aieng-bucket/words/blue.mp3', NOW(), NOW(), NULL, false),
    (13, 3, 'yellow', '노란색', 'https://s3.amazonaws.com/aieng-bucket/words/yellow.png', 'https://s3.amazonaws.com/aieng-bucket/words/yellow.mp3', NOW(), NOW(), NULL, false),
    (14, 3, 'green', '초록색', 'https://s3.amazonaws.com/aieng-bucket/words/green.png', 'https://s3.amazonaws.com/aieng-bucket/words/green.mp3', NOW(), NOW(), NULL, false),
    (15, 3, 'purple', '보라색', 'https://s3.amazonaws.com/aieng-bucket/words/purple.png', 'https://s3.amazonaws.com/aieng-bucket/words/purple.mp3', NOW(), NOW(), NULL, false),

    -- 가족 테마(theme_id: 4) 단어들
    (16, 4, 'mother', '엄마', 'https://s3.amazonaws.com/aieng-bucket/words/mother.png', 'https://s3.amazonaws.com/aieng-bucket/words/mother.mp3', NOW(), NOW(), NULL, false),
    (17, 4, 'father', '아빠', 'https://s3.amazonaws.com/aieng-bucket/words/father.png', 'https://s3.amazonaws.com/aieng-bucket/words/father.mp3', NOW(), NOW(), NULL, false),
    (18, 4, 'sister', '언니/누나', 'https://s3.amazonaws.com/aieng-bucket/words/sister.png', 'https://s3.amazonaws.com/aieng-bucket/words/sister.mp3', NOW(), NOW(), NULL, false),
    (19, 4, 'brother', '오빠/형', 'https://s3.amazonaws.com/aieng-bucket/words/brother.png', 'https://s3.amazonaws.com/aieng-bucket/words/brother.mp3', NOW(), NOW(), NULL, false),
    (20, 4, 'baby', '아기', 'https://s3.amazonaws.com/aieng-bucket/words/baby.png', 'https://s3.amazonaws.com/aieng-bucket/words/baby.mp3', NOW(), NOW(), NULL, false);

-- 학습 세션 더미 데이터
INSERT INTO session (id, child_id, theme_id, started_at, finished_at, word_count, created_at, updated_at, deleted_at, deleted)
VALUES
    -- 곰돌이(child_id: 1)의 과일 테마(theme_id: 1) 학습 세션
    (1, 1, 1, '2024-02-08 10:00:00', '2024-02-08 10:30:00', 5, NOW(), NOW(), NULL, false);

-- 학습 더미 데이터 (id는 자동 생성)
INSERT INTO learning (session_id, word_id, sentence, tts_url, img_url, learned_at, learned, created_at, updated_at, deleted_at, deleted)
VALUES
    -- 곰돌이의 과일 테마 학습 (세션 1) - 모든 단어를 학습 완료한 상태
    (1, 1, 'The apple is red.', 'https://s3.amazonaws.com/aieng-bucket/tts/apple_sentence.mp3', 'https://s3.amazonaws.com/aieng-bucket/images/apple_learning.png', '2024-02-08 10:05:00', true, NOW(), NOW(), NULL, false),
    (1, 2, 'The banana is yellow.', 'https://s3.amazonaws.com/aieng-bucket/tts/banana_sentence.mp3', 'https://s3.amazonaws.com/aieng-bucket/images/banana_learning.png', '2024-02-08 10:10:00', true, NOW(), NOW(), NULL, false),
    (1, 3, 'The orange is juicy.', 'https://s3.amazonaws.com/aieng-bucket/tts/orange_sentence.mp3', 'https://s3.amazonaws.com/aieng-bucket/images/orange_learning.png', '2024-02-08 10:15:00', true, NOW(), NOW(), NULL, false),
    (1, 4, 'The grape is purple.', 'https://s3.amazonaws.com/aieng-bucket/tts/grape_sentence.mp3', 'https://s3.amazonaws.com/aieng-bucket/images/grape_learning.png', '2024-02-08 10:20:00', true, NOW(), NOW(), NULL, false),
    (1, 5, 'The melon is sweet.', 'https://s3.amazonaws.com/aieng-bucket/tts/melon_sentence.mp3', 'https://s3.amazonaws.com/aieng-bucket/images/melon_learning.png', '2024-02-08 10:25:00', true, NOW(), NOW(), NULL, false);

-- learning_storybook 더미 데이터 (학습과 그림책 연결)
INSERT INTO learning_storybook (learning_id, storybook_id, `order`, created_at, updated_at, deleted_at, deleted)
VALUES
    -- 과일 테마 학습을 그림책과 연결 (learning_id는 자동 생성된 ID를 사용해야 함)
    (1, 2, 1, NOW(), NOW(), NULL, false),  -- apple 학습을 1페이지로
    (2, 2, 2, NOW(), NOW(), NULL, false);  -- banana 학습을 2페이지로

-- 그림책 더미 데이터
INSERT INTO storybook (id, child_id, cover_url, title, description, created_at, updated_at, deleted_at, deleted)
VALUES
    -- 곰돌이의 동물 테마 그림책
    (2, 1, 'https://s3.amazonaws.com/aieng-bucket/storybooks/animals_cover.png', '동물 친구들', '귀여운 동물들과 함께하는 영어 공부', NOW(), NOW(), NULL, false),
    -- 아기곰의 색깔 테마 그림책
    (3, 2, 'https://s3.amazonaws.com/aieng-bucket/storybooks/colors_cover.png', '알록달록 색깔놀이', '다양한 색깔을 영어로 배워요', NOW(), NOW(), NULL, false);

-- Voice 더미 데이터
INSERT INTO voice (id, child_id, name, description, audio_url, created_at, updated_at, deleted_at, deleted)
VALUES
    (1, 1, '맑은 목소리', '깨끗하고 또렷한 목소리입니다.', 'https://s3.amazonaws.com/aieng-bucket/voices/clear_voice.mp3', NOW(), NOW(), NULL, false),
    (2, 1, '귀여운 목소리', '아기자기한 느낌의 목소리입니다.', 'https://s3.amazonaws.com/aieng-bucket/voices/cute_voice.mp3', NOW(), NOW(), NULL, false),
    (3, 2, '밝은 목소리', '활기찬 느낌의 목소리입니다.', 'https://s3.amazonaws.com/aieng-bucket/voices/bright_voice.mp3', NOW(), NOW(), NULL, false);




