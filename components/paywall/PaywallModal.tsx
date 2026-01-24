"use client";

import { useState } from "react";
import { X, Check, Sparkles, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  requiredTier: "PREMIUM" | "PROFESSIONAL";
}

export function PaywallModal({
  isOpen,
  onClose,
  feature,
  requiredTier,
}: PaywallModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async (plan: "premium" | "professional") => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Upgrade to unlock {feature}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Premium Plan */}
          <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Premium</h3>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">€9.99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">or €79/year (save 34%)</p>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  All tax years (2023-2026)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Redundancy calculator
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Rental income calculator
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Contractor/self-employed calculator
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">PDF exports</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Save up to 10 calculations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Scenario comparisons
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Email support</span>
              </li>
            </ul>

            <button
              onClick={() => handleUpgrade("premium")}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Upgrade to Premium"}
            </button>
          </div>

          {/* Professional Plan */}
          <div className="border-2 border-purple-300 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-pink-50 relative">
            <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              BEST VALUE
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">Professional</h3>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">€24.99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                or €199/year (save 33%)
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 font-medium">
                  Everything in Premium, plus:
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  AI tax assistant (ChatGPT-powered)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  CSV transaction imports
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Full tax return computation
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  CGT, dividends, foreign income
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Unlimited saved calculations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Multi-year tax planning
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Accountant-ready exports
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Priority support</span>
              </li>
            </ul>

            <button
              onClick={() => handleUpgrade("professional")}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Upgrade to Professional"}
            </button>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            All plans include a 7-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
