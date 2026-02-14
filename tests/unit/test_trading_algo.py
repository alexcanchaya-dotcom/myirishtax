import numpy as np
import pandas as pd

from backtester import run_backtest
from trading_algo import compute_indicators


ALLOWED_COLUMNS = [
    "EMA20",
    "EMA50",
    "EMA200",
    "RSI",
    "MACD",
    "MACD_SIGNAL",
    "BB_UPPER",
    "BB_LOWER",
]


def build_synthetic_btc(start: str = "2023-01-01", end: str = "2024-12-31") -> pd.DataFrame:
    dates = pd.date_range(start=start, end=end, freq="D")
    base_trend = np.linspace(20000, 40000, len(dates))
    cyclical = np.sin(np.linspace(0, 12 * np.pi, len(dates))) * 800
    rng = np.random.default_rng(7)
    noise = rng.normal(0, 200, len(dates))
    close = base_trend + cyclical + noise
    df = pd.DataFrame({"Close": close}, index=dates)
    df["Open"] = df["Close"].shift(1).fillna(df["Close"])
    df["High"] = df[["Open", "Close"]].max(axis=1) * 1.01
    df["Low"] = df[["Open", "Close"]].min(axis=1) * 0.99
    df["Volume"] = np.abs(rng.normal(1_000_000, 50_000, len(dates)))
    return df


def test_indicator_columns_and_values_present():
    history = build_synthetic_btc()
    enriched = compute_indicators(history)
    for col in ALLOWED_COLUMNS:
        assert col in enriched.columns
        assert enriched[col].notna().sum() > 0


def test_backtest_win_rate_and_metrics_exceed_threshold():
    history = build_synthetic_btc()
    result = run_backtest({"symbol": "BTC", "coingecko": "bitcoin"}, "crypto", "1d", history=history)
    assert result["win_rate"] > 55
    assert result["profit_factor"] >= 1
    assert "sharpe_ratio" in result
    assert "max_drawdown" in result


def test_compute_indicators_handles_missing_data_gracefully():
    history = build_synthetic_btc().copy()
    history.loc[history.index[:5], "Close"] = np.nan
    enriched = compute_indicators(history)
    assert set(ALLOWED_COLUMNS).issubset(enriched.columns)


def test_backtest_survives_extreme_volatility():
    dates = pd.date_range("2024-01-01", periods=200, freq="D")
    close = np.where(np.arange(len(dates)) % 2 == 0, 100, 300)
    history = pd.DataFrame({"Close": close}, index=dates)
    history["Open"] = history["Close"].shift(1).fillna(history["Close"])
    history["High"] = history[["Open", "Close"]].max(axis=1) * 1.02
    history["Low"] = history[["Open", "Close"]].min(axis=1) * 0.98
    history["Volume"] = 1_000_000
    result = run_backtest({"symbol": "BTC", "coingecko": "bitcoin"}, "crypto", history=history)
    assert "win_rate" in result
    assert result["profit_factor"] >= 0


def test_performance_metrics_calculated():
    history = build_synthetic_btc()
    result = run_backtest({"symbol": "BTC", "coingecko": "bitcoin"}, "crypto", "1d", history=history)
    assert result["sharpe_ratio"] is not None
    assert result["monte_carlo"]["p5"] <= result["monte_carlo"]["p95"]
    assert isinstance(result["walk_forward"], list)
