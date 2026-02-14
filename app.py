"""TradeBot v5.0 Gradio interface (<100 lines)."""

import datetime as dt
import gradio as gr
import pandas as pd
import plotly.express as px

from assets import TOP_CRYPTO, TOP_STOCKS
from backtester import run_backtest
from data_fetcher import fetch_asset_history
from signals import TIMEFRAMES, generate_signal_for_asset, scan_universe
from trading_algo import compute_indicators


def scan_assets(progress=gr.Progress(track_tqdm=False)):
    progress(0, desc="Scanning 150 assets across timeframes")
    df = scan_universe()
    progress(1, desc="Scan complete")
    return df


def analyze_asset(asset: str, kind: str, timeframe: str):
    listing = next((c for c in TOP_CRYPTO if c["symbol"] == asset), asset)
    history = fetch_asset_history(listing, kind, timeframe)
    enriched = compute_indicators(history).dropna()
    fig = px.line(enriched.reset_index(), x="Date", y="Close", title=f"{asset} {timeframe} trend")
    fig.add_scatter(x=enriched.index, y=enriched["EMA20"], mode="lines", name="EMA20")
    sig = generate_signal_for_asset(listing, kind, timeframe)
    summary = f"Signal: {sig['signal']} | Confidence: {sig['confidence']}% | Price: ${sig['price']:.2f}"
    return summary, fig


def backtest(asset: str, kind: str, timeframe: str):
    listing = next((c for c in TOP_CRYPTO if c["symbol"] == asset), asset)
    results = run_backtest(listing, kind, timeframe)
    curve_fig = px.line(results["equity_curve"], title="Equity Curve")
    log = results["trade_log"] if not results["trade_log"].empty else pd.DataFrame([{"notice": "No trades generated"}])
    metrics = {
        "Win rate %": round(results["win_rate"], 2),
        "Total P&L": round(results["total_pnl"], 2),
        "Best": round(results["best_trade"], 2),
        "Worst": round(results["worst_trade"], 2),
    }
    return metrics, curve_fig, log


def live_dashboard():
    rows = []
    for asset in TOP_CRYPTO[:5] + TOP_STOCKS[:5]:
        kind = "crypto" if isinstance(asset, dict) else "stock"
        symbol = asset["symbol"] if isinstance(asset, dict) else asset
        sig = generate_signal_for_asset(asset, kind, "1h")
        rows.append({"Asset": symbol, "Signal": sig["signal"], "Confidence": sig["confidence"], "Timestamp": dt.datetime.utcnow()})
    return pd.DataFrame(rows)


with gr.Blocks(title="TradeBot v5.0") as demo:
    gr.Markdown("# TradeBot v5.0 — Professional Crypto & Stock Trading Platform")
    with gr.Tab("Asset Scanner"):
        gr.Dataframe(visible=False)  # placeholder for HF Spaces caching bug
        scan_btn = gr.Button("Run Scan")
        scan_table = gr.Dataframe(headers=["Asset", "Timeframe", "signal", "confidence", "asset", "price"], interactive=False)
        scan_btn.click(fn=scan_assets, outputs=scan_table)
    with gr.Tab("Individual Chart"):
        asset_drop = gr.Dropdown([c["symbol"] for c in TOP_CRYPTO] + TOP_STOCKS, label="Asset")
        kind_radio = gr.Radio(["crypto", "stock"], value="crypto", label="Type")
        tf_radio = gr.Radio(TIMEFRAMES, value="1d", label="Timeframe")
        summary = gr.Markdown()
        chart = gr.Plot()
        gr.Button("Analyze").click(analyze_asset, inputs=[asset_drop, kind_radio, tf_radio], outputs=[summary, chart])
    with gr.Tab("Backtesting"):
        asset_bt = gr.Dropdown([c["symbol"] for c in TOP_CRYPTO] + TOP_STOCKS, label="Asset")
        kind_bt = gr.Radio(["crypto", "stock"], value="crypto", label="Type")
        tf_bt = gr.Radio(TIMEFRAMES, value="1d", label="Timeframe")
        metrics = gr.JSON()
        curve = gr.Plot()
        log = gr.Dataframe()
        gr.Button("Run Backtest").click(backtest, inputs=[asset_bt, kind_bt, tf_bt], outputs=[metrics, curve, log])
    with gr.Tab("Live Dashboard"):
        live_btn = gr.Button("Update Now")
        live_table = gr.Dataframe()
        live_btn.click(live_dashboard, outputs=live_table)

if __name__ == "__main__":
    demo.queue().launch()
