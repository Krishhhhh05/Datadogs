from typing import Any, Dict
from core.base_agent import BaseAgent

class MarketAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Market Analyzer", role="Expert in market trends.")
    def analyze(self, product_context: str) -> Dict[str, Any]:
        system_prompt = (
            "You are a Market Analyzer. Provide a market trend analysis in valid JSON.\n"
            "Ensure all numeric ranges are represented as strings (e.g., '25-45' not 25-45).\n"
            "Response schema: { 'market_trend_analysis': { 'context': string, 'market_conditions': [{ 'trend': string, 'growth_rate': string, 'analysis': string }], 'predictive_analytics': { 'forecast': string, 'probability': float, 'confidence_level': int } } }"
        )
        return self.call_groq(system_prompt, f"Context: {product_context}")

class CustomerAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Customer Insight Specialist", role="Expert in user personas.")
    def analyze(self, product_context: str) -> Dict[str, Any]:
        system_prompt = (
            "You are a Customer Insight Specialist. Identify user personas in valid JSON.\n"
             "IMPORTANT: All age ranges or demographics must be STRINGS. Do not use unquoted ranges.\n"
            "Response schema: { 'customers': [{ 'name': string, 'persona_type': string, 'demographics': { 'age': string, 'income': string, 'occupation': string }, 'pain_points': [string], 'goals': [string] }] }"
        )
        return self.call_groq(system_prompt, f"Context: {product_context}")

class CompetitiveAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Competitive Intelligence lead", role="Expert in competitor benchmarking.")
    def analyze(self, product_context: str) -> Dict[str, Any]:
        system_prompt = (
            "You are a Competitive Intelligence Lead. Analyze competition in valid JSON.\n"
            "Response schema: { 'competitors': [{ 'name': string, 'strengths': [string], 'weaknesses': [string], 'description': string }] }"
        )
        return self.call_groq(system_prompt, f"Context: {product_context}")
