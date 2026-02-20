const DEFAULT_PRO_TIER_ID = "prod_TzI3uWmJzARRzG"
const DEFAULT_ULTRA_TIER_ID = "prod_TzI49ySGFdxmKU"

export const PRO_TIER_ID = process.env.PRO_TIER_ID || DEFAULT_PRO_TIER_ID
export const ULTRA_TIER_ID =
  process.env.ULTRA_TIER_ID || DEFAULT_ULTRA_TIER_ID

export const TIER_PRODUCT_IDS = {
  pro: PRO_TIER_ID,
  ultra: ULTRA_TIER_ID,
} as const

export type TierKey = keyof typeof TIER_PRODUCT_IDS
