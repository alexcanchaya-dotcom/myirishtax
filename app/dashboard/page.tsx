"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calculator, FileText, Crown, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedCalculations, setSavedCalculations] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

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

  const tierColors = {
    FREE: "bg-gray-100 text-gray-800",
    PREMIUM: "bg-blue-100 text-blue-800",
    PROFESSIONAL: "bg-purple-100 text-purple-800",
  };

  const tierColor =
    tierColors[session.user.subscriptionTier as keyof typeof tierColors] ||
    tierColors.FREE;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your tax calculations and subscription
          </p>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Current Plan
              </h2>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full font-medium ${tierColor}`}>
                  {session.user.subscriptionTier}
                </span>
                {session.user.subscriptionTier === "FREE" && (
                  <Link
                    href="/dashboard/subscription"
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Upgrade to unlock more features →
                  </Link>
                )}
              </div>
            </div>
            {session.user.subscriptionTier !== "FREE" && (
              <Crown className="h-12 w-12 text-purple-600" />
            )}
          </div>

          {session.user.subscriptionTier === "FREE" && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                Unlock Premium Features
              </h3>
              <ul className="space-y-1 text-sm text-gray-700 mb-4">
                <li>✓ All tax years (2023-2026)</li>
                <li>✓ PDF exports</li>
                <li>✓ Redundancy & rental calculators</li>
                <li>✓ Save calculations</li>
              </ul>
              <Link
                href="/dashboard/subscription"
                className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium"
              >
                View Plans
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <Calculator className="h-8 w-8 text-brand-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">
              PAYE Calculator
            </h3>
            <p className="text-sm text-gray-600">
              Calculate your take-home pay
            </p>
          </Link>

          <Link
            href="/redundancy-calculator"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <TrendingUp className="h-8 w-8 text-brand-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">
              Redundancy Calculator
            </h3>
            <p className="text-sm text-gray-600">
              Calculate redundancy payments
            </p>
          </Link>

          <Link
            href="/dashboard/calculations"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <FileText className="h-8 w-8 text-brand-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">
              Saved Calculations
            </h3>
            <p className="text-sm text-gray-600">
              View your saved calculations
            </p>
          </Link>
        </div>

        {/* Recent Calculations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Calculations
          </h2>
          {session.user.subscriptionTier === "FREE" ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">
                Upgrade to Premium to save your calculations
              </p>
              <Link
                href="/dashboard/subscription"
                className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium"
              >
                Upgrade Now
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              No saved calculations yet. Start calculating to save your results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
