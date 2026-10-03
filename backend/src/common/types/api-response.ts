import { CollectionResult } from '../api-response';
// The shared interceptor owns the response envelope.
export const success = <T>(data: T): T => data;
export const paginated = <T>(data: T[], page: number, limit: number, total: number) =>
  new CollectionResult(data, {page, limit, total, totalPages: Math.ceil(total / limit)});
