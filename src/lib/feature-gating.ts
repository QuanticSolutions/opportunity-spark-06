/**
 * Feature gating based on subscription plan tier.
 * Tiers: basic (1), pro (2), enterprise (3)
 */

export type Feature =
  | "post_opportunities"
  | "view_applicants"
  | "shortlisting"
  | "advanced_filters"
  | "team_access"
  | "analytics"
  | "priority_support"
  | "api_access";

const featureMinTier: Record<Feature, number> = {
  post_opportunities: 1,
  view_applicants: 1,
  shortlisting: 2,
  advanced_filters: 2,
  team_access: 2,
  analytics: 2,
  priority_support: 3,
  api_access: 3,
};

export function checkFeatureAccess(planTier: number | null, feature: Feature): boolean {
  if (!planTier) return false;
  return planTier >= featureMinTier[feature];
}

export function getPostingLimit(planTier: number | null, postingLimit: number | null): number {
  if (planTier === 3 || postingLimit === null) return Infinity;
  return postingLimit ?? 0;
}

// Stripe price/product mapping
export const STRIPE_PLANS = {
  basic: {
    price_id: "price_1THDeS3JfkUP0GaDQ4EmD5xe",
    product_id: "prod_UFj6A7TFnZCno0",
  },
  pro: {
    price_id: "price_1THDey3JfkUP0GaDi0SmQWzM",
    product_id: "prod_UFj7bBqwr81MOD",
  },
  enterprise: {
    price_id: "price_1THDfX3JfkUP0GaDX8mnwZCd",
    product_id: "prod_UFj7In8YHGULnK",
  },
} as const;

export function getStripePriceForPlan(planName: string): string | null {
  const key = planName.toLowerCase() as keyof typeof STRIPE_PLANS;
  return STRIPE_PLANS[key]?.price_id ?? null;
}
