export function sanitizeString(
  input: string,
  maxLength: number = 10000
): string {
  if (typeof input !== "string") {
    return ""
  }

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
}

export function sanitizeSearchQuery(input: string): string {
  const sanitized = sanitizeString(input, 500)

  const dangerousPatterns = [
    /[\x00-\x1f\x7f]/,
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
    /(--|;|\/\*|\*\/|@@|@)/,
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      return ""
    }
  }

  return sanitized
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export function sanitizeHTMLAttributes(
  attributes: Record<string, string>
): Record<string, string> {
  const allowedAttributes: Record<string, string[]> = {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    iframe: [
      "src",
      "width",
      "height",
      "frameborder",
      "allow",
      "allowfullscreen",
    ],
  }

  const sanitized: Record<string, string> = {}

  for (const [key, value] of Object.entries(attributes)) {
    const lowerKey = key.toLowerCase()
    const allowed = allowedAttributes[lowerKey] || []
    const lowerValue = value.toLowerCase()

    if (allowed.includes(lowerKey)) {
      if (lowerKey === "href") {
        if (
          lowerValue.startsWith("http://") ||
          lowerValue.startsWith("https://")
        ) {
          sanitized[key] = value
        }
      } else if (lowerKey === "src" || lowerKey === "data") {
        if (
          lowerValue.startsWith("http://") ||
          lowerValue.startsWith("https://") ||
          lowerValue.startsWith("data:")
        ) {
          sanitized[key] = value
        }
      } else if (lowerKey === "target") {
        if (lowerValue === "_blank" || lowerValue === "_self") {
          sanitized[key] = value
        }
      } else if (lowerKey === "rel") {
        if (
          lowerValue.includes("noopener") ||
          lowerValue.includes("noreferrer")
        ) {
          sanitized[key] = value
        }
      } else {
        sanitized[key] = value
      }
    }
  }

  return sanitized
}

export function detectPromptInjection(content: string): boolean {
  const injectionPatterns = [
    /ignore (?:previous|all|above) (?:instructions?|rules?)/i,
    /system(?: message)?:/i,
    /you are (?:now |acting as )/i,
    /pretend to be/i,
    /bypass/i,
    /jailbreak/i,
    /developer mode/i,
    /override/i,
    /\\n\\?User:\\s*\n/i,
    /(?:as a|act as) (?:an? )?(?:AI|assistant|bot)/i,
  ]

  for (const pattern of injectionPatterns) {
    if (pattern.test(content)) {
      return true
    }
  }

  return false
}

export function rateLimitByIP(
  ip: string,
  action: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = `rl:${action}:${ip}`
  const now = Date.now()
  const windowStart = now - windowMs

  const data = global.rateLimitStore?.[key]

  if (!data || data.resetTime < windowStart) {
    if (!global.rateLimitStore) {
      global.rateLimitStore = {}
    }
    global.rateLimitStore[key] = { count: 1, resetTime: now + windowMs }
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs }
  }

  if (data.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: data.resetTime }
  }

  data.count++
  return {
    allowed: true,
    remaining: limit - data.count,
    resetTime: data.resetTime,
  }
}

declare global {
  var rateLimitStore:
    | Record<string, { count: number; resetTime: number }>
    | undefined
}
