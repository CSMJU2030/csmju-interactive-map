import type { ErrorResponse, SuccessResponse } from '@/types/api';
import { renewSignIn } from './sign-in';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code = 'API_ERROR',
    public readonly status = 500,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<SuccessResponse<T>> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  const body = (await response.json()) as SuccessResponse<T> | ErrorResponse;
  if (!response.ok || !body.success) {
    if (response.status === 401 && path !== '/api/v1/me') renewSignIn();
    const error = body as ErrorResponse;
    throw new ApiError(error.error?.message ?? 'ไม่สามารถเชื่อมต่อระบบได้', error.error?.code, response.status);
  }
  return body;
}
