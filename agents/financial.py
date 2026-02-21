from typing import Any, Dict
from core.base_agent import BaseAgent

class RevenueAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Revenue Architect",
            role="Expert in subscription modeling, sales forecasting, and unit economics."
        )

    def analyze(self, product_context: str, validation_data: Dict[str, Any]) -> Dict[str, Any]:
        system_prompt = (
            f"You are the {self.name}, {self.role}\n"
            "Build a simplified revenue model based on market data.\n"
            "Provide: Suggested revenue streams, 12-month revenue forecast (low/mid/high), and LTV assumptions."
        )
        user_prompt = f"Product Context: {product_context}\nValidation Context (Phase 1): {validation_data}"
        return self.call_groq(system_prompt, user_prompt)

class PricingAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Pricing Strategist",
            role="Expert in psychological pricing, tiering strategies, and churn optimization."
        )

    def analyze(self, product_context: str, revenue_data: Dict[str, Any]) -> Dict[str, Any]:
        system_prompt = (
            f"You are the {self.name}, {self.role}\n"
            "Design a pricing structure for the product.\n"
            "Provide: Proposed pricing tiers, psychological pricing rationale, and a margin efficiency score (0-100)."
        )
        user_prompt = f"Product Context: {product_context}\nRevenue Modeling Context: {revenue_data}"
        return self.call_groq(system_prompt, user_prompt)

class RiskAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Risk Assessment Officer",
            role="Expert in financial risk, operational bottlenecks, and regulatory compliance."
        )

    def analyze(self, product_context: str, financial_context: Dict[str, Any]) -> Dict[str, Any]:
        system_prompt = (
            f"You are the {self.name}, {self.role}\n"
            "Identify financial and operational risks for the launch.\n"
            "Provide: Top 3 risks, mitigation strategies, and a total risk sensitivity score (0-100)."
        )
        user_prompt = f"Product Context: {product_context}\nFinancial Context (Phase 2): {financial_context}"
        return self.call_groq(system_prompt, user_prompt)
