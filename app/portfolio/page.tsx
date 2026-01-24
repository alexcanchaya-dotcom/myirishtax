"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FeatureGate } from "@/components/paywall/FeatureGate";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Upload,
  Download,
  Calculator,
  FileText,
  BarChart3,
  PieChart,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  realizedGains: number;
  unrealizedGains: number;
  cgtDue: number;
}

interface Holding {
  symbol: string;
  name: string;
  type: 'crypto' | 'stock' | 'etf';
  quantity: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  gain: number;
  gainPercent: number;
}

export default function PortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [summary, setSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    totalCost: 0,
    totalGain: 0,
    totalGainPercent: 0,
    realizedGains: 0,
    unrealizedGains: 0,
    cgtDue: 0,
  });
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch portfolio data
    const fetchPortfolio = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/portfolio/summary?year=${selectedYear}`);
        if (response.ok) {
          const data = await response.json();
          setSummary(data.summary);
          setHoldings(data.holdings);
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchPortfolio();
    }
  }, [status, selectedYear]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <FeatureGate feature="uploadCSV">
      <main className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Portfolio</h1>
            <p className="text-gray-600 mt-2">
              Track your crypto and stock investments with automatic tax calculations
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/portfolio/import"
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
            >
              <Upload className="h-4 w-4" />
              Import Transactions
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Value</span>
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              €{summary.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Cost: €{summary.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Gain/Loss</span>
              {summary.totalGain >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className={`text-3xl font-bold ${summary.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.totalGain >= 0 ? '+' : ''}€{summary.totalGain.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className={`text-sm mt-1 ${summary.totalGainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.totalGainPercent >= 0 ? '+' : ''}{summary.totalGainPercent.toFixed(2)}%
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Unrealized Gains</span>
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              €{summary.unrealizedGains.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Not yet taxable
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">CGT Due ({selectedYear})</span>
              <Calculator className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600">
              €{summary.cgtDue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              On €{summary.realizedGains.toLocaleString()} gains
            </div>
          </div>
        </div>

        {/* Tax Year Selector */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Tax Year: {selectedYear}</h3>
              <p className="text-sm text-gray-700">
                Viewing realized gains and CGT for tax year {selectedYear}.
                CGT due by 15 December {selectedYear}.
              </p>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Current Holdings</h2>
              <div className="flex gap-2">
                <button className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                  All
                </button>
                <button className="text-sm px-3 py-1 text-gray-600 hover:bg-gray-100 rounded">
                  Crypto
                </button>
                <button className="text-sm px-3 py-1 text-gray-600 hover:bg-gray-100 rounded">
                  Stocks
                </button>
                <button className="text-sm px-3 py-1 text-gray-600 hover:bg-gray-100 rounded">
                  ETFs
                </button>
              </div>
            </div>
          </div>

          {holdings.length === 0 ? (
            <div className="p-12 text-center">
              <PieChart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Holdings Yet</h3>
              <p className="text-gray-600 mb-6">
                Import your transactions from crypto exchanges or stock brokers to get started
              </p>
              <Link
                href="/portfolio/import"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
              >
                <Upload className="h-4 w-4" />
                Import Transactions
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Asset
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Avg Cost
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Current Price
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Value
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Gain/Loss
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {holdings.map((holding, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{holding.symbol}</div>
                          <div className="text-sm text-gray-500">{holding.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {holding.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        {holding.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        €{holding.avgCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        €{holding.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        €{holding.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <div className={holding.gain >= 0 ? 'text-green-600' : 'text-red-600'}>
                          <div className="font-medium">
                            {holding.gain >= 0 ? '+' : ''}€{holding.gain.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs">
                            {holding.gainPercent >= 0 ? '+' : ''}{holding.gainPercent.toFixed(2)}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/portfolio/transactions"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <FileText className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">View Transactions</h3>
            <p className="text-sm text-gray-600">
              See all your buys, sells, and trades
            </p>
          </Link>

          <Link
            href="/portfolio/tax-report"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <Calculator className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Tax Report</h3>
            <p className="text-sm text-gray-600">
              Generate CGT report for accountant
            </p>
          </Link>

          <Link
            href="/portfolio/import"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <Plus className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Add Transactions</h3>
            <p className="text-sm text-gray-600">
              Import from exchanges or add manually
            </p>
          </Link>
        </div>
      </main>
    </FeatureGate>
  );
}
