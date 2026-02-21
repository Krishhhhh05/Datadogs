import asyncio
import json
import os
import random
from datetime import datetime
from typing import Any, Dict

from typing import Any, Dict, List
import braintrust
from core.base_agent import BaseAgent
from agents.validation import MarketAgent, CustomerAgent, CompetitiveAgent
from agents.financial import RevenueAgent, PricingAgent, RiskAgent
from agents.gtm import GTMAgent, FeatureAgent
from agents.decision import LaunchDecisionAgent

LEARNING_LOG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "learning_log.json")

class ProductLaunchOrchestrator:
    """
    Manages the 4-phase sequential and parallel execution of the Product Launch OS.
    Ensures context is passed correctly between agents.
    """

    def __init__(self):
        # Initialize all agents
        self.market_agent = MarketAgent()
        self.customer_agent = CustomerAgent()
        self.comp_agent = CompetitiveAgent()
        
        self.revenue_agent = RevenueAgent()
        self.pricing_agent = PricingAgent()
        self.risk_agent = RiskAgent()
        
        self.gtm_agent = GTMAgent()
        self.feature_agent = FeatureAgent()
        
        self.decision_agent = LaunchDecisionAgent()
        
        self.all_agents: List[BaseAgent] = [
            self.market_agent, self.customer_agent, self.comp_agent,
            self.revenue_agent, self.pricing_agent, self.risk_agent,
            self.gtm_agent, self.feature_agent, self.decision_agent
        ]

        # Load persisted credibility scores if they exist
        self._restore_credibility()

    def _restore_credibility(self):
        """Restore agent credibility scores from the last learning log entry."""
        if not os.path.exists(LEARNING_LOG_PATH):
            return
        try:
            with open(LEARNING_LOG_PATH, "r") as f:
                log = json.load(f)
            if not log:
                return
            last = log[-1]
            agent_map = {a.name: a for a in self.all_agents}
            for name, data in last.get("agents", {}).items():
                if name in agent_map:
                    agent_map[name].credibility_score = data.get("credibility", 1.0)
            print(f"[Learning] Restored credibility from run #{last['run_id']}")
        except Exception as e:
            print(f"[Learning] Could not restore credibility: {e}")

    def _calibrate_and_log(self, product_context: str, decision: str) -> Dict[str, Any]:
        """
        Post-simulation self-learning step:
        1. Simulate post-launch feedback with random normalized errors.
        2. Update each agent's credibility score via EMA.
        3. Persist the snapshot to data/learning_log.json.
        """
        # Load existing log
        os.makedirs(os.path.dirname(LEARNING_LOG_PATH), exist_ok=True)
        log = []
        if os.path.exists(LEARNING_LOG_PATH):
            try:
                with open(LEARNING_LOG_PATH, "r") as f:
                    log = json.load(f)
            except (json.JSONDecodeError, IOError):
                log = []

        run_id = len(log) + 1
        agents_snapshot = {}

        for agent in self.all_agents:
            old_score = agent.credibility_score
            # Simulate normalized error (0 = perfect, 1 = worst)
            error = round(random.uniform(0.0, 0.3), 4)
            agent.update_credibility(error)
            
            snapshot_data = {
                "credibility": round(agent.credibility_score, 4),
                "previous": round(old_score, 4),
                "normalized_error": error,
                "change": round(agent.credibility_score - old_score, 4),
            }
            agents_snapshot[agent.name] = snapshot_data
            
            # Log evaluation score to Braintrust
            try:
                braintrust.log(
                    name="agent_calibration",
                    input={"product_context": product_context, "agent": agent.name},
                    output=snapshot_data,
                    scores={"credibility": agent.credibility_score, "error": error}
                )
            except Exception as e:
                pass

        snapshot = {
            "run_id": run_id,
            "timestamp": datetime.now().isoformat(),
            "product_idea_summary": product_context[:120] + ("..." if len(product_context) > 120 else ""),
            "decision": decision,
            "agents": agents_snapshot,
        }

        log.append(snapshot)
        with open(LEARNING_LOG_PATH, "w") as f:
            json.dump(log, f, indent=2)

        print(f"[Learning] Logged run #{run_id} — {len(self.all_agents)} agents calibrated.")
        return snapshot

    async def run_simulation(self, product_context: str) -> Dict[str, Any]:
        """
        Executes the full 4-phase launch simulation.
        """
        # Initialize Braintrust project for this run
        try:
            braintrust.init("Venture_Forge_AI_OS")
        except Exception as e:
            print(f"Braintrust init error: {e}")

        results = {}

        # --- Phase 1: Validation (Parallel) ---
        print("Starting Phase 1: Validation...")
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

        # --- Phase 2: Financial (Sequential) ---
        print("Starting Phase 2: Financial...")
        rev_data = self.revenue_agent.analyze(product_context, results["phase1_validation"])
        pricing_data = self.pricing_agent.analyze(product_context, rev_data)
        risk_data = self.risk_agent.analyze(product_context, {"revenue": rev_data, "pricing": pricing_data})
        
        results["phase2_financial"] = {
            "revenue": rev_data,
            "pricing": pricing_data,
            "risk": risk_data
        }

        # --- Phase 3: GTM (Parallel) ---
        print("Starting Phase 3: GTM...")
        phase3_results = await asyncio.gather(
            asyncio.to_thread(self.gtm_agent.analyze, product_context, results),
            asyncio.to_thread(self.feature_agent.analyze, product_context, results["phase1_validation"]["customer"])
        )
        results["phase3_gtm"] = {
            "strategy": phase3_results[0],
            "features": phase3_results[1]
        }

        # --- Phase 4: Decision (Meta-Agent) ---
        print("Starting Phase 4: Launch Decision...")
        agent_metadata = [a.get_info() for a in self.all_agents]
        decision_data = self.decision_agent.analyze(product_context, results, agent_metadata)
        results["final_decision"] = decision_data

        # --- Phase 5: Self-Learning Calibration ---
        print("Starting Phase 5: Self-Learning Calibration...")
        decision_str = (decision_data.get("decision") or "UNKNOWN") if isinstance(decision_data, dict) else "UNKNOWN"
        snapshot = self._calibrate_and_log(product_context, decision_str)
        results["learning_snapshot"] = snapshot

        return results
