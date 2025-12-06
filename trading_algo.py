"""Indicator computation and strategy scaffolding for TradeBot v5.0."""

from typing import Dict

import numpy as np
import pandas as pd


def compute_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Annotate a OHLCV dataframe with common indicators."""
    df = df.copy()
    df["EMA20"] = df["Close"].ewm(span=20).mean()
    df["EMA50"] = df["Close"].ewm(span=50).mean()
    df["EMA200"] = df["Close"].ewm(span=200).mean()
    delta = df["Close"].diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = -delta.clip(upper=0).rolling(14).mean()
    rs = gain / loss.replace({0: np.nan})
    df["RSI"] = 100 - (100 / (1 + rs))
    ema12 = df["Close"].ewm(span=12).mean()
    ema26 = df["Close"].ewm(span=26).mean()
    df["MACD"] = ema12 - ema26
    df["MACD_SIGNAL"] = df["MACD"].ewm(span=9).mean()
    df["BB_MID"] = df["Close"].rolling(20).mean()
    df["BB_STD"] = df["Close"].rolling(20).std()
    df["BB_UPPER"] = df["BB_MID"] + 2 * df["BB_STD"]
    df["BB_LOWER"] = df["BB_MID"] - 2 * df["BB_STD"]
    return df


def evaluate_signal(df: pd.DataFrame) -> Dict[str, float]:
    """Generate a signal label and confidence based on multiple indicators."""
    latest = df.iloc[-1]
    bullish = 0
    bearish = 0
    if latest["Close"] > latest["EMA20"] > latest["EMA50"]:
        bullish += 1
    elif latest["Close"] < latest["EMA20"] < latest["EMA50"]:
        bearish += 1
    if latest["MACD"] > latest["MACD_SIGNAL"]:
        bullish += 1
    else:
        bearish += 1
    if latest["RSI"] < 30:
        bullish += 1
    elif latest["RSI"] > 70:
        bearish += 1
    if latest["Close"] < latest["BB_LOWER"]:
        bullish += 1
    elif latest["Close"] > latest["BB_UPPER"]:
        bearish += 1
    confidence = int(min(100, (abs(bullish - bearish) / 4) * 100))
    score = bullish - bearish
    if score >= 3:
        label = "STRONG BUY"
    elif score == 2:
        label = "BUY"
    elif score == 1:
        label = "NEUTRAL"
    elif score == -1:
        label = "NEUTRAL"
    elif score == -2:
        label = "SELL"
    else:
        label = "STRONG SELL"
    return {"signal": label, "confidence": confidence}
