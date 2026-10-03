import { Injectable, HttpStatus } from '@nestjs/common';
import { ReferenceDataService } from '../core-hub/reference-data.service';
import { Room } from '../core-hub/reference-data.types';
import { AppException, ErrorCode } from '../common/errors';

@Injectable()
export class PlaceReferenceService {
  constructor(private readonly references: ReferenceDataService) {}

  async rooms(token: string): Promise<Room[]> {
    return this.references.list<Room>('rooms', token);
  }

  async room(code: string, token: string): Promise<Room | null> {
    return this.references.get<Room>('rooms', code, token);
  }

  async validate(code: string | null | undefined, label: string | null | undefined, token: string): Promise<void> {
    if (code) {
      if (label?.trim()) throw new AppException(ErrorCode.VALIDATION_ERROR, 'ชื่อห้องแก้ไขที่ Core Hub เท่านั้น', HttpStatus.BAD_REQUEST);
      await this.references.assertActive('rooms', code, token);
    } else if (!label?.trim()) {
      throw new AppException(ErrorCode.VALIDATION_ERROR, 'กรุณาเลือกรหัสห้องจาก Core Hub หรือกรอกชื่อจุดบนแผนที่', HttpStatus.BAD_REQUEST);
    }
  }
}
