"""Signal generation orchestrator."""

from typing import Dict, List

import pandas as pd

from assets import TOP_CRYPTO, TOP_STOCKS
from data_fetcher import fetch_asset_history
from trading_algo import compute_indicators, evaluate_signal


TIMEFRAMES = ["1h", "4h", "1d"]


def generate_signal_for_asset(asset: Dict[str, str], kind: str, timeframe: str) -> Dict[str, float]:
    """Fetch data, compute indicators, and create a signal payload."""
    history = fetch_asset_history(asset, kind, timeframe)
    enriched = compute_indicators(history)
    result = evaluate_signal(enriched)
    result["asset"] = asset if isinstance(asset, str) else asset["symbol"]
    result["timeframe"] = timeframe
    result["price"] = float(enriched["Close"].iloc[-1])
    return result


def scan_universe() -> pd.DataFrame:
    """Return a dataframe of signals across all supported assets."""
    rows: List[Dict[str, str]] = []
    for listing in TOP_CRYPTO:
        for tf in TIMEFRAMES:
            sig = generate_signal_for_asset(listing, "crypto", tf)
            rows.append({"Asset": f"{listing['symbol']} (Crypto)", "Timeframe": tf, **sig})
    for ticker in TOP_STOCKS:
        for tf in TIMEFRAMES:
            sig = generate_signal_for_asset(ticker, "stock", tf)
            rows.append({"Asset": f"{ticker} (Stock)", "Timeframe": tf, **sig})
    df = pd.DataFrame(rows)
    return df
