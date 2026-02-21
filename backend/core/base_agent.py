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

    def call_groq(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """
        Calls the Groq API and strictly expects a JSON response.
        
        Args:
            system_prompt: Guidelines and constraints for the agent.
            user_prompt: The specific task or context for the agent.
            
        Returns:
            A dictionary parsed from the JSON response.
        """
        response = self.client.chat.completions.create(
            messages=[
                {"role": "system", "content": f"{system_prompt}\n\nIMPORTANT: Your response must be valid JSON only. Do not include any conversational text before or after the JSON block."},
                {"role": "user", "content": user_prompt},
            ],
            model=self.model,
            response_format={"type": "json_object"},
        )
        
        content = response.choices[0].message.content
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            # In production, you might want to retry or handle this more gracefully
            return {"error": "Failed to parse JSON response", "raw_content": content}

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
