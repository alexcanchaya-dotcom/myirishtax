"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FeatureGate } from "@/components/paywall/FeatureGate";
import {
  Link as LinkIcon,
  Unlink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  ArrowLeft,
  Settings,
} from "lucide-react";
import Link from "next/link";

interface Connection {
  id: string;
  exchangeId: string;
  exchangeName: string;
  accountName?: string;
  connectionType: string;
  status: string;
  autoSync: boolean;
  lastSyncAt?: string;
  lastSyncStatus?: string;
  syncFrequency: string;
  createdAt: string;
}

const EXCHANGE_LOGOS: Record<string, string> = {
  binance: "🔶",
  coinbase: "🔵",
  kraken: "🐙",
  revolut: "💷",
  trading212: "📈",
  degiro: "📊",
  ibkr: "🏦",
};

export default function ConnectionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState("");

  // Handle success/error messages from OAuth callback
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/integrations/connect");
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections);
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (connectionId: string) => {
    setIsSyncing(connectionId);
    try {
      const response = await fetch("/api/integrations/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully synced ${data.transactionsNew} new transactions!`);
        fetchConnections();
      } else {
        const data = await response.json();
        alert(`Sync failed: ${data.error}`);
      }
    } catch (error) {
      alert("Network error during sync");
    } finally {
      setIsSyncing(null);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing("all");
    try {
      const response = await fetch("/api/integrations/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncAll: true }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchConnections();
      } else {
        const data = await response.json();
        alert(`Sync failed: ${data.error}`);
      }
    } catch (error) {
      alert("Network error during sync");
    } finally {
      setIsSyncing(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm("Are you sure you want to disconnect this exchange?")) {
      return;
    }

    try {
      const response = await fetch(`/api/integrations/connect?id=${connectionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchConnections();
      } else {
        alert("Failed to disconnect exchange");
      }
    } catch (error) {
      alert("Network error");
    }
  };

  const handleConnectOAuth = (exchangeId: string) => {
    window.location.href = `/api/integrations/oauth/authorize?exchange=${exchangeId}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <FeatureGate feature="uploadCSV">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portfolio
        </Link>

        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Exchange Connections
              </h1>
              <p className="text-gray-600">
                Connect your exchanges and brokers for automatic transaction syncing
              </p>
            </div>
            <div className="flex gap-3">
              {connections.length > 0 && (
                <button
                  onClick={handleSyncAll}
                  disabled={isSyncing === "all"}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isSyncing === "all" ? "animate-spin" : ""}`}
                  />
                  Sync All
                </button>
              )}
              <button
                onClick={() => setShowConnectModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
              >
                <Plus className="h-4 w-4" />
                Connect Exchange
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Successfully connected!</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Connection error: {error}</span>
            </div>
          </div>
        )}

        {/* Connections List */}
        {connections.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <LinkIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Connections Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Connect your exchanges to automatically sync transactions and calculate taxes
            </p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              Connect Your First Exchange
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">
                      {EXCHANGE_LOGOS[connection.exchangeId] || "🔗"}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {connection.exchangeName}
                      </h3>
                      {connection.accountName && (
                        <p className="text-sm text-gray-600">{connection.accountName}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            connection.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {connection.status === "active" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          {connection.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {connection.connectionType === "oauth" ? "OAuth" : "API Key"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSync(connection.id)}
                      disabled={isSyncing === connection.id}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          isSyncing === connection.id ? "animate-spin" : ""
                        }`}
                      />
                      Sync
                    </button>
                    <button
                      onClick={() => handleDisconnect(connection.id)}
                      className="flex items-center gap-2 px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Disconnect
                    </button>
                  </div>
                </div>

                {/* Sync Status */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      {connection.lastSyncAt ? (
                        <span>
                          Last synced:{" "}
                          {new Date(connection.lastSyncAt).toLocaleString()}
                        </span>
                      ) : (
                        <span>Never synced</span>
                      )}
                    </div>
                    {connection.lastSyncStatus && (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          connection.lastSyncStatus === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {connection.lastSyncStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Connect Exchange Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Connect Exchange
              </h2>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Cryptocurrency Exchanges
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleConnectOAuth("coinbase")}
                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-brand-600 transition-colors text-left"
                  >
                    <div className="text-3xl mb-2">🔵</div>
                    <div className="font-medium text-gray-900">Coinbase</div>
                    <div className="text-xs text-gray-500 mt-1">OAuth Connection</div>
                  </button>

                  <button
                    onClick={() => setSelectedExchange("binance")}
                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-brand-600 transition-colors text-left"
                  >
                    <div className="text-3xl mb-2">🔶</div>
                    <div className="font-medium text-gray-900">Binance</div>
                    <div className="text-xs text-gray-500 mt-1">API Key Required</div>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Key Connection Modal */}
        {selectedExchange && (
          <ApiKeyConnectionModal
            exchangeId={selectedExchange}
            exchangeName={selectedExchange === "binance" ? "Binance" : selectedExchange}
            onClose={() => setSelectedExchange("")}
            onSuccess={() => {
              setSelectedExchange("");
              setShowConnectModal(false);
              fetchConnections();
            }}
          />
        )}
      </main>
    </FeatureGate>
  );
}

// API Key Connection Modal Component
function ApiKeyConnectionModal({
  exchangeId,
  exchangeName,
  onClose,
  onSuccess,
}: {
  exchangeId: string;
  exchangeName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [apiPassphrase, setApiPassphrase] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/integrations/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exchangeId,
          apiKey,
          apiSecret,
          apiPassphrase,
          accountName,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to connect");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Connect {exchangeName}
        </h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name (Optional)
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="My Trading Account"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key *
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Secret *
            </label>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {exchangeId === "coinbase_pro" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Passphrase *
              </label>
              <input
                type="password"
                value={apiPassphrase}
                onChange={(e) => setApiPassphrase(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
            >
              {isSubmitting ? "Connecting..." : "Connect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
