from typing import Any, Dict
from core.base_agent import BaseAgent

class GTMAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="GTM Strategist", role="Expert in multi-channel marketing.")
    def analyze(self, product_context: str, accumulated_data: Dict[str, Any]) -> Dict[str, Any]:
        system_prompt = (
            "You are a GTM Strategist. Create a GTM strategy in valid JSON.\n"
            "Response schema: { 'gtm_strategy': { 'target_audience': { 'demographics': [string], 'psychographics': [string] }, 'marketing_channels': [string], 'funnel_stages': [string] } }"
        )
        return self.call_groq(system_prompt, f"Context: {product_context}")

class FeatureAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Product Roadmap lead", role="Expert in MVP scope.")
    def analyze(self, product_context: str, user_needs_data: Dict[str, Any]) -> Dict[str, Any]:
        system_prompt = (
            "You are a Product Roadmap Lead. Define feature priorities in valid JSON.\n"
            "Response schema: { 'roadmap': { 'features': [{ 'name': string, 'description': string, 'priority': int }] } }"
        )
        return self.call_groq(system_prompt, f"Context: {product_context}")
