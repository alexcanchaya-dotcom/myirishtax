"use client";

import type { ReactNode } from "react";
import { useSubscription } from "@/lib/hooks/useSubscription";

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
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { features, isLoading } = useSubscription();

  if (isLoading) {
    return <div className="h-16 animate-pulse rounded-2xl bg-white" />;
  }

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

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="card text-sm text-ink-muted">
      This extra is not available yet. The free calculators stay open without a paid plan.
    </div>
  );
}
