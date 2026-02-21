import asyncio
import json
from core.orchestrator import ProductLaunchOrchestrator

async def main():
    print("=== Multi-Agent Product Launch Operating System ===")
    
    orchestrator = ProductLaunchOrchestrator()
    
    # 1. Provide a Product Idea
    product_idea = (
        "A premium subscription service for AI-driven portfolio management "
        "targeting tech-savvy Gen Z investors who want to optimize for ESG "
        "and long-term tax efficiency."
    )
    
    print(f"\n[USER INPUT]: {product_idea}\n")
    
    # 2. Run the 4-Phase OS
    results = await orchestrator.run_simulation(product_idea)
    
    # 3. Display the Final Decision
    print("\n" + "="*50)
    print("FINAL OS DECISION:")
    print(json.dumps(results["final_decision"], indent=2))
    print("="*50 + "\n")
    
    # 4. Phase 5: Simulated Post-Launch Feedback Loop
    # In a real system, you would compare 'results' with actual market data after 6 months.
    print("Simulating Post-Launch Feedback (Phase 5)...")
    
    # Let's say the MarketAgent underestimated demand (Error: 0.2)
    # And the RevenueAgent was spot on (Error: 0.05)
    
    errors = {
        "Market Analyzer": 0.2,
        "Revenue Architect": 0.05,
        "Pricing Strategist": 0.15,
        "Risk Assessment Officer": 0.1,
    }
    
    for agent in orchestrator.all_agents:
        if agent.name in errors:
            old_score = agent.credibility_score
            agent.update_credibility(errors[agent.name])
            print(f"Updated {agent.name}: {old_score:.4f} -> {agent.credibility_score:.4f}")

    print("\nSimulation Complete. System is now more 'calibrated' for the next run.")

if __name__ == "__main__":
    asyncio.run(main())
