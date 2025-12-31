import { NextRequest, NextResponse } from "next/server"

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyPrefix?: string
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  default: { windowMs: 60 * 1000, maxRequests: 20, keyPrefix: "rl" },
  ai: { windowMs: 60 * 1000, maxRequests: 5, keyPrefix: "rl:ai" },
  chat: { windowMs: 60 * 1000, maxRequests: 10, keyPrefix: "rl:chat" },
  graphql: { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: "rl:gql" },
  comments: { windowMs: 60 * 1000, maxRequests: 3, keyPrefix: "rl:comment" },
  auth: { windowMs: 60 * 1000, maxRequests: 20, keyPrefix: "rl:auth" },
  supporter: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    keyPrefix: "rl:supporter",
  },
}

const inMemoryCache = new Map<string, { count: number; resetTime: number }>()

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

function createRateLimitKey(
  ip: string,
  config: RateLimitConfig,
  endpoint?: string
): string {
  return `${config.keyPrefix}:${ip}${endpoint ? `:${endpoint}` : ""}`
}

function rateLimitInMemory(
  ip: string,
  config: RateLimitConfig
): { allowed: boolean; resetTime: number; remaining: number } {
  const now = Date.now()
  const key = createRateLimitKey(ip, config)
  const windowStart = now - config.windowMs

  let data = inMemoryCache.get(key)

  if (!data || data.resetTime < windowStart) {
    data = { count: 1, resetTime: now + config.windowMs }
    inMemoryCache.set(key, data)
    return {
      allowed: true,
      resetTime: data.resetTime,
      remaining: config.maxRequests - 1,
    }
  }

  if (data.count >= config.maxRequests) {
    return { allowed: false, resetTime: data.resetTime, remaining: 0 }
  }

  data.count++
  return {
    allowed: true,
    resetTime: data.resetTime,
    remaining: config.maxRequests - data.count,
  }
}

function cleanupInMemoryCache() {
  const now = Date.now()
  for (const [key, data] of inMemoryCache.entries()) {
    if (data.resetTime < now) {
      inMemoryCache.delete(key)
    }
  }
}

setInterval(cleanupInMemoryCache, 5 * 60 * 1000)

export function getRateLimitConfig(pathname: string): RateLimitConfig {
  if (pathname.includes("/api/ai") || pathname.includes("/api/chat")) {
    return RATE_LIMITS.ai
  }
  if (pathname.includes("/api/graphql")) {
    return RATE_LIMITS.graphql
  }
  if (pathname.includes("/api/comments")) {
    return RATE_LIMITS.comments
  }
  if (pathname.includes("/api/auth")) {
    return RATE_LIMITS.auth
  }
  if (pathname.includes("/api/auth/supporter")) {
    return RATE_LIMITS.supporter
  }
  return RATE_LIMITS.default
}

export function rateLimit(
  request: NextRequest,
  config?: RateLimitConfig
): NextResponse | null {
  const pathname = request.nextUrl.pathname
  const effectiveConfig = config || getRateLimitConfig(pathname)
  const ip = getClientIP(request)
  const { allowed, resetTime, remaining } = rateLimitInMemory(
    ip,
    effectiveConfig
  )

  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)

  if (!allowed) {
    return new NextResponse(
      JSON.stringify({
        error: "Too many requests",
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": effectiveConfig.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
          "Content-Type": "application/json",
        },
      }
    )
  }

  return null
}

export function createRateLimitResponse(
  remaining: number,
  limit: number,
  resetTime: number
): NextResponse {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)
  return new NextResponse(null, {
    status: 200,
    headers: {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
      "Retry-After": retryAfter.toString(),
    },
  })
}

export const RATE_LIMITS_CONSTANTS = RATE_LIMITS
