import time
import logging
from typing import List, Dict, Any, Optional
from pytrends.request import TrendReq
import pandas as pd

logger = logging.getLogger(__name__)

class GoogleTrendsService:
    """
    A service to interact with Google Trends via pytrends.
    Includes basic retry logic to handle rate limiting.
    """
    def __init__(self, hl='en-US', tz=360):
        self.pytrends = TrendReq(hl=hl, tz=tz)

    def get_interest_over_time(self, keywords: List[str], timeframe: str = 'today 12-m') -> Optional[Dict[str, Any]]:
        """
        Fetches interest over time for a list of keywords.
        Returns a dictionary with:
          - 'dates': list of date strings (YYYY-MM-DD)
          - keyword: list of int values (0-100)
        Or None if the request failed.
        """
        if not keywords:
            return None

        # Google Trends allows a maximum of 5 keywords per request
        if len(keywords) > 5:
            keywords = keywords[:5]
            logger.warning(f"Google Trends only supports up to 5 keywords. Truncated to: {keywords}")

        max_retries = 3
        base_delay = 5

        for attempt in range(max_retries):
            try:
                self.pytrends.build_payload(keywords, cat=0, timeframe=timeframe, geo='', gprop='')
                df = self.pytrends.interest_over_time()
                
                if df is None or df.empty:
                    return {kw: [] for kw in keywords}

                # Drop the isPartial column if it exists
                if 'isPartial' in df.columns:
                    df = df.drop(columns=['isPartial'])

                # Build result with labeled dates
                result = {
                    "dates": [d.strftime('%Y-%m-%d') for d in df.index],
                }
                for kw in keywords:
                    if kw in df.columns:
                        result[kw] = [int(v) for v in df[kw].tolist()]
                    else:
                        result[kw] = []

                return result

            except Exception as e:
                logger.error(f"Error fetching Google Trends data (attempt {attempt+1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    sleep_time = base_delay * (2 ** attempt)
                    logger.info(f"Retrying in {sleep_time} seconds...")
                    time.sleep(sleep_time)
                else:
                    logger.error("Max retries reached. Returning None.")
                    return None
