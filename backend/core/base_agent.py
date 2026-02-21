import json
import os
from typing import Any, Dict, Optional
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class BaseAgent:
    """
    Base class for all specialized AI agents in the Product Launch OS.
    Handles interaction with the Groq API and tracks agent credibility.
    """

    def __init__(self, name: str, role: str, model: str = "llama-3.3-70b-versatile"):
        """
        Initializes the agent with a name, role, and Groq client.
        
        Args:
            name: Human-readable name of the agent.
            role: The specific domain expertise of the agent.
            model: The Groq model to use (default: llama-3.3-70b-versatile).
        """
        self.name = name
        self.role = role
        self.model = model
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.credibility_score = 1.0  # Initial perfect score

    def call_groq(self, system_prompt: str, user_prompt: str, max_retries: int = 3) -> Dict[str, Any]:
        """
        Calls the Groq API and strictly expects a JSON response.
        Retries up to max_retries times on JSON validation failures.
        """
        import logging
        logger = logging.getLogger(__name__)

        last_error = None
        for attempt in range(max_retries):
            try:
                response = self.client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": f"{system_prompt}\n\nIMPORTANT: Your response must be valid JSON only. Do not include any conversational text before or after the JSON block. Use double quotes for all strings. Do not use single quotes."},
                        {"role": "user", "content": user_prompt},
                    ],
                    model=self.model,
                    response_format={"type": "json_object"},
                )

                content = response.choices[0].message.content
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    logger.warning(f"[{self.name}] JSON parse error on attempt {attempt+1}, retrying...")
                    last_error = "JSON parse error"
                    continue

            except Exception as e:
                error_str = str(e)
                logger.warning(f"[{self.name}] Groq API error on attempt {attempt+1}/{max_retries}: {error_str[:200]}")
                last_error = error_str
                if attempt < max_retries - 1:
                    import time
                    time.sleep(1)  # brief pause before retry
                    continue

        # All retries exhausted — return graceful error instead of crashing
        logger.error(f"[{self.name}] All {max_retries} retries failed. Last error: {str(last_error)[:200]}")
        return {"error": f"{self.name} failed after {max_retries} retries", "agent": self.name}

    def update_credibility(self, normalized_error: float):
        """
        Updates the agent's credibility score post-launch based on prediction accuracy.
        Formula: Score_t = 0.9 * Score_(t-1) + 0.1 * (1 - NormalizedError)
        
        Args:
            normalized_error: A value between 0 and 1 representing the prediction error.
        """
        self.credibility_score = (0.9 * self.credibility_score) + (0.1 * (1.0 - normalized_error))

    def get_info(self) -> Dict[str, Any]:
        """Returns metadata about the agent."""
        return {
            "name": self.name,
            "role": self.role,
            "credibility_score": round(self.credibility_score, 4)
        }
