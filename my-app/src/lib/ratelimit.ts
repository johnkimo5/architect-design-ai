import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create rate limiter only if valid environment variables are available
function createRatelimit() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  // Check for valid URL (must start with https://)
  if (!url || !token || !url.startsWith('https://')) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Upstash Redis credentials not configured. Rate limiting disabled.')
    }
    return null
  }

  try {
    return new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 requests per hour
      analytics: true,
    })
  } catch {
    console.warn('Failed to initialize rate limiter. Rate limiting disabled.')
    return null
  }
}

export const gradeRatelimit = createRatelimit()

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  // If rate limiting is not configured, allow all requests
  if (!gradeRatelimit) {
    return { success: true, remaining: 999, reset: Date.now() }
  }

  const result = await gradeRatelimit.limit(userId)
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  }
}
