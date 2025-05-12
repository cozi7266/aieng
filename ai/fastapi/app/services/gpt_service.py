from openai import AsyncOpenAI
from app.config import settings
import re
import json

class GPTService:
    def __init__(self, redis=None):
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL
        )
        # Redis 인스턴스 저장 (get_client()로 받은 객체)
        self.redis = redis

    async def generate_sentence(
        self,
        word: str,
        child_id: int,
        session_id: str,
        max_attempts: int = 3
    ) -> str:
        # Redis에서 이전 문장 불러오기
        previous_sentences = []
        if self.redis and child_id is not None and session_id is not None:
            pattern = f"word:{child_id}:{session_id}:*"
            keys = sorted(self.redis.keys(pattern))
            for key in keys:
                raw = self.redis.get(key)
                if raw:
                    data = json.loads(raw)
                    sentence = data.get("sentence")
                    if sentence:
                        previous_sentences.append(sentence)

        # 프롬프트 생성
        if not previous_sentences:
            user_content = (
                f"'{word}' 라는 영어 단어를 활용하여 아이가 이해하기 쉬운 영어 문장을 하나 만들어주세요. "
                "문장은 간단한 어휘로 구성하고, 문법 구조는 명확하게 해주세요. "
                "문장의 길이는 4~7단어 사이여야 합니다. "
                "항상 같은 문장 구조를 반복하지 말고, 다양한 방식으로 표현해주세요. "
                "단어의 의미를 쉽게 유추할 수 있도록 간단한 수식어나 설명을 포함할 수 있습니다. "
                "출력은 오직 영어 문장 1개만, 문장 부호 포함해서 출력해주세요. 설명이나 해석은 제외해주세요. "
                "학습에 부적절한 문장이라면 '부적절한 문장입니다.' 라고 출력해주세요."
            )
        else:
            # 이전 문장 리스트를 나열 형태로 구성
            joined = "\n".join(f"{i+1}. {s}" for i, s in enumerate(previous_sentences))
            user_content = (
                "당신은 영어를 처음 배우는 7세 아동을 위한 영어 선생님입니다.\n\n"
                f"이전에 학습한 문장들은 다음과 같습니다:\n{joined}\n\n"
                f"이번에는 '{word}' 라는 단어를 활용하여, 위 문장들과 문법 구조와 표현 방식이 자연스럽게 이어지도록 새로운 문장을 만들어주세요. "
                "이전 문장에서 사용된 문법 구조 (예: 주어 + 동사 + 부사, 주어 + be동사 + 형용사 등)를 참고하되, 주어/동사/형용사는 적절히 새롭게 바꿔주세요. "
                "이전 문장에서 사용된 단어가 수식되어 있으면 이번 문장에서도 입력된 단어를 수식하고, 그렇지 않으면 수식하지 않도록 하세요. "
                "이전 문장에 사용된 단어를 그대로 반복하지 마세요. 단어의 품사나 역할이 비슷하면 좋습니다. "
                "의미적으로도 이전 문장과 연결되도록 해주세요 (예: 모두 동물, 모두 색깔, 모두 움직임 등).\n\n"
                "문장은 4~7단어 사이의 간단한 영어 문장으로 작성하고, 문장 부호를 포함해 출력해주세요. 다른 설명은 절대 포함하지 마세요. "
                "이전 문장의 문장 부호를 유지해주세요. "
                "학습에 부적절한 문장이라면 '부적절한 문장입니다.' 라고 출력해주세요."
            )

        # 최대 N번까지 재시도
        for attempt in range(max_attempts):
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
                max_tokens=100,
                stream=False
            )

            sentence = response.choices[0].message.content.strip()

            # 문장 적절성 검사
            if self.is_sentence_appropriate(sentence):
                return sentence
            else:
                print(f"[GPTService] 부적절한 문장 감지 (attempt {attempt + 1}): {sentence}")

        raise ValueError("적절한 문장을 생성하지 못했습니다.")

    def is_sentence_appropriate(self, sentence: str) -> bool:
        # 마침표로 끝나는지 확인
        # if not sentence.strip().endswith("."):
        #     return False

        # 단어 수 체크 (공백 기준 split)
        words = sentence.strip().split()
        if len(words) < 4 or len(words) > 7:
            return False

        # 특수기호 포함 여부
        if re.search(r"[@#$%^&*_=+~<>]", sentence):
            return False

        # 비속어 필터 (필요시 확장)
        # if re.search(r"\b(damn|hell|stupid|hate|ugly|kill|fuck)\b", sentence.lower()):
        #     return False

        # 명시적 거절 문구 포함 시
        if "부적절한 문장입니다" in sentence:
            return False

        return True
