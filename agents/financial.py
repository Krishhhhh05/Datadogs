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
            "Provide brief, bullet-point suggested revenue streams and LTV assumptions.\n"
            "CRITICAL: Output a structured array under `5_year_projection` containing 5 objects, each with `year` (int 1-5), `revenue` (int), and `costs` (int). This will be graphed as a Line/Bar combo chart."
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
            "Provide the top 3 risks with concise mitigation strategies, and a total risk sensitivity score (0-100).\n"
            "CRITICAL: Output a structured array under `risk_matrix` containing objects with `name` (string), `impact` (int 1-100, x-axis), and `probability` (int 1-100, y-axis). This will be graphed as a Scatter/Bubble chart."
        )
        user_prompt = f"Product Context: {product_context}\nFinancial Context (Phase 2): {financial_context}"
        return self.call_groq(system_prompt, user_prompt)
