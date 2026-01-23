"use client";

import { useState } from "react";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { PaywallModal } from "./PaywallModal";
import { Lock } from "lucide-react";

interface FeatureGateProps {
  feature:
    | "exportPDF"
    | "saveCalculations"
    | "aiAssistant"
    | "uploadCSV"
    | "redundancy"
    | "rental"
    | "contractor"
    | "fullReturn"
    | "allYears";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const featureLabels = {
  exportPDF: "PDF Exports",
  saveCalculations: "Save Calculations",
  aiAssistant: "AI Tax Assistant",
  uploadCSV: "CSV Uploads",
  redundancy: "Redundancy Calculator",
  rental: "Rental Income Calculator",
  contractor: "Contractor Calculator",
  fullReturn: "Full Tax Return",
  allYears: "All Tax Years",
};

const featureRequirements = {
  exportPDF: "PREMIUM" as const,
  saveCalculations: "PREMIUM" as const,
  aiAssistant: "PROFESSIONAL" as const,
  uploadCSV: "PROFESSIONAL" as const,
  redundancy: "PREMIUM" as const,
  rental: "PREMIUM" as const,
  contractor: "PREMIUM" as const,
  fullReturn: "PROFESSIONAL" as const,
  allYears: "PREMIUM" as const,
};

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { features, isLoading } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 rounded h-20"></div>;
  }

  // Check if user has access based on feature
  const hasAccess = (() => {
    switch (feature) {
      case "exportPDF":
        return features.canExportPDF;
      case "saveCalculations":
        return features.canSaveCalculations;
      case "aiAssistant":
        return features.canUseAIAssistant;
      case "uploadCSV":
        return features.canUploadCSV;
      case "redundancy":
        return features.canUseRedundancyCalculator;
      case "rental":
        return features.canUseRentalCalculator;
      case "contractor":
        return features.canUseContractorCalculator;
      case "fullReturn":
        return features.canUseFullReturn;
      case "allYears":
        return features.canAccessAllYears;
      default:
        return false;
    }
  })();

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback or default locked UI
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none opacity-50 blur-sm">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => setShowPaywall(true)}
            className="bg-white shadow-lg rounded-lg px-6 py-3 flex items-center gap-2 hover:shadow-xl transition-shadow"
          >
            <Lock className="h-5 w-5 text-brand-600" />
            <span className="font-medium text-gray-900">
              Unlock {featureLabels[feature]}
            </span>
          </button>
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature={featureLabels[feature]}
        requiredTier={featureRequirements[feature]}
      />
    </>
  );
}
