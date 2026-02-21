from typing import Any, Dict, List
import json
from core.base_agent import BaseAgent
from core.trends_service import GoogleTrendsService
from core.finance_service import YFinanceService

class MarketAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Market Analyzer",
            role="Expert in market trends, size estimation, and macroeconomic impacts."
        )
        self.trends_service = GoogleTrendsService()

    def _extract_keywords(self, product_context: str) -> List[str]:
        prompt = (
            "Extract up to 5 broad industry or market keywords from the following product context "
            "that would be good to search on Google Trends. Return ONLY a JSON array of strings.\n\n"
            f"Context: {product_context}"
        )
        try:
            response = self.call_groq("You are a keyword extraction bot.", prompt)
            # The base agent call_groq tries to return JSON, which might be a dict. 
            # We'll just ask the LLM for a plain text array and parse it.
            # But since call_groq enforces JSON output natively in this project, 
            # let's format the prompt to expect a specific key.
            pass
        except Exception:
            pass
        return []

    def analyze(self, product_context: str) -> Dict[str, Any]:
        # 1. Extract Keywords
        extract_prompt = (
            "Extract up to 5 broad industry or market keywords from the following product idea "
            "that are optimal for analyzing search interest on Google Trends. "
            "Return a JSON object with a single key 'keywords' containing a list of strings."
        )
        try:
            kw_response = self.call_groq(extract_prompt, f"Product Context: {product_context}")
            keywords = kw_response.get("keywords", [])
        except Exception:
            keywords = []

        # 2. Fetch Trends Data
        trends_data = None
        if keywords:
            trends_data = self.trends_service.get_interest_over_time(keywords)

        # 3. Final Analysis
        trends_context = ""
        if trends_data:
            # We don't want to pass huge arrays to the LLM. Let's just pass the raw numbers or a summary.
            # Passing a summarized version is best, but raw data is fine for small timeframes.
            # To keep it simple, we pass the dictionary of {keyword: [values]}
            trends_context = f"\n\nGoogle Trends Search Interest (past 12 months) for {keywords}:\n{json.dumps(trends_data)[:1000]}... (data truncated)"

        system_prompt = (
            f"You are the {self.name}, {self.role}\n"
            "Analyze the market potential for the given product idea.\n"
            "Provide key market trends as concise bullet points, and a market readiness score (0-100).\n"
            "Use the provided Google Trends data (if available) to inform your market trends analysis and readiness score.\n"
            "CRITICAL: You must output a structured JSON array for TAM, SAM, and SOM under the key `market_size`, where each object has `label` (TAM/SAM/SOM) and `value` (numeric estimate). Keep text explanations extremely concise."
        )
        user_prompt = f"Product Context: {product_context}{trends_context}"
        return self.call_groq(system_prompt, user_prompt)

class CustomerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Customer Insight Specialist",
            role="Expert in user personas, pain point identification, and demand validation."
        )

    def analyze(self, product_context: str) -> Dict[str, Any]:
        system_prompt = (
            f"You are the {self.name}, {self.role}\n"
            "Identify target personas and their primary pain points for the product.\n"
            "Provide: 2-3 detailed personas, list of critical pain points, and a perceived value score (0-100)."
        )
        user_prompt = f"Product Context: {product_context}"
        return self.call_groq(system_prompt, user_prompt)

class CompetitiveAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Competitive Intelligence lead",
            role="Expert in competitor benchmarking and differentiation strategy."
        )
        self.trends_service = GoogleTrendsService()
        self.finance_service = YFinanceService()

    def analyze(self, product_context: str) -> Dict[str, Any]:
        # 1. Extract Competitor Names
        extract_prompt = (
            "Identify the top 3-5 real-world corporate competitors for the following product idea. "
            "Return a JSON object with a single key 'competitors' containing a list of strings (company names only)."
        )
        try:
            comp_response = self.call_groq(extract_prompt, f"Product Context: {product_context}")
            competitors = comp_response.get("competitors", [])
        except Exception:
            competitors = []

        # 2. Fetch Trends Data & YFinance Data
        trends_data = None
        finance_data = {}
        if competitors:
            trends_data = self.trends_service.get_interest_over_time(competitors)
            
            # Extract tickers for the competitors
            ticker_prompt = (
                f"Identify the primary US stock market ticker symbols for the following companies: {competitors}. "
                "If a company is private or doesn't have a major public ticker, return null for it. "
                "Return a JSON dictionary mapping the exact company name given directly to either its string ticker symbol (e.g. 'AAPL') or null."
            )
            try:
                ticker_response = self.call_groq(ticker_prompt, "You are a specialized stock ticker lookup bot.")
                for company, ticker in ticker_response.items():
                    if ticker and isinstance(ticker, str):
                        stats = self.finance_service.get_financial_summary(ticker)
                        if stats:
                            finance_data[company] = stats
            except Exception:
                pass

        # 3. Final Analysis
        external_context = ""
        if trends_data:
            external_context += f"\n\nGoogle Trends Search Interest (past 12 months) for competitors:\n{json.dumps(trends_data)[:1000]}... (data truncated)"
            
        if finance_data:
            external_context += f"\n\nYahoo Finance Public Metrics for competitors:\n{json.dumps(finance_data, indent=2)}"

        system_prompt = (
            f"You are the {self.name}, {self.role}\n"
            "Assess the competitive landscape for the product idea.\n"
            "Provide the top 3 competitors, and evaluate them concisely. Keep SWOT analysis as short bullet points.\n"
            "Use the provided Google Trends data and Yahoo Finance Metrics (if available) to evaluate competitor scale, revenue, and search interest.\n"
            "CRITICAL: Output an array under the key `competitor_scores` containing objects with `name` (competitor name), `price_score`, `features_score`, `usability_score`, `brand_score`, and `innovation_score` (all 1-10). Include an object for the proposed product (`name`: 'Proposed Product'). This will be used for a radar chart."
        )
        user_prompt = f"Product Context: {product_context}{external_context}"
        return self.call_groq(system_prompt, user_prompt)
