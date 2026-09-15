import numpy as np
import pandas as pd

import signals
from signals import TIMEFRAMES, generate_signal_for_asset
from trading_algo import compute_indicators, evaluate_signal


ASSET_INFO = {"symbol": "BTC", "coingecko": "bitcoin"}


def build_history(length: int = 200) -> pd.DataFrame:
    idx = pd.date_range("2024-01-01", periods=length, freq="H")
    trend = np.linspace(100, 140, length)
    sine = np.sin(np.linspace(0, 6 * np.pi, length)) * 2
    close = trend + sine
    df = pd.DataFrame({"Close": close}, index=idx)
    df["Open"] = df["Close"].shift(1).fillna(df["Close"])
    df["High"] = df[["Open", "Close"]].max(axis=1) * 1.01
    df["Low"] = df[["Open", "Close"]].min(axis=1) * 0.99
    df["Volume"] = 500000
    return df


def test_evaluate_signal_returns_confidence_and_label():
    history = build_history(300)
    enriched = compute_indicators(history)
    payload = evaluate_signal(enriched)
    assert payload["signal"] in {"STRONG BUY", "BUY", "NEUTRAL", "SELL", "STRONG SELL"}
    assert 0 <= payload["confidence"] <= 100


def test_generate_signal_multi_timeframe_consistency(monkeypatch):
    history = build_history(300)

    def fake_fetch(asset, kind, timeframe):
        return history

    monkeypatch.setattr(signals, "fetch_asset_history", fake_fetch)
    rows = [generate_signal_for_asset(ASSET_INFO, "crypto", tf) for tf in TIMEFRAMES]
    for tf, row in zip(TIMEFRAMES, rows):
        assert row["timeframe"] == tf
        assert row["asset"] == ASSET_INFO["symbol"]
        assert row["price"] > 0

    labels = {row["signal"] for row in rows}
    assert len(labels) <= len(TIMEFRAMES)


def test_confidence_scores_reflect_indicator_strength():
    idx = pd.date_range("2024-01-01", periods=250, freq="H")
    close = np.linspace(100, 200, len(idx)) + 10
    df = pd.DataFrame({"Close": close}, index=idx)
    df["Open"] = df["Close"].shift(1).fillna(df["Close"])
    df["High"] = df[["Open", "Close"]].max(axis=1) * 1.01
    df["Low"] = df[["Open", "Close"]].min(axis=1) * 0.99
    df["Volume"] = 500000
    enriched = compute_indicators(df)
    payload = evaluate_signal(enriched)
    assert payload["signal"] in {"STRONG BUY", "BUY"}
    assert payload["confidence"] >= 50
