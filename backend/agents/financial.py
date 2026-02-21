from typing import Any, Dict
from core.base_agent import BaseAgent

class RevenueAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Revenue Architect", role="Expert in subscription modeling.")
    def analyze(self, product_context: str, validation_data: Dict[str, Any]) -> Dict[str, Any]:
        system_prompt = (
            "You are a Revenue Architect. Build a revenue model in valid JSON.\n"
            "Ensure all values are valid JSON types. Numbers should be integers or floats.\n"
            "Response schema: { 'revenue_model': { 'subscription_revenue': float, 'growth_rate': string, 'total_revenue': float, 'margin': int } }"
        )
        return self.call_groq(system_prompt, f"Context: {product_context}")

class PricingAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Pricing Strategist", role="Expert in pricing tiers.")
    def analyze(self, product_context: str, revenue_data: Dict[str, Any]) -> Dict[str, Any]:
        system_prompt = (
            "You are a Pricing Strategist. Design pricing tiers in valid JSON.\n"
            "Response schema: { 'pricing_tiers': [{ 'name': string, 'monthly_fee': float, 'features': [string] }] }"
        )
        return self.call_groq(system_prompt, f"Context: {product_context}")

class RiskAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Risk Assessment Officer", role="Expert in financial risk.")
    def analyze(self, product_context: str, financial_context: Dict[str, Any]) -> Dict[str, Any]:
        system_prompt = (
            "You are a Risk Assessment Officer. Analyze risks in valid JSON.\n"
            "Response schema: { 'risk_analysis': { 'potential_risks': [{ 'description': string, 'impact': int, 'probability': float }], 'mitigation_strategy': string } }"
        )
        return self.call_groq(system_prompt, f"Context: {product_context}")
