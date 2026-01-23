"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FeatureGate } from "@/components/paywall/FeatureGate";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const SUPPORTED_EXCHANGES = {
  crypto: [
    { id: 'binance', name: 'Binance', logo: '🔶' },
    { id: 'coinbase', name: 'Coinbase', logo: '🔵' },
    { id: 'kraken', name: 'Kraken', logo: '🐙' },
    { id: 'cryptocom', name: 'Crypto.com', logo: '💳' },
    { id: 'revolut', name: 'Revolut (Crypto)', logo: '💷' },
  ],
  stocks: [
    { id: 'degiro', name: 'Degiro', logo: '📊' },
    { id: 'trading212', name: 'Trading 212', logo: '📈' },
    { id: 'ibkr', name: 'Interactive Brokers', logo: '🏦' },
    { id: 'revolut', name: 'Revolut (Stocks)', logo: '💷' },
  ],
};

interface UploadResult {
  success: boolean;
  message: string;
  transactionsImported?: number;
  errors?: string[];
}

export default function ImportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedExchange, setSelectedExchange] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedExchange) return;

    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('exchange', selectedExchange);

      const response = await fetch('/api/portfolio/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `Successfully imported ${data.transactionsImported} transactions!`,
          transactionsImported: data.transactionsImported,
        });
        setFile(null);
        setSelectedExchange('');
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to import transactions',
          errors: data.errors,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FeatureGate feature="uploadCSV">
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portfolio
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Import Transactions</h1>
          <p className="text-gray-600">
            Upload CSV files from your crypto exchanges or stock brokers to automatically
            calculate your capital gains tax
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How to Import</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Export your transaction history as CSV from your exchange/broker</li>
                <li>Select the exchange below</li>
                <li>Upload the CSV file</li>
                <li>We'll automatically calculate your capital gains and tax liability</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Exchange Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Exchange or Broker
          </h2>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Cryptocurrency Exchanges</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SUPPORTED_EXCHANGES.crypto.map((exchange) => (
                <button
                  key={exchange.id}
                  onClick={() => setSelectedExchange(exchange.id)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedExchange === exchange.id
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{exchange.logo}</div>
                  <div className="font-medium text-gray-900">{exchange.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Stock Brokers</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SUPPORTED_EXCHANGES.stocks.map((exchange) => (
                <button
                  key={`${exchange.id}-stocks`}
                  onClick={() => setSelectedExchange(exchange.id)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedExchange === exchange.id
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{exchange.logo}</div>
                  <div className="font-medium text-gray-900">{exchange.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>

          {!selectedExchange ? (
            <div className="text-center py-12 text-gray-500">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Select an exchange first to upload transactions</p>
            </div>
          ) : (
            <div>
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  {file ? (
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-900">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500 mt-1">CSV files only</p>
                    </div>
                  )}
                </div>
              </label>

              {file && (
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Import Transactions
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Result Message */}
        {result && (
          <div
            className={`rounded-lg p-6 ${
              result.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3
                  className={`font-semibold mb-2 ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  {result.message}
                </h3>
                {result.errors && (
                  <ul className="list-disc list-inside text-sm text-red-800">
                    {result.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                )}
                {result.success && (
                  <Link
                    href="/portfolio"
                    className="inline-block mt-3 text-sm font-medium text-green-700 hover:text-green-800"
                  >
                    View Portfolio →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-gray-50 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Where to find CSV exports:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Binance:</strong> Orders → Trade History → Export Complete Order History</li>
              <li><strong>Coinbase:</strong> Settings → Tax Center → Generate Report → Transactions</li>
              <li><strong>Kraken:</strong> History → Export → Ledgers</li>
              <li><strong>Degiro:</strong> Activity → Account → Export</li>
              <li><strong>Trading 212:</strong> History → Export</li>
            </ul>
            <p className="mt-4">
              <strong>Having trouble?</strong> Contact support@myirishtax.com with your exchange
              name and we'll help you get set up.
            </p>
          </div>
        </div>
      </main>
    </FeatureGate>
  );
}
