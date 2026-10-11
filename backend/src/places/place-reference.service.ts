import { Injectable } from "@nestjs/common";
import { AppException } from "../common/errors";
@Injectable()
export class PlaceReferenceService {
  validate(
    code: string | null | undefined,
    label: string | null | undefined,
    _token?: string,
  ): void {
    void _token;
    if (!code?.trim() && !label?.trim())
      throw AppException.badRequest("กรุณากรอกชื่อสถานที่หรือรหัสห้อง");
  }
}
