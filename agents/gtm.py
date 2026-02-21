from typing import Any, Dict
from core.base_agent import BaseAgent

class GTMAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="GTM Strategist",
            role="Expert in multi-channel marketing, viral loops, and PR strategy."
        )

    def analyze(self, product_context: str, accumulated_data: Dict[str, Any]) -> Dict[str, Any]:
        system_prompt = (
            f"You are the {self.name}, {self.role}\n"
            "Create a Go-To-Market strategy based on all validation and financial data.\n"
            "Provide brief bullet points for: Top 3 marketing channels, launch campaign timeline, and projected Customer Acquisition Cost (CAC).\n"
            "CRITICAL: Output an array under the key `funnel_metrics` containing objects for each stage of the user journey (`name`: Awareness, Consideration, Conversion, Retention) and `value` (estimated percentage of users remaining, e.g. 100, 50, 10, 5). This will be graphed as a Funnel chart."
        )
        user_prompt = f"Product Context: {product_context}\nAccumulated Context (Phases 1-2): {accumulated_data}"
        return self.call_groq(system_prompt, user_prompt)

class FeatureAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Product Roadmap lead",
            role="Expert in MVP scope, lean methodology, and prioritization frameworks (RICE/ICE)."
        )

    def analyze(self, product_context: str, user_needs_data: Dict[str, Any]) -> Dict[str, Any]:
        system_prompt = (
            f"You are the {self.name}, {self.role}\n"
            "Define the feature priorities for the launch product (MVP).\n"
            "Provide: Top 3 'must-have' features, ICE scores for each, and a technical feasibility score (0-100)."
        )
        user_prompt = f"Product Context: {product_context}\nUser Pain Points Data (from Phase 1): {user_needs_data}"
        return self.call_groq(system_prompt, user_prompt)
