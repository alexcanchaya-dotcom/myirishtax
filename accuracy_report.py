"""Accuracy and classification reporting utilities for TradeBot v5.0."""

from typing import Dict

import numpy as np
import pandas as pd
from sklearn import metrics


def _sharpe_ratio(returns: pd.Series, periods: int = 252, risk_free: float = 0.0) -> float:
    if returns.empty:
        return 0.0
    excess = returns - (risk_free / periods)
    std = excess.std()
    if std == 0 or np.isnan(std):
        return 0.0
    return float((excess.mean() / std) * np.sqrt(periods))


def generate_accuracy_report(
    predicted_signals: pd.Series, actual_returns: pd.Series, risk_free_rate: float = 0.0
) -> Dict[str, object]:
    """
    Build confusion matrix, classification scores, and risk metrics.

    Args:
        predicted_signals: Series of STRONG BUY/BUY/NEUTRAL/SELL/STRONG SELL predictions.
        actual_returns: Series of realized percentage returns aligned to the same index.
        risk_free_rate: Annualized risk-free rate used for Sharpe calculation.
    """

    aligned_returns = actual_returns.loc[predicted_signals.index]
    actual_labels = np.where(aligned_returns > 0, "BUY", "SELL")
    binary_predictions = np.where(predicted_signals.isin(["STRONG BUY", "BUY"]), "BUY", "SELL")

    cm = metrics.confusion_matrix(actual_labels, binary_predictions, labels=["BUY", "SELL"])
    classification = metrics.classification_report(
        actual_labels, binary_predictions, labels=["BUY", "SELL"], output_dict=True, zero_division=0
    )

    strategy_returns = aligned_returns * np.where(binary_predictions == "BUY", 1, -1)
    cumulative_strategy = float((1 + strategy_returns).cumprod().iloc[-1] - 1)
    cumulative_buy_hold = float((1 + aligned_returns).cumprod().iloc[-1] - 1)

    return {
        "confusion_matrix": cm,
        "precision": classification["macro avg"]["precision"],
        "recall": classification["macro avg"]["recall"],
        "f1_score": classification["macro avg"]["f1-score"],
        "cumulative_strategy_return": cumulative_strategy,
        "cumulative_buy_hold_return": cumulative_buy_hold,
        "sharpe_ratio": _sharpe_ratio(strategy_returns, risk_free=risk_free_rate),
        "max_drawdown": float(((1 + strategy_returns).cumprod().cummax() - (1 + strategy_returns).cumprod()).min()),
    }
