from typing import Any, Dict
from core.base_agent import BaseAgent

class MarketAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Market Analyzer",
            role="Expert in market trends, size estimation, and macroeconomic impacts."
        )

    def analyze(self, product_context: str) -> Dict[str, Any]:
        system_prompt = (
            f"You are the {self.name}, {self.role}\n"
            "Analyze the market potential for the given product idea.\n"
            "Provide: TAM/SAM/SOM estimates, key market trends, and a market readiness score (0-100)."
        )
        user_prompt = f"Product Context: {product_context}"
        return self.call_groq(system_prompt, user_prompt)

class CustomerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Customer Insight Specialist",
            role="Expert in user personas, pain point identification, and demand validation."
        )

    def analyze(self, product_context: str) -> Dict[str, Any]:
        system_prompt = (
            f"You are the {self.name}, {self.role}\n"
            "Identify target personas and their primary pain points for the product.\n"
            "Provide: 2-3 detailed personas, list of critical pain points, and a perceived value score (0-100)."
        )
        user_prompt = f"Product Context: {product_context}"
        return self.call_groq(system_prompt, user_prompt)

class CompetitiveAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Competitive Intelligence lead",
            role="Expert in competitor benchmarking and differentiation strategy."
        )

    def analyze(self, product_context: str) -> Dict[str, Any]:
        system_prompt = (
            f"You are the {self.name}, {self.role}\n"
            "Assess the competitive landscape for the product idea.\n"
            "Provide: Top 3 competitors, SWOT analysis for the product vs competitors, and a differentiation score (0-100)."
        )
        user_prompt = f"Product Context: {product_context}"
        return self.call_groq(system_prompt, user_prompt)
