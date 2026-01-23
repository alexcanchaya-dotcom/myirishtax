"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, Crown, Sparkles, Loader2 } from "lucide-react";

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const handleUpgrade = async (plan: "premium" | "professional") => {
    setIsLoading(plan);
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
      setIsLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    // TODO: Create Stripe customer portal session
    console.log("Manage subscription");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const currentTier = session.user.subscriptionTier;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Get the tools you need to manage your Irish taxes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-sm p-8 border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">€0</span>
              <span className="text-gray-600">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Basic PAYE calculator
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Current year only</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  View results on screen
                </span>
              </li>
            </ul>

            {currentTier === "FREE" ? (
              <button
                disabled
                className="w-full py-3 px-4 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed"
              >
                Current Plan
              </button>
            ) : (
              <button
                onClick={handleManageSubscription}
                className="w-full py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Downgrade
              </button>
            )}
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-blue-500 text-white text-sm px-4 py-1 rounded-full font-medium">
                POPULAR
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">€9.99</span>
              <span className="text-gray-600">/month</span>
              <p className="text-sm text-gray-600 mt-1">or €79/year (save 34%)</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  All tax years (2023-2026)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">PDF exports</span>
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
                  Contractor calculator
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Save up to 10 calculations
                </span>
              </li>
            </ul>

            {currentTier === "PREMIUM" ? (
              <button
                onClick={handleManageSubscription}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Manage Subscription
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade("premium")}
                disabled={isLoading === "premium"}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading === "premium" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Upgrade to Premium"
                )}
              </button>
            )}
          </div>

          {/* Professional Plan */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm p-8 border-2 border-purple-300">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-900">Professional</h3>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">€24.99</span>
              <span className="text-gray-600">/month</span>
              <p className="text-sm text-gray-600 mt-1">
                or €199/year (save 33%)
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-gray-700">
                  Everything in Premium, plus:
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  AI tax assistant
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
                  Unlimited saved calculations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Priority support</span>
              </li>
            </ul>

            {currentTier === "PROFESSIONAL" ? (
              <button
                onClick={handleManageSubscription}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium"
              >
                Manage Subscription
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade("professional")}
                disabled={isLoading === "professional"}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading === "professional" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Upgrade to Professional"
                )}
              </button>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            All plans include a 7-day money-back guarantee. Cancel anytime.
          </p>
          <p className="text-sm text-gray-500">
            Need help choosing? Contact us at support@myirishtax.com
          </p>
        </div>
      </div>
    </div>
  );
}
