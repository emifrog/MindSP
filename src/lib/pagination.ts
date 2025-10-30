/**
 * Helper de pagination réutilisable pour toutes les routes API
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Constantes de pagination
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 50,
  MAX_LIMIT: 100,
} as const;

/**
 * Calculer skip et take pour Prisma
 */
export function getPaginationParams(
  page: number = PAGINATION_DEFAULTS.PAGE,
  limit: number = PAGINATION_DEFAULTS.LIMIT
): PaginationResult {
  // Valider et normaliser les paramètres
  const validPage = Math.max(1, Math.floor(page));
  const validLimit = Math.min(
    PAGINATION_DEFAULTS.MAX_LIMIT,
    Math.max(1, Math.floor(limit))
  );

  return {
    skip: (validPage - 1) * validLimit,
    take: validLimit,
  };
}

/**
 * Créer les métadonnées de pagination
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Parser les query params de pagination
 */
export function parsePaginationParams(searchParams: URLSearchParams): {
  page: number;
  limit: number;
} {
  const page = parseInt(
    searchParams.get("page") || String(PAGINATION_DEFAULTS.PAGE)
  );
  const limit = parseInt(
    searchParams.get("limit") || String(PAGINATION_DEFAULTS.LIMIT)
  );

  return {
    page: isNaN(page) ? PAGINATION_DEFAULTS.PAGE : page,
    limit: isNaN(limit) ? PAGINATION_DEFAULTS.LIMIT : limit,
  };
}

/**
 * Wrapper complet pour paginer une query Prisma
 */
export async function paginateQuery<T>(
  query: () => Promise<T[]>,
  countQuery: () => Promise<number>,
  page: number = PAGINATION_DEFAULTS.PAGE,
  limit: number = PAGINATION_DEFAULTS.LIMIT
): Promise<{
  data: T[];
  pagination: PaginationMeta;
}> {
  const { skip, take } = getPaginationParams(page, limit);

  const [data, total] = await Promise.all([query(), countQuery()]);

  return {
    data,
    pagination: createPaginationMeta(page, take, total),
  };
}

/**
 * Exemple d'utilisation :
 *
 * ```typescript
 * import { parsePaginationParams, getPaginationParams, createPaginationMeta } from "@/lib/pagination";
 *
 * export async function GET(request: NextRequest) {
 *   const { searchParams } = new URL(request.url);
 *   const { page, limit } = parsePaginationParams(searchParams);
 *   const { skip, take } = getPaginationParams(page, limit);
 *
 *   const [items, total] = await Promise.all([
 *     prisma.item.findMany({ skip, take }),
 *     prisma.item.count(),
 *   ]);
 *
 *   return NextResponse.json({
 *     items,
 *     pagination: createPaginationMeta(page, limit, total),
 *   });
 * }
 * ```
 */
