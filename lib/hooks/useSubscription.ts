import { useSession } from 'next-auth/react';

export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'PROFESSIONAL';

export interface SubscriptionFeatures {
  canExportPDF: boolean;
  canSaveCalculations: boolean;
  maxSavedCalculations: number;
  canUseAIAssistant: boolean;
  canUploadCSV: boolean;
  canUseRedundancyCalculator: boolean;
  canUseRentalCalculator: boolean;
  canUseContractorCalculator: boolean;
  canUseFullReturn: boolean;
  canAccessAllYears: boolean;
}

const tierFeatures: Record<SubscriptionTier, SubscriptionFeatures> = {
  FREE: {
    canExportPDF: false,
    canSaveCalculations: false,
    maxSavedCalculations: 0,
    canUseAIAssistant: false,
    canUploadCSV: false,
    canUseRedundancyCalculator: false,
    canUseRentalCalculator: false,
    canUseContractorCalculator: false,
    canUseFullReturn: false,
    canAccessAllYears: false,
  },
  PREMIUM: {
    canExportPDF: true,
    canSaveCalculations: true,
    maxSavedCalculations: 10,
    canUseAIAssistant: false,
    canUploadCSV: false,
    canUseRedundancyCalculator: true,
    canUseRentalCalculator: true,
    canUseContractorCalculator: true,
    canUseFullReturn: false,
    canAccessAllYears: true,
  },
  PROFESSIONAL: {
    canExportPDF: true,
    canSaveCalculations: true,
    maxSavedCalculations: 999,
    canUseAIAssistant: true,
    canUploadCSV: true,
    canUseRedundancyCalculator: true,
    canUseRentalCalculator: true,
    canUseContractorCalculator: true,
    canUseFullReturn: true,
    canAccessAllYears: true,
  },
};

export function useSubscription() {
  const { data: session, status } = useSession();

  const tier: SubscriptionTier = (session?.user?.subscriptionTier as SubscriptionTier) || 'FREE';
  const isActive = session?.user?.subscriptionStatus === 'active';
  const features = tierFeatures[tier];

  return {
    tier,
    isActive,
    features,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    isPremium: tier === 'PREMIUM' || tier === 'PROFESSIONAL',
    isProfessional: tier === 'PROFESSIONAL',
  };
}
