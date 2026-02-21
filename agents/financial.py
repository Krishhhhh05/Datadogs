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
            "CRITICAL: Output a structured array under `5_year_projection` containing 5 objects, each with `year` (int 1-5), `revenue` (int), and `costs` (int).\n\n"
            "EXAMPLE OUTPUT FORMAT:\n"
            "{\n"
            "  \"subscription_revenue\": 500000,\n"
            "  \"total_revenue\": 750000,\n"
            "  \"growth_rate\": \"15%\",\n"
            "  \"margin\": 45,\n"
            "  \"suggested_revenue_streams\": [\"Tiered Subscriptions\", \"API Access Fees\"],\n"
            "  \"ltv_assumptions\": \"Assuming 5% churn and $50 ARPU, LTV is $1000.\",\n"
            "  \"5_year_projection\": [\n"
            "    {\"year\": 1, \"revenue\": 100000, \"costs\": 150000},\n"
            "    {\"year\": 2, \"revenue\": 300000, \"costs\": 200000}\n"
            "  ]\n"
            "}"
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
            "Provide: Proposed pricing tiers, psychological pricing rationale, and a margin efficiency score (0-100).\n\n"
            "EXAMPLE OUTPUT FORMAT:\n"
            "{\n"
            "  \"pricing_strategy\": \"Freemium with feature lock\",\n"
            "  \"psychological_pricing\": \"Charm pricing ($9.99) reduces friction.\",\n"
            "  \"margin_efficiency\": 85,\n"
            "  \"tiers\": [\n"
            "    {\"name\": \"Starter\", \"price\": 0, \"features\": [\"Basic Access\"]},\n"
            "    {\"name\": \"Pro\", \"price\": 29, \"features\": [\"Advanced Analytics\", \"Priority Support\"]}\n"
            "  ]\n"
            "}"
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
            "CRITICAL: Output a structured array under `risk_matrix` containing objects with `name` (string), `impact` (int 1-100, x-axis), and `probability` (int 1-100, y-axis).\n\n"
            "EXAMPLE OUTPUT FORMAT:\n"
            "{\n"
            "  \"sensitivity_score\": 65,\n"
            "  \"mitigation_strategy\": \"Phase rollouts and maintain diverse acquisition channels.\",\n"
            "  \"risk_matrix\": [\n"
            "    {\"name\": \"High Churn\", \"impact\": 80, \"probability\": 40, \"mitigation\": \"Onboarding optimization\"},\n"
            "    {\"name\": \"Competitor Price War\", \"impact\": 60, \"probability\": 50, \"mitigation\": \"Focus on brand loyalty\"}\n"
            "  ]\n"
            "}"
        )
        user_prompt = f"Product Context: {product_context}\nFinancial Context (Phase 2): {financial_context}"
        return self.call_groq(system_prompt, user_prompt)
