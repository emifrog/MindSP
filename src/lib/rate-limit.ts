import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Vérifier que les variables d'environnement sont définies
if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error("UPSTASH_REDIS_REST_URL is required");
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("UPSTASH_REDIS_REST_TOKEN is required");
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Rate limiter global pour les API (100 requêtes par minute)
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1m"),
  analytics: true,
  prefix: "ratelimit:api",
});

// Rate limiter strict pour l'authentification (5 tentatives par 15 minutes)
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15m"),
  analytics: true,
  prefix: "ratelimit:auth",
});

// Rate limiter pour l'enregistrement (3 créations par heure)
export const registerLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1h"),
  analytics: true,
  prefix: "ratelimit:register",
});

// Rate limiter pour les actions sensibles (10 par minute)
export const sensitiveLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1m"),
  analytics: true,
  prefix: "ratelimit:sensitive",
});

/**
 * Helper pour appliquer le rate limiting sur une requête
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset,
  };
}

/**
 * Extraire l'identifiant de la requête (IP ou user ID)
 */
export function getIdentifier(request: Request, userId?: string): string {
  if (userId) return userId;

  // Essayer d'obtenir l'IP depuis les headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback sur un identifiant générique (pas idéal mais mieux que rien)
  return "anonymous";
}

/**
 * Créer une réponse d'erreur rate limit
 */
export function rateLimitResponse(remaining: number, reset: number) {
  return new Response(
    JSON.stringify({
      error: "Trop de requêtes. Veuillez réessayer plus tard.",
      remaining,
      resetAt: new Date(reset * 1000).toISOString(),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
        "Retry-After": Math.ceil((reset * 1000 - Date.now()) / 1000).toString(),
      },
    }
  );
}
