import {
  PaginationMeta,
  PaginationQuery,
  PaginationResult,
} from '@shared/interfaces/pagination.interface';

export interface PaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
}

/**
 * Creates pagination metadata from total records, page, and limit
 */
export function createPaginationMeta(
  totalRecords: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(totalRecords / limit);
  const nextPage = page < totalPages ? page + 1 : null;
  const previousPage = page > 1 ? page - 1 : null;
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  const startRecord = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalRecords);

  return {
    page,
    limit,
    totalRecords,
    totalPages,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    startRecord,
    endRecord,
  };
}

/**
 * Calculates offset for database queries
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Normalizes pagination query parameters with defaults and validation
 */
export function normalizePaginationQuery(
  query: PaginationQuery,
  options: PaginationOptions = {},
): { page: number; limit: number; offset: number } {
  const { defaultPage = 1, defaultLimit = 10, maxLimit = 100 } = options;

  const page = Math.max(1, query.page || defaultPage);
  const limit = Math.min(maxLimit, Math.max(1, query.limit || defaultLimit));
  const offset = calculateOffset(page, limit);

  return { page, limit, offset };
}

/**
 * Creates a paginated result with data and pagination metadata
 */
export function createPaginatedResult<T>(
  data: T[],
  totalRecords: number,
  page: number,
  limit: number,
): PaginationResult<T> {
  const pagination = createPaginationMeta(totalRecords, page, limit);

  return {
    data,
    pagination,
  };
}

/**
 * Paginates an array of data in memory (for cases where data is already loaded)
 */
export function paginateArray<T>(
  data: T[],
  query: PaginationQuery,
  options: PaginationOptions = {},
): PaginationResult<T> {
  const { page, limit } = normalizePaginationQuery(query, options);
  const offset = calculateOffset(page, limit);

  const paginatedData = data.slice(offset, offset + limit);

  return createPaginatedResult(paginatedData, data.length, page, limit);
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use createPaginationMeta instead
 */
export function calculatePagination(
  totalRecords: number,
  page: number,
  limit: number,
) {
  const meta = createPaginationMeta(totalRecords, page, limit);
  return {
    totalPages: meta.totalPages,
    nextPage: meta.nextPage,
    previousPage: meta.previousPage,
  };
}
