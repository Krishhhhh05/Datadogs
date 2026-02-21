import asyncio
from typing import Any, Dict, List
from core.base_agent import BaseAgent
from agents.validation import MarketAgent, CustomerAgent, CompetitiveAgent
from agents.financial import RevenueAgent, PricingAgent, RiskAgent
from agents.gtm import GTMAgent, FeatureAgent
from agents.decision import LaunchDecisionAgent
from agents.master import MasterAgent

class ProductLaunchOrchestrator:
    def __init__(self):
        self.market_agent = MarketAgent()
        self.customer_agent = CustomerAgent()
        self.comp_agent = CompetitiveAgent()
        self.revenue_agent = RevenueAgent()
        self.pricing_agent = PricingAgent()
        self.risk_agent = RiskAgent()
        self.gtm_agent = GTMAgent()
        self.feature_agent = FeatureAgent()
        self.decision_agent = LaunchDecisionAgent()
        self.master_agent = MasterAgent()
        self.all_agents: List[BaseAgent] = [
            self.market_agent, self.customer_agent, self.comp_agent,
            self.revenue_agent, self.pricing_agent, self.risk_agent,
            self.gtm_agent, self.feature_agent, self.decision_agent,
            self.master_agent
        ]

    async def run_simulation(self, product_context: str) -> Dict[str, Any]:
        results = {}
        # Phase 1: Validation
        phase1_results = await asyncio.gather(
            asyncio.to_thread(self.market_agent.analyze, product_context),
            asyncio.to_thread(self.customer_agent.analyze, product_context),
            asyncio.to_thread(self.comp_agent.analyze, product_context)
        )
        results["phase1_validation"] = {
            "market": phase1_results[0],
            "customer": phase1_results[1],
            "competitors": phase1_results[2]
        }
        # Phase 2: Financial
        rev_data = self.revenue_agent.analyze(product_context, results["phase1_validation"])
        pricing_data = self.pricing_agent.analyze(product_context, rev_data)
        risk_data = self.risk_agent.analyze(product_context, {"revenue": rev_data, "pricing": pricing_data})
        results["phase2_financial"] = {"revenue": rev_data, "pricing": pricing_data, "risk": risk_data}
        # Phase 3: GTM
        phase3_results = await asyncio.gather(
            asyncio.to_thread(self.gtm_agent.analyze, product_context, results),
            asyncio.to_thread(self.feature_agent.analyze, product_context, results["phase1_validation"]["customer"])
        )
        results["phase3_gtm"] = {"strategy": phase3_results[0], "features": phase3_results[1]}
        # Phase 4: Decision
        agent_metadata = [a.get_info() for a in self.all_agents]
        decision_data = self.decision_agent.analyze(product_context, results, agent_metadata)
        results["final_decision"] = decision_data

        # Final Synthesis
        synthesis = self.master_agent.synthesize_results(product_context, results)
        results["master_synthesis"] = synthesis
        
        return results
