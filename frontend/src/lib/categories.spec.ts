import { describe, expect, it } from 'vitest';
import { categoryLabels } from './categories';

describe('category labels', () => {
  it('maps every API category to a Thai label', () => {
    expect(Object.keys(categoryLabels)).toHaveLength(11);
    expect(categoryLabels.COMPUTER_LAB).toBe('ห้องปฏิบัติการ');
    expect(categoryLabels.FACILITY).toBe('ลิฟต์ / สิ่งอำนวยความสะดวก');
    expect(categoryLabels.STUDENT_CLUB).toBe('ห้องชมรม');
    expect(categoryLabels.STORAGE).toBe('ห้องเก็บของ');
  });
});
