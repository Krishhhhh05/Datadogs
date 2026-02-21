import json
import os
from typing import Any, Dict, Optional
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class BaseAgent:
    def __init__(self, name: str, role: str, model: str = "llama-3.1-8b-instant"):
        self.name = name
        self.role = role
        self.model = model
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.credibility_score = 1.0

    def call_groq(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        response = self.client.chat.completions.create(
            messages=[
                {"role": "system", "content": f"{system_prompt}\n\nIMPORTANT: Your response must be valid JSON only."},
                {"role": "user", "content": user_prompt},
            ],
            model=self.model,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return {"error": "Failed to parse JSON response", "raw_content": content}

    def update_credibility(self, normalized_error: float):
        self.credibility_score = (0.9 * self.credibility_score) + (0.1 * (1.0 - normalized_error))

    def get_info(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "role": self.role,
            "credibility_score": round(self.credibility_score, 4)
        }
