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
VALUES (1, NOW(), NOW(), false, '동물', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/theme/animal.jpg', 3);

-- Mood 더미 데이터
INSERT INTO mood (id, name, created_at, updated_at, deleted) VALUES
(1, '행복한', NOW(), NOW(), false),
(2, '신나는', NOW(), NOW(), false),
(3, '잔잔한', NOW(), NOW(), false),
(4, '슬픈', NOW(), NOW(), false);

-- Voice 더미 데이터 (사용자 등록 목소리)
INSERT INTO voice (id, child_id, name, description, audio_url, created_at, updated_at, deleted) VALUES
(1, 1, '내 목소리', '아이의 밝고 명랑한 목소리입니다.', 'https://example.com/voice1.mp3', NOW(), NOW(), false),
(2, 1, '엄마 목소리', '엄마의 차분하고 부드러운 목소리입니다.', 'https://example.com/voice2.mp3', NOW(), NOW(), false),
(3, 2, '아빠 목소리', '아빠의 활기차고 에너지 넘치는 목소리입니다.', 'https://example.com/voice3.mp3', NOW(), NOW(), false);

-- Voice 더미 데이터 (기본 목소리)
INSERT INTO voice (id, child_id, name, description, audio_url, created_at, updated_at, deleted) VALUES
(4, NULL, '밝은 AI 목소리', '밝고 명랑한 AI 기본 목소리입니다.', 'https://example.com/default-voice1.mp3', NOW(), NOW(), false),
(5, NULL, '차분한 AI 목소리', '차분하고 부드러운 AI 기본 목소리입니다.', 'https://example.com/default-voice2.mp3', NOW(), NOW(), false),
(6, NULL, '동화구연 AI 목소리', '동화를 들려주는 듯한 따뜻한 AI 기본 목소리입니다.', 'https://example.com/default-voice3.mp3', NOW(), NOW(), false);

-- 단어
INSERT INTO word (id, created_at, updated_at, deleted, theme_id, word_ko, word_en, img_url, tts_url)
VALUES
    (1, NOW(), NOW(), false, 1, '고양이', 'cat', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/cat.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/cat.mp3'),
    (2, NOW(), NOW(), false, 1, '강아지', 'dog', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/dog.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/dog.mp3'),
    (3, NOW(), NOW(), false, 1, '토끼', 'rabbit', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/rabbit.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/rabbit.mp3');

-- 학습 세션
INSERT INTO session (id, created_at, updated_at, deleted, child_id, theme_id, started_at, finished_at, word_count)
VALUES (1, NOW(), NOW(), false, 1, 1, NOW(), NOW(), 3),
       (2, NOW(), NOW(), false, 1, 1, NOW(), NOW(), 3);

-- 학습 기록
INSERT INTO learning (id, created_at, updated_at, deleted, session_id, word_id, learned, learned_at, sentence, img_url, tts_url)
VALUES
    (1, NOW(), NOW(), false, 1, 1, true, NOW(), '고양이를 봤어요', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/cat.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/cat.mp3'),
    (2, NOW(), NOW(), false, 1, 2, true, NOW(), '강아지를 봤어요', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/dog.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/dog.mp3');

-- Storybook 더미 데이터
INSERT INTO storybook (id, created_at, updated_at, deleted, child_id, cover_url, title, description)
VALUES 
    (1, NOW(), NOW(), false, 1, 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/storybook/cover1.jpg', '봄날의 이야기', '아이들과 함께하는 즐거운 봄날의 모험'),
    (2, NOW(), NOW(), false, 1, 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/storybook/cover2.jpg', '별들의 이야기', '밤하늘의 반짝이는 별들과 함께하는 모험');

-- Song 더미 데이터
INSERT INTO custom_song (id, created_at, updated_at, deleted, storybook_id, voice_id, mood_id, title, lyric, description, song_url, status) 
VALUES 
    (1, NOW(), NOW(), false, 1, 1, 1, '즐거운 봄날', '파란 하늘 아래서\n새싹들이 자라나고\n따뜻한 봄바람 불어와요', '봄의 생동감을 표현한 밝은 분위기의 동요입니다', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/songs/song1.mp3', 'COMPLETED'),
    (2, NOW(), NOW(), false, 1, 2, 2, '별들의 노래', '반짝반짝 작은 별\n아름답게 빛나네\n밤하늘을 비추며', '밤하늘의 별들을 표현한 잔잔한 동요입니다', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/songs/song2.mp3', 'COMPLETED'),
    (3, NOW(), NOW(), false, 2, 1, 3, '행복한 하루', '아침에 일어나서\n친구들과 놀아요\n즐거운 하루가 시작됐죠', '하루의 즐거움을 표현한 신나는 동요입니다', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/songs/song3.mp3', 'COMPLETED');


