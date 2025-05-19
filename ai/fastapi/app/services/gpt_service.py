import re
import json
from openai import AsyncOpenAI
from app.config import settings
from app.utils.logger import logger


class GPTService:
    def __init__(self, client: AsyncOpenAI = None, redis=None):
        try:
            if client:
                self.client = client
                logger.info("GPT 클라이언트 인스턴스 주입 완료")
            else:
                logger.info("GPT 클라이언트 초기화 중...")
                self.client = AsyncOpenAI(
                    api_key=settings.OPENAI_API_KEY,
                    base_url=settings.OPENAI_BASE_URL
                )
                logger.info("GPT 클라이언트 초기화 완료")

            self.redis = redis
            logger.info("Redis 인스턴스 주입 완료 (GPTService)")

            if not settings.OPENAI_API_KEY:
                raise ValueError("OpenAI API 키가 설정되지 않았습니다.")

            logger.info("GPTService 초기화 완료")

        except Exception as e:
            logger.error(f"GPTService 초기화 실패: {e}")
            raise RuntimeError("GPTService 초기화 중 오류 발생") from e

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
                    max_tokens=300,
                    stream=False
                )

                content = response.choices[0].message.content.strip()

                try:
                    data = json.loads(content)
                    sentence_en = data["sentence_en"].strip()
                    sentence_ko = data["sentence_ko"].strip()
                    image_prompt = data["image_prompt"].strip()
                except Exception as e:
                    logger.error(f"[GPTService] JSON 파싱 실패: {e}\n응답 내용:\n{content}")
                    continue

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
            "출력은 아래 JSON 형식만 출력하세요. 설명 없이 JSON만 반환하세요:\n\n"
            "{\n"
            "  \"sentence_en\": \"영어 문장\",\n"
            "  \"sentence_ko\": \"자연스러운 한국어 번역\",\n"
            "  \"image_prompt\": \"영어 문장을 시각적으로 묘사한 프롬프트\"\n"
            "}\n"
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

    async def generate_lyrics(self, sentences: list[str]) -> tuple[str, str]:
        prompt = (
            "당신은 7~8세 어린이를 위한 영어 동요 작사가이자 번역가입니다.\n"
            "아래에 제시된 5개의 영어 문장을 바탕으로 반복적이고 따라 부르기 쉬운 영어 가사를 만들어주세요.\n"
            "그 후, 해당 가사의 자연스럽고 구어체적인 한국어 번역을 함께 제공해주세요.\n\n"
            "출력은 반드시 아래 JSON 형식으로 해주세요. 설명 없이 JSON만 출력해야 합니다:\n\n"
            "{\n"
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
            lyrics_en = data["english_lyrics"].strip()
            lyrics_ko = data["korean_translation"].strip()
            return lyrics_en, lyrics_ko
        except Exception as e:
            logger.error(f"[GPTService] JSON 파싱 실패: {e}\n응답 내용:\n{content}")
            raise ValueError("가사 응답이 JSON 형식을 따르지 않았습니다.")
