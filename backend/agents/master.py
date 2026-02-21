from typing import Any, Dict, List
from core.base_agent import BaseAgent

class MasterAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Master Orchestrator", 
            role="Central intelligence overseeing the product launch OS. Expert in synthesizing cross-functional data."
        )
    
    def synthesize_results(self, product_context: str, results: Dict[str, Any]) -> str:
        """Synthesize all simulation results into a cohesive executive summary."""
        system_prompt = (
            "You are the Master Orchestrator. Review the provided simulation results from all phases "
            "(Validation, Financial, GTM, and the Final Decision).\n"
            "Provide a concise, high-impact executive summary for the user. Focus on the core 'Why' "
            "behind the decision and the most critical next steps.\n"
            "Response should be a clear, conversational summary."
        )
        user_prompt = f"Product context: {product_context}\n\nFull Simulation Data: {results}"
        # Since we want a conversational summary here, we'll use a direct call instead of strictly JSON if needed,
        # but for consistency with the base agent, we might want to wrap it.
        # However, MasterAgent will also handle chat, which is conversational.
        return self.call_groq(system_prompt, user_prompt)

    def chat(self, user_message: str, simulation_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Handle a chat interaction based on the current simulation context."""
        system_prompt = (
            "You are the Master Orchestrator. You are assisting the user with their product launch strategy.\n"
            "If a simulation has been run, use the provided results to answer questions specifically and strategically.\n"
            "If no simulation has been run, guide the user on how to describe their product for the OS.\n"
            "IMPORTANT: Your response must be in valid JSON with a 'message' field and an optional 'action' field."
        )
        
        context_str = f"Current Simulation Context: {simulation_context}" if simulation_context else "No simulation run yet."
        user_prompt = f"User Message: {user_message}\n\n{context_str}"
        
        return self.call_groq(system_prompt, user_prompt)
