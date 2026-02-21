import json
import os
from typing import Any, Dict, Optional
import anthropic
import braintrust
from dotenv import load_dotenv

load_dotenv()

class BaseAgent:
    """
    Base class for all specialized AI agents in the Product Launch OS.
    Handles interaction with the Anthropic Claude API and tracks agent credibility.
    """

    def __init__(self, name: str, role: str, model: str = "claude-sonnet-4-20250514"):
        """
        Initializes the agent with a name, role, and Anthropic client.

        Args:
            name: Human-readable name of the agent.
            role: The specific domain expertise of the agent.
            model: The Claude model to use (default: claude-sonnet-4-20250514).
        """
        self.name = name
        self.role = role
        self.model = model
        self.client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.credibility_score = 1.0  # Initial perfect score

    @braintrust.traced(name="agent_call")
    def call_groq(self, system_prompt: str, user_prompt: str, max_retries: int = 3) -> Dict[str, Any]:
        """
        Calls the Claude API and strictly expects a JSON response.
        Method name kept as call_groq for backward compatibility with all agents.
        Retries up to max_retries times on failures.
        """
        import logging
        logger = logging.getLogger(__name__)

        full_system = (
            f"{system_prompt}\n\n"
            "IMPORTANT: Your response must be valid JSON only. "
            "Do not include any conversational text, markdown formatting, or code fences. "
            "Output raw JSON starting with { and ending with }. "
            "Use double quotes for all strings."
        )

        last_error = None
        for attempt in range(max_retries):
            try:
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=4096,
                    system=full_system,
                    messages=[
                        {"role": "user", "content": user_prompt},
                    ],
                )

                content = response.content[0].text.strip()

                # Strip markdown code fences if Claude wraps the JSON
                if content.startswith("```"):
                    lines = content.split("\n")
                    # Remove first line (```json) and last line (```)
                    lines = [l for l in lines if not l.strip().startswith("```")]
                    content = "\n".join(lines).strip()

                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    logger.warning(f"[{self.name}] JSON parse error on attempt {attempt+1}, retrying...")
                    last_error = f"JSON parse error. Raw: {content[:200]}"
                    continue

            except Exception as e:
                error_str = str(e)
                logger.warning(f"[{self.name}] Claude API error on attempt {attempt+1}/{max_retries}: {error_str[:200]}")
                last_error = error_str
                if attempt < max_retries - 1:
                    import time
                    time.sleep(1)
                    continue

        # All retries exhausted — return graceful error instead of crashing
        logger.error(f"[{self.name}] All {max_retries} retries failed. Last error: {str(last_error)[:200]}")
        return {"error": f"{self.name} failed after {max_retries} retries", "agent": self.name}

    def update_credibility(self, normalized_error: float):
        """
        Updates the agent's credibility score post-launch based on prediction accuracy.
        Formula: Score_t = 0.9 * Score_(t-1) + 0.1 * (1 - NormalizedError)
        """
        self.credibility_score = (0.9 * self.credibility_score) + (0.1 * (1.0 - normalized_error))

    def get_info(self) -> Dict[str, Any]:
        """Returns metadata about the agent."""
        return {
            "name": self.name,
            "role": self.role,
            "credibility_score": round(self.credibility_score, 4)
        }
