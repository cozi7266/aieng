from openai import AsyncOpenAI
from app.config import settings
import re

class GPTService:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL
        )

    async def generate_sentence(self, word: str, max_attempts: int = 3) -> str:
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
                        "content":
                            f"'{word}' 라는 영어 단어를 활용하여 아이가 이해하기 쉬운 영어 문장을 하나 만들어주세요. "
                            "문장은 간단한 어휘로 구성하고, 문법 구조는 명확하게 해주세요 (예: 주어 + 동사 + 보어). "
                            "문장의 길이는 4~7단어 사이여야 합니다. "
                            "항상 같은 문장 구조를 반복하지 말고, 다양한 방식으로 표현해주세요. "
                            "단어의 의미를 쉽게 유추할 수 있도록 간단한 수식어나 설명을 포함할 수 있습니다. "
                            "출력은 오직 영어 문장 1개만, 문장 부호 포함해서 출력해주세요. 설명이나 해석은 제외해주세요."
                            "학습에 부적절한 문장이라면 \"부적절한 문장입니다.\" 라고 출력해주세요."
                    }
                ],
                max_tokens=100,
                stream=False
            )

            sentence = response.choices[0].message.content.strip()
            
            if self.is_sentence_appropriate(sentence):
                return sentence
            else:
                print(f"[GPTService] 부적절한 문장 감지 (attempt {attempt+1}): {sentence}")

        raise ValueError("적절한 문장을 생성하지 못했습니다.")


    def is_sentence_appropriate(self, sentence: str) -> bool:
        # 마침표로 끝나는지
        if not sentence.strip().endswith("."):
            return False

        # 단어 수 체크 (단순 공백 split)
        words = sentence.strip().split()
        if len(words) < 4 or len(words) > 7:
            return False

        # 특수기호 포함 여부
        if re.search(r"[!@#$%^&*_=+~<>]", sentence):
            return False

        # 비속어 필터 (필요시 확장)
        if re.search(r"\b(damn|hell|stupid|hate|ugly|kill|fuck)\b", sentence.lower()):
            return False

        return True
