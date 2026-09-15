"""Robust backtesting utilities for RSI swing strategy with validation."""

from typing import Dict, List, Optional

import numpy as np
import pandas as pd
from scipy import stats

from data_fetcher import fetch_asset_history
from trading_algo import compute_indicators


def _generate_trades(df: pd.DataFrame) -> List[Dict[str, float]]:
    """Create naive trades: buy RSI<30, sell RSI>70."""
    trades: List[Dict[str, float]] = []
    position: Optional[Dict[str, float]] = None
    for idx, row in df.iterrows():
        if position is None and row["RSI"] < 30:
            position = {"entry": float(row["Close"]), "date": idx}
        elif position and row["RSI"] > 70:
            pnl = float(row["Close"] - position["entry"])
            trades.append(
                {
                    "date": idx.date(),
                    "entry": position["entry"],
                    "exit": float(row["Close"]),
                    "pnl": pnl,
                    "return": pnl / position["entry"],
                    "outcome": "Win" if pnl > 0 else "Loss",
                }
            )
            position = None
    return trades


def _max_drawdown(equity: pd.Series) -> float:
    """Compute maximum drawdown for an equity curve."""
    running_max = equity.cummax()
    drawdowns = (equity - running_max) / running_max.replace(0, np.nan)
    return float(drawdowns.min()) if not drawdowns.empty else 0.0


def _profit_factor(pnl: pd.Series) -> float:
    wins = pnl[pnl > 0].sum()
    losses = -pnl[pnl < 0].sum()
    return float(wins / losses) if losses > 0 else float("inf")


def _sharpe_ratio(returns: pd.Series, periods: int = 252, risk_free: float = 0.0) -> float:
    if returns.empty:
        return 0.0
    excess = returns - (risk_free / periods)
    std = excess.std()
    if std == 0 or np.isnan(std):
        return 0.0
    return float((excess.mean() / std) * np.sqrt(periods))


def _monte_carlo_simulation(returns: pd.Series, iterations: int = 500, horizon: int = 50) -> Dict[str, float]:
    rng = np.random.default_rng(123)
    simulations = []
    if returns.empty:
        return {"p5": 0.0, "p50": 0.0, "p95": 0.0}
    for _ in range(iterations):
        path = rng.choice(returns, size=horizon, replace=True)
        simulations.append(np.cumsum(path)[-1])
    percentiles = np.percentile(simulations, [5, 50, 95])
    return {"p5": float(percentiles[0]), "p50": float(percentiles[1]), "p95": float(percentiles[2])}


def _walk_forward_validation(enriched: pd.DataFrame, window: int = 120, step: int = 60) -> List[Dict[str, float]]:
    """Run walk-forward validation by evaluating rolling out-of-sample segments."""
    results: List[Dict[str, float]] = []
    start = 0
    while start + window < len(enriched):
        train = enriched.iloc[start : start + window]
        test = enriched.iloc[start + window : start + window + step]
        trades = _generate_trades(test)
        pnl = pd.Series([t["pnl"] for t in trades])
        results.append(
            {
                "start": train.index[0].date(),
                "end": test.index[-1].date(),
                "win_rate": float((pnl > 0).mean() * 100) if not pnl.empty else 0.0,
                "pnl": float(pnl.sum()) if not pnl.empty else 0.0,
            }
        )
        start += step
    return results


def _out_of_sample_test(enriched: pd.DataFrame, split: float = 0.7) -> Dict[str, float]:
    """Evaluate performance on the tail portion of the dataset."""
    cut = int(len(enriched) * split)
    test = enriched.iloc[cut:]
    trades = _generate_trades(test)
    pnl = pd.Series([t["pnl"] for t in trades])
    equity = pnl.cumsum()
    returns = pd.Series([t["return"] for t in trades])
    t_stat, p_value = stats.ttest_1samp(returns, popmean=0) if not returns.empty else (0.0, 1.0)
    return {
        "win_rate": float((pnl > 0).mean() * 100) if not pnl.empty else 0.0,
        "total_pnl": float(pnl.sum()) if not pnl.empty else 0.0,
        "max_drawdown": _max_drawdown(equity),
        "t_stat": float(t_stat),
        "p_value": float(p_value),
    }


def run_backtest(
    asset: Dict[str, str],
    kind: str,
    timeframe: str = "1d",
    history: Optional[pd.DataFrame] = None,
) -> Dict[str, object]:
    """
    Execute a lightweight backtest and return extended validation metrics.

    The optional ``history`` parameter allows deterministic testing by
    bypassing live data fetching.
    """

    base_history = history if history is not None else fetch_asset_history(asset, kind, timeframe)
    enriched = compute_indicators(base_history).dropna()
    trades = _generate_trades(enriched)
    trade_df = pd.DataFrame(trades)

    if trade_df.empty:
        trade_df = pd.DataFrame([{"pnl": 0.0, "return": 0.0}])

    pnl_series = trade_df["pnl"].astype(float)
    equity_curve = pnl_series.cumsum()
    returns = trade_df.get("return", pd.Series(dtype=float)).astype(float)

    summary = {
        "win_rate": float((pnl_series > 0).mean() * 100),
        "total_pnl": float(pnl_series.sum()),
        "best_trade": float(pnl_series.max()),
        "worst_trade": float(pnl_series.min()),
        "equity_curve": equity_curve,
        "trade_log": trade_df,
        "sharpe_ratio": _sharpe_ratio(returns),
        "max_drawdown": _max_drawdown(equity_curve),
        "profit_factor": _profit_factor(pnl_series),
    }

    summary["walk_forward"] = _walk_forward_validation(enriched)
    summary["out_of_sample"] = _out_of_sample_test(enriched)
    summary["t_test"] = summary["out_of_sample"].get("t_stat"), summary["out_of_sample"].get("p_value")
    summary["monte_carlo"] = _monte_carlo_simulation(returns)
    return summary
