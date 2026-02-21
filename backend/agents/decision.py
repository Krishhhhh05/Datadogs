from typing import Any, Dict, List
from core.base_agent import BaseAgent

class LaunchDecisionAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Launch Director",
            role="Decision-maker specializing in strategic alignment and aggregate risk/reward optimization."
        )

    def analyze(self, product_context: str, all_phase_data: Dict[str, Any], agent_info: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregates all agent data and credibility scores to output a final decision.
        """
        system_prompt = (
            f"You are the {self.name}, {self.role}\n"
            "Review the comprehensive data from all launch phases (Validation, Finance, GTM).\n"
            "Take into account the 'credibility_score' of each agent provided in the metadata.\n"
            "Synthesize all insights and provide a final recommendation.\n\n"
            "Response Schema:\n"
            "{\n"
            "  'decision': 'GO' | 'NO-GO' | 'WAIT',\n"
            "  'confidence_score': 0-100,\n"
            "  'reasoning_summary': 'Why this decision was made',\n"
            "  'critical_contingencies': ['List of things that must happen for GO to succeed'],\n"
            "  'weighted_sentiment': { 'Validation': float, 'Financial': float, 'GTM': float }\n"
            "}"
        )
        user_prompt = f"Product Context: {product_context}\nFull OS Context: {all_phase_data}\nAgent Metadata (Credibility): {agent_info}"
        return self.call_groq(system_prompt, user_prompt)
