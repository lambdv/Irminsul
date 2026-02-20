# Pricing Page Fix - Implementation Plan

## Overview

Add fallback pricing display when Stripe API fails to fetch products.

## Files to Create/Modify

### 1. Create: `src/lib/pricing/fallback.ts`

```typescript
export interface PriceInfo {
  priceId: string
  amount: number
  currency: string
  display: string
}

export interface TierPricing {
  productId: string
  monthly: PriceInfo | null
  yearly: PriceInfo | null
  isFallback?: boolean
}

export const FALLBACK_PRICING: Record<string, TierPricing> = {
  pro: {
    productId: process.env.PRO_TIER_ID || "prod_TzI3uWmJzARRzG",
    monthly: {
      priceId: "fallback_pro_monthly",
      amount: 2000,
      currency: "usd",
      display: "$20.00",
    },
    yearly: {
      priceId: "fallback_pro_yearly",
      amount: 19200,
      currency: "usd",
      display: "$192.00",
    },
    isFallback: true,
  },
  ultra: {
    productId: process.env.ULTRA_TIER_ID || "prod_TzI49ySGFdxmKU",
    monthly: {
      priceId: "fallback_ultra_monthly",
      amount: 6000,
      currency: "usd",
      display: "$60.00",
    },
    yearly: {
      priceId: "fallback_ultra_yearly",
      amount: 57600,
      currency: "usd",
      display: "$576.00",
    },
    isFallback: true,
  },
}
```

### 2. Modify: `src/app/api/pricing/tiers/route.ts`

Import and use FALLBACK_PRICING when Stripe API fails:

- Import FALLBACK_PRICING from fallback module
- In catch block, return fallback pricing instead of null pricing
- Include isFallback flag in response

### 3. Modify: `src/app/(main)/pricing/PricingTiers.tsx`

- Add visual indicator when isFallback is true
- Optional: Show tooltip explaining pricing is temporarily unavailable

## Implementation Steps

1. Create fallback.ts with exact prices from Stripe
2. Update API route to return fallback on error
3. Update component to handle isFallback flag
4. Test the pricing page

## Testing Checklist

- [ ] Pricing page loads without errors
- [ ] Pro tier shows $20.00/mo or $192.00/yr
- [ ] Ultra tier shows $60.00/mo or $576.00/yr
- [ ] Visual indicator shows when using fallback
