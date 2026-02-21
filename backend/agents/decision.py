from typing import Any, Dict, List
from core.base_agent import BaseAgent

class LaunchDecisionAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Launch Director", role="Decision-maker.")
    def analyze(self, product_context: str, all_phase_data: Dict[str, Any], agent_info: List[Dict[str, Any]]) -> Dict[str, Any]:
        system_prompt = (
            "You are the Launch Director. Synthesize all analysis and provide a final decision in valid JSON.\n"
            "Response schema: { 'decision': 'GO' | 'NO-GO' | 'WAIT', 'confidence_score': int, 'reasoning_summary': string, 'critical_contingencies': [string] }"
        )
        return self.call_groq(system_prompt, f"Context: {product_context}\nData: {all_phase_data}")
