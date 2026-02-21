import yfinance as yf
from typing import Dict, Any, List, Optional
import json
import logging

logger = logging.getLogger(__name__)

class YFinanceService:
    """
    A service to interact with Yahoo Finance via yfinance.
    Provides methods to fetch market capitalization, total revenue, 
    and other key financial metrics for public competitor analysis.
    """
    def __init__(self):
        pass

    def get_financial_summary(self, ticker: str) -> Optional[Dict[str, Any]]:
        """
        Fetches a summary of key financial metrics for a given ticker symbol.
        Returns a dictionary or None if the ticker is invalid/not found.
        """
        if not ticker:
            return None

        try:
            ticker_obj = yf.Ticker(ticker)
            info = ticker_obj.info
            
            # If there's no shortName, it's likely an invalid ticker
            if 'shortName' not in info and 'longName' not in info:
                logger.warning(f"Ticker {ticker} not found or has no info on yfinance.")
                return None

            # Extract only the most useful high-level metrics to avoid bloating the prompt context
            return {
                "symbol": info.get("symbol", ticker),
                "name": info.get("shortName", info.get("longName", "Unknown")),
                "marketCap": self._format_currency(info.get("marketCap")),
                "totalRevenue": self._format_currency(info.get("totalRevenue")),
                "ebitda": self._format_currency(info.get("ebitda")),
                "revenueGrowth": self._format_percentage(info.get("revenueGrowth")),
                "profitMargins": self._format_percentage(info.get("profitMargins")),
                "industry": info.get("industry", "N/A"),
                "sector": info.get("sector", "N/A")
            }

        except Exception as e:
            logger.error(f"Error fetching yfinance data for ticker {ticker}: {e}")
            return None

    def _format_currency(self, value) -> str:
        if value is None:
            return "N/A"
        try:
            val = float(value)
            if val >= 1_000_000_000_000:
                return f"${val / 1_000_000_000_000:.2f}T"
            elif val >= 1_000_000_000:
                return f"${val / 1_000_000_000:.2f}B"
            elif val >= 1_000_000:
                return f"${val / 1_000_000:.2f}M"
            else:
                return f"${val:,.0f}"
        except:
            return str(value)

    def _format_percentage(self, value) -> str:
        if value is None:
            return "N/A"
        try:
            return f"{float(value) * 100:.2f}%"
        except:
            return str(value)
