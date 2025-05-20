import re
import json
from openai import AsyncOpenAI
from app.config import settings
from app.utils.logger import logger


class GPTService:
    def __init__(self, redis=None):
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL
        )
        self.redis = redis

    async def generate_sentence(
        self,
        user_id: int,
        session_id: int,
        word: str,
        theme: str,
        max_attempts: int = 3
    ) -> tuple[str, str, str]:
        previous_sentences = []

        # 1. Redis에서 이전 문장 조회
        try:
            pattern = f"Learning:user:{user_id}:session:{session_id}:word:*"
            keys = sorted(self.redis.keys(pattern))
            for key in keys:
                raw = self.redis.get(key)
                if raw:
                    data = json.loads(raw)
                    sentence = data.get("sentence")
                    if sentence:
                        previous_sentences.append(sentence)
            logger.info(f"[GPTService] Redis에서 문장 {len(previous_sentences)}개 조회됨")
        except Exception as e:
            logger.warning(f"[GPTService] Redis 조회 실패: {e}")

        # 2. 프롬프트 구성
        user_content = self.build_prompt(word, theme, previous_sentences)

        # 3. GPT 호출 시도
        for attempt in range(max_attempts):
            try:
                response = await self.client.chat.completions.create(
                    model="gpt-4.1-mini",
                    messages=[
                        {
                            "role": "system",
                            "content": "당신은 영어를 처음 배우는 7~8세 한국 어린이를 위한 영어 선생님입니다."
                        },
                        {
                            "role": "user",
                            "content": user_content
                        }
                    ],
                    max_tokens=200,
                    stream=False
                )
                full_output = response.choices[0].message.content.strip()
                lines = full_output.splitlines()

                if len(lines) < 3:
                    logger.warning(f"[GPTService] 응답 형식 오류 (줄 수 부족): {full_output}")
                    continue

                sentence_en = lines[0].strip()
                sentence_ko = lines[1].strip()
                image_prompt = lines[2].strip()

                if self.is_sentence_appropriate(sentence_en):
                    logger.info(f"[GPTService] 문장 생성 성공: '{sentence_en}'")
                    return sentence_en, sentence_ko, image_prompt
                else:
                    logger.warning(f"[GPTService] 부적절한 문장 감지 (시도 {attempt + 1}): {sentence_en}")

            except Exception as e:
                logger.error(f"[GPTService] GPT 호출 실패 (시도 {attempt + 1}): {e}")

        raise ValueError("적절한 문장을 생성하지 못했습니다.")

    def build_prompt(self, word: str, theme: str, previous_sentences: list[str]) -> str:
        base_instruction = (
            "당신은 영어를 처음 배우는 7~8세 한국 아동을 위한 영어 선생님입니다.\n"
            f"이번 학습 단어는 '{word}'이고, 메인 테마는 '{theme}'입니다.\n"
            "이 단어를 포함한 간단한 영어 문장을 만들어주세요. 다음 조건을 지켜주세요:\n"
            "- 문장은 4~7단어로 구성합니다.\n"
            "- 다양한 문형을 사용하고, 주어/동사/형용사 등 표현 방식도 다양화해주세요.\n"
            "- 단어가 다의어일 경우, 주어진 테마에 맞는 의미로 문장에 사용해주세요.\n"
            "- 문장 끝에는 반드시 문장 부호를 포함해주세요.\n"
            "- 문장이 부적절하거나 아동에게 맞지 않다면 '부적절한 문장입니다.' 라고 출력해주세요.\n"
            "- 출력 형식은 아래와 같아야 합니다:\n"
            "  영어 문장\n"
            "  그 문장의 자연스러운 한국어 번역\n"
            "  해당 문장을 시각적으로 묘사한 영어 이미지 프롬프트 (예: A child holding a red apple)\n"
        )

        if previous_sentences:
            joined = "\n".join(f"{i+1}. {s}" for i, s in enumerate(previous_sentences))
            base_instruction += (
                "\n이전에 학습한 문장들은 다음과 같습니다:\n"
                f"{joined}\n\n"
                "이전 문장과 겹치지 않도록 문장 구조와 표현을 변경해주세요.\n"
                "이전 문장들에서 입력 단어가 수식되어 있으면 이번 문장에서도 입력 단어를 수식하고, 그렇지 않으면 수식하지 않도록 하세요.\n"
                "입력된 단어들은 문장내에서 같은 위치에 있어야 합니다. (주어, 목적어, 수식어 등)\n"
                "이전 문장에 사용된 단어를 그대로 반복하지 마세요. 단어의 품사나 역할이 비슷한게 좋습니다.\n"
                "의미적으로도 이전 문장과 연결되도록 해주세요 (예: 모두 동물, 모두 색깔, 모두 움직임 등).\n"
            )

        base_instruction += (
            "\n예시:\n"
            "I love apples.\n"
            "나는 사과를 좋아해요.\n"
            "A smiling child holding a red apple in a sunny park."
        )

        return base_instruction

    def is_sentence_appropriate(self, sentence: str) -> bool:
        words = sentence.strip().split()
        if len(words) < 4 or len(words) > 7:
            return False

        if re.search(r"[@#$%^&*_=+~<>]", sentence):
            return False

        if "부적절한 문장입니다" in sentence:
            return False

        return True

    async def generate_lyrics(self, sentences: list[str]) -> tuple[str, str, str]:
        prompt = (
            "당신은 7~8세 어린이를 위한 영어 동요 작사가이자 번역가입니다. \n"
            "다음 조건을 반드시 지켜서 동요 가사를 만들어주세요: \n"

            "1. 주어진 sentence 목록의 내용을 바탕으로 문장 순서에 따라 이야기가 자연스럽게 전개되도록 가사를 구성할 것. \n"
            "2. 학습한 핵심 단어(명사, 동사 등)가 반복되도록 하여 아이들의 단어 학습 효과를 높일 것. \n"
            "3. 짧고 단순한 문장 구조를 사용할 것. 문장은 현재형 위주로 작성하고 문법적으로 명확하게. \n"
            "4. 전체 가사는 밝고 경쾌한 분위기로, 아이들이 따라 부르기 쉽도록 운율과 리듬을 고려할 것. \n"
            "5. 반복되는 코러스(후렴)를 포함시키되, 주된 단어를 강조하는 방식으로 작성할 것. \n"
            "6. 이모지나 특수기호는 절대 포함하지 말 것. \n"
            "7. 아이들의 발음 연습을 위해 간단하고 다양한 동작 요소를 가사에 자연스럽게 넣으면 좋음.\n"
            "8. 전체 가사의 구조는 [Chorus] + [Post-Chorus] + [Verse 2] + [Pre-Chorus] + [Chorus] + [Post-Chorus] 구조 정도로 제한할 것 (1분 30초의 노래 길이에 맞도록 너무 길지 않게).\n\n"
            "그 후, 해당 영어 가사에 대하여 문맥이 자연스럽고 구어체적인 한국어 번역을 함께 제공해주세요.\n\n"
            "노래의 제목은 주어진 sentence와 가사를 요약할 수 있는 짧고 함축적인 제목이 좋습니다.\n\n"
            "출력은 반드시 아래 JSON 형식으로 해주세요. 설명 없이 JSON만 출력해야 합니다:\n"
            "{\n"
            "  \"title\": \"노래 제목\",\n"
            "  \"english_lyrics\": \"영어 가사 내용\",\n"
            "  \"korean_translation\": \"한국어 번역 내용\"\n"
            "}\n\n"
            "문장 목록:\n" + "\n".join(sentences)
        )

        response = await self.client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "당신은 유아용 영어 노래를 만드는 작사가이자 번역가입니다."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=700,
            stream=False
        )

        content = response.choices[0].message.content.strip()

        try:
            data = json.loads(content)
            title = data["title"].strip()
            lyrics_en = data["english_lyrics"].strip()
            lyrics_ko = data["korean_translation"].strip()
            return title, lyrics_en, lyrics_ko
        except Exception as e:
            logger.error(f"[GPTService] JSON 파싱 실패: {e}\n응답 내용:\n{content}")
            raise ValueError("가사 응답이 JSON 형식을 따르지 않았습니다.")