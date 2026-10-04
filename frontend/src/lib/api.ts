import type { SuccessResponse } from "@/types/api";
import { renewSignIn } from "./sign-in";
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code = "INTERNAL_ERROR",
    public readonly status = 500,
    public readonly details: unknown = undefined,
    public readonly requestId: string | null = null,
  ) {
    super(message);
  }
}
const messages: Record<string, string> = {
  UNAUTHORIZED: "กรุณาเข้าสู่ระบบผ่าน Core Hub",
  FORBIDDEN:
    "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ หากคิดว่าเป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบย่อยนี้",
  NOT_FOUND: "ไม่พบข้อมูลที่คุณกำลังค้นหา อาจถูกลบไปแล้วหรือลิงก์ไม่ถูกต้อง",
  VALIDATION_ERROR: "กรุณาตรวจสอบข้อมูลในช่องที่ระบุ",
  BAD_REQUEST: "ข้อมูลคำขอไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่",
  CONFLICT: "ข้อมูลถูกแก้ไขโดยผู้ใช้อื่นแล้ว กรุณารีเฟรชและลองใหม่",
  INTERNAL_ERROR: "ระบบขัดข้องชั่วคราว กรุณาลองอีกครั้ง",
  SERVICE_UNAVAILABLE: "บริการข้อมูลกลางขัดข้องชั่วคราว กรุณาลองอีกครั้ง",
  TOO_MANY_REQUESTS: "มีการใช้งานถี่เกินไป กรุณารอสักครู่แล้วลองใหม่",
};
export function fieldError(error: unknown): {
  field?: string;
  message: string;
} {
  if (!(error instanceof ApiError))
    return {
      message:
        "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง",
    };
  const details = error.details;
  if (
    details &&
    typeof details === "object" &&
    !Array.isArray(details) &&
    "field" in details &&
    typeof details.field === "string"
  )
    return { field: details.field, message: error.message };
  return { message: error.message };
}
export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<SuccessResponse<T>> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(
      "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง",
      "SERVICE_UNAVAILABLE",
      0,
    );
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(
      messages.INTERNAL_ERROR,
      "INTERNAL_ERROR",
      response.status,
      undefined,
      response.headers.get("x-request-id"),
    );
  }
  if (
    !response.ok ||
    !body ||
    typeof body !== "object" ||
    !("success" in body) ||
    !body.success
  ) {
    const envelope = body as {
      error?: { code?: string; message?: string; details?: unknown };
    } | null;
    const code = envelope?.error?.code ?? "INTERNAL_ERROR";
    if (response.status === 401 && path !== "/api/v1/me") renewSignIn();
    const raw = envelope?.error?.message;
    const safeMessage =
      code === "VALIDATION_ERROR" && raw && /[ก-๙]/.test(raw)
        ? raw
        : (messages[code] ?? messages.INTERNAL_ERROR);
    throw new ApiError(
      safeMessage,
      code,
      response.status,
      envelope?.error?.details,
      response.headers.get("x-request-id"),
    );
  }
  return body as SuccessResponse<T>;
}
