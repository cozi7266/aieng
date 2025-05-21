
-- 부모 유저
INSERT INTO user (created_at, updated_at, deleted, nickname, provider_id, provider)
VALUES (NOW(), NOW(), false, '엄마곰', 'kakao-123', 'KAKAO');

-- 자녀
INSERT INTO child (created_at, updated_at, deleted, name, birthdate, gender, user_id)
VALUES(NOW(), NOW(), false, '하이', '2020-05-01', 'F', 1),
        (NOW(), NOW(), false, '하이2', '2019-03-15', 'M', 1),

        ( NOW(), NOW(), false, '하이3', '2021-07-20', 'F', 1);
-- 주제 (테마)
INSERT INTO theme (created_at, updated_at, deleted, theme_en, theme_ko, image_url, total_words)
VALUES
    (NOW(), NOW(), false, 'animal', '동물', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/theme/animal.jpg', 6),
    (NOW(), NOW(), false, 'fruit', '과일', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/theme/fruit.jpg', 7),
    (NOW(), NOW(), false, 'color', '색깔', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/theme/color.jpg', 8);

-- 단어
INSERT INTO word (created_at, updated_at, deleted, theme_id, word_ko, word_en, img_url, tts_url)
VALUES
    (NOW(), NOW(), false, 1, '고양이', 'cat', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/cat.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/cat.mp3'),
    (NOW(), NOW(), false, 1, '강아지', 'dog', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/dog.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/dog.mp3'),
    (NOW(), NOW(), false, 1, '토끼', 'rabbit', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/rabbit.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/rabbit.mp3'),
    (NOW(), NOW(), false, 1, '호랑이', 'tiger', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/tiger.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/tiger.mp3'),
    (NOW(), NOW(), false, 1, '곰', 'bear', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/bear.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/bear.mp3'),
    (NOW(), NOW(), false, 1, '사자', 'lion', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/lion.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/lion.mp3'),
    (NOW(), NOW(), false, 1, '코끼리', 'elephant', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/elephant.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/elephant.mp3'),
    (NOW(), NOW(), false, 1, '여우', 'fox', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/fox.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/fox.mp3'),
    (NOW(), NOW(), false, 1, '늑대', 'wolf', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/wolf.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/wolf.mp3'),
    (NOW(), NOW(), false, 1, '원숭이', 'monkey', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/monkey.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/monkey.mp3'),
    (NOW(), NOW(), false, 1, '기린', 'giraffe', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/giraffe.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/giraffe.mp3'),
    (NOW(), NOW(), false, 1, '코뿔소', 'rhinoceros', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/rhinoceros.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/rhinoceros.mp3'),
    (NOW(), NOW(), false, 1, '하마', 'hippopotamus', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/hippo.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/hippo.mp3'),
    (NOW(), NOW(), false, 1, '악어', 'crocodile', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/crocodile.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/crocodile.mp3'),
    (NOW(), NOW(), false, 1, '펭귄', 'penguin', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/penguin.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/penguin.mp3');


INSERT INTO word (created_at, updated_at, deleted, theme_id, word_ko, word_en, img_url, tts_url)
VALUES
    (NOW(), NOW(), false, 2, '사과', 'apple', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/apple.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/apple.mp3'),
    (NOW(), NOW(), false, 2, '바나나', 'banana', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/banana.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/banana.mp3'),
    (NOW(), NOW(), false, 2, '포도', 'grape', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/grape.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/grape.mp3'),
    (NOW(), NOW(), false, 2, '수박', 'watermelon', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/watermelon.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/watermelon.mp3'),
    (NOW(), NOW(), false, 2, '오렌지', 'orange', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/orange.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/orange.mp3'),
    (NOW(), NOW(), false, 2, '딸기', 'strawberry', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/strawberry.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/strawberry.mp3'),
    (NOW(), NOW(), false, 2, '레몬', 'lemon', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/lemon.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/lemon.mp3'),
    (NOW(), NOW(), false, 2, '복숭아', 'peach', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/peach.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/peach.mp3'),
    (NOW(), NOW(), false, 2, '자두', 'plum', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/plum.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/plum.mp3'),
    (NOW(), NOW(), false, 2, '키위', 'kiwi', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/kiwi.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/kiwi.mp3'),
    (NOW(), NOW(), false, 2, '체리', 'cherry', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/cherry.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/cherry.mp3'),
    (NOW(), NOW(), false, 2, '망고', 'mango', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/mango.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/mango.mp3'),
    (NOW(), NOW(), false, 2, '파인애플', 'pineapple', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/pineapple.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/pineapple.mp3'),
    (NOW(), NOW(), false, 2, '멜론', 'melon', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/melon.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/melon.mp3'),
    (NOW(), NOW(), false, 2, '감', 'persimmon', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/persimmon.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/persimmon.mp3'),
    (NOW(), NOW(), false, 2, '자몽', 'grapefruit', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/word/grapefruit.jpg', 'https://aieng-bucket.s3.ap-northeast-2.amazonaws.com/tts/grapefruit.mp3');