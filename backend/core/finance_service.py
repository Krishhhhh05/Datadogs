import yfinance as yf
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

class YFinanceService:
    """
    Service to fetch live financial data for public companies via Yahoo Finance.
    Provides rich profiles and price history suitable for direct chart rendering.
    """
    def __init__(self):
        pass

    def get_rich_profile(self, ticker: str) -> Optional[Dict[str, Any]]:
        """
        Returns a rich dict of raw numeric + text metrics for a given ticker.
        All numeric values are raw (not formatted), ready for charting.
        """
        if not ticker:
            return None
        try:
            ticker_obj = yf.Ticker(ticker)
            info = ticker_obj.info

            if 'shortName' not in info and 'longName' not in info:
                logger.warning(f"Ticker {ticker} returned no useful info.")
                return None

            return {
                "symbol": info.get("symbol", ticker),
                "name": info.get("shortName", info.get("longName", ticker)),
                "sector": info.get("sector", "N/A"),
                "industry": info.get("industry", "N/A"),
                "country": info.get("country", "N/A"),
                "employeeCount": info.get("fullTimeEmployees"),
                # Raw numeric values for charts (integers / floats)
                "marketCap": info.get("marketCap"),
                "totalRevenue": info.get("totalRevenue"),
                "ebitda": info.get("ebitda"),
                "revenueGrowth": info.get("revenueGrowth"),      # e.g. 0.12 = 12%
                "profitMargins": info.get("profitMargins"),       # e.g. 0.24 = 24%
                "grossMargins": info.get("grossMargins"),
                "trailingPE": info.get("trailingPE"),
                "priceToBook": info.get("priceToBook"),
                "currentPrice": info.get("currentPrice"),
                "fiftyTwoWeekHigh": info.get("fiftyTwoWeekHigh"),
                "fiftyTwoWeekLow": info.get("fiftyTwoWeekLow"),
                "beta": info.get("beta"),
                # Formatted human-readable summary strings
                "marketCap_fmt": self._fmt_currency(info.get("marketCap")),
                "totalRevenue_fmt": self._fmt_currency(info.get("totalRevenue")),
                "revenueGrowth_fmt": self._fmt_pct(info.get("revenueGrowth")),
                "profitMargins_fmt": self._fmt_pct(info.get("profitMargins")),
            }
        except Exception as e:
            logger.error(f"YFinance error for {ticker}: {e}")
            return None

    def get_price_history(self, ticker: str, period: str = "1y") -> Optional[List[Dict]]:
        """
        Returns list of {date, close} objects over the requested period.
        Suitable for rendering as a stock price trend / market proxy line chart.
        """
        if not ticker:
            return None
        try:
            ticker_obj = yf.Ticker(ticker)
            hist = ticker_obj.history(period=period, interval="1wk")  # weekly data
            if hist.empty:
                return None
            result = []
            for date, row in hist.iterrows():
                result.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "close": round(float(row["Close"]), 2)
                })
            return result
        except Exception as e:
            logger.error(f"YFinance price history error for {ticker}: {e}")
            return None

    def get_financial_summary(self, ticker: str) -> Optional[Dict[str, Any]]:
        """Legacy method - returns formatted strings for LLM prompt injection."""
        profile = self.get_rich_profile(ticker)
        if not profile:
            return None
        return {
            "symbol": profile["symbol"],
            "name": profile["name"],
            "marketCap": profile["marketCap_fmt"],
            "totalRevenue": profile["totalRevenue_fmt"],
            "revenueGrowth": profile["revenueGrowth_fmt"],
            "profitMargins": profile["profitMargins_fmt"],
            "industry": profile["industry"],
            "sector": profile["sector"],
        }

    def _fmt_currency(self, value) -> str:
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

    def _fmt_pct(self, value) -> str:
        if value is None:
            return "N/A"
        try:
            return f"{float(value) * 100:.1f}%"
        except:
            return str(value)
