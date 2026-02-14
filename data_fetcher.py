"""Data ingestion utilities for TradeBot v5.0."""

import datetime as dt
from typing import Dict

import numpy as np
import pandas as pd
import requests
import yfinance as yf


def _simulate_history(days: int = 90, freq: str = "1h") -> pd.DataFrame:
    """Create a deterministic synthetic OHLCV series when APIs are unavailable."""
    rng = pd.date_range(end=dt.datetime.utcnow(), periods=days * 24, freq=freq)
    prices = np.cumsum(np.random.default_rng(42).normal(0, 1, len(rng))) + 100
    df = pd.DataFrame({"Close": prices}, index=rng)
    df["Open"] = df["Close"].shift(1).fillna(df["Close"])
    df["High"] = df[["Open", "Close"]].max(axis=1) * 1.01
    df["Low"] = df[["Open", "Close"]].min(axis=1) * 0.99
    df["Volume"] = np.abs(np.random.default_rng(0).normal(1_000_000, 50_000, len(rng)))
    return df


def fetch_stock_history(ticker: str, period: str = "6mo", interval: str = "1h") -> pd.DataFrame:
    """Download stock history via yfinance and resample to 4h if needed."""
    yf_interval = "60m" if interval in {"1h", "4h"} else "1d"
    try:
        data = yf.download(ticker, period=period, interval=yf_interval, progress=False)
        if data.empty:
            raise ValueError("Empty dataframe from yfinance")
    except Exception:
        return _simulate_history()
    if interval == "4h":
        data = data.resample("4h").agg({"Open": "first", "High": "max", "Low": "min", "Close": "last", "Volume": "sum"}).dropna()
    return data


def fetch_crypto_history(coin_id: str, days: int = 180, interval: str = "hourly") -> pd.DataFrame:
    """Pull crypto market chart data from CoinGecko."""
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
    params = {"vs_currency": "usd", "days": days, "interval": interval}
    try:
        resp = requests.get(url, params=params, timeout=15)
        resp.raise_for_status()
        payload = resp.json()
        prices = payload.get("prices", [])
        volumes = payload.get("total_volumes", [])
        if not prices:
            raise ValueError("Empty price series")
        df = pd.DataFrame(prices, columns=["Date", "Close"])
        df["Volume"] = [v[1] for v in volumes[: len(df)]]
        df["Date"] = pd.to_datetime(df["Date"], unit="ms")
        df.set_index("Date", inplace=True)
        df["Open"] = df["Close"].shift(1).fillna(df["Close"])
        df["High"] = df[["Open", "Close"]].max(axis=1) * 1.01
        df["Low"] = df[["Open", "Close"]].min(axis=1) * 0.99
    except Exception:
        df = _simulate_history(days=days)
    if interval == "4h":
        df = df.resample("4h").agg({"Open": "first", "High": "max", "Low": "min", "Close": "last", "Volume": "sum"}).dropna()
    elif interval == "1d":
        df = df.resample("1d").agg({"Open": "first", "High": "max", "Low": "min", "Close": "last", "Volume": "sum"}).dropna()
    return df


def latest_price(row: pd.Series) -> float:
    """Return the latest closing price from a price frame."""
    return float(row.iloc[-1]) if isinstance(row, pd.Series) else float(row)


def fetch_asset_history(asset: Dict[str, str], kind: str, timeframe: str) -> pd.DataFrame:
    """Router for fetching either crypto or equity time series."""
    if kind == "crypto":
        interval = "hourly" if timeframe == "1h" else "daily"
        if timeframe == "4h":
            interval = "hourly"
        return fetch_crypto_history(asset["coingecko"], interval=interval)
    interval = "1h" if timeframe in {"1h", "4h"} else "1d"
    return fetch_stock_history(asset if isinstance(asset, str) else asset["yfinance"], interval=interval)
