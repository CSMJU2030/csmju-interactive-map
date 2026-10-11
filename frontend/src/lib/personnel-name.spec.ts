import { expect, it } from "vitest";
import { normalizePersonnelName } from "./personnel-name";
it("matches abbreviated source titles to full registrar titles", () => {
  expect(normalizePersonnelName("อ.ดร. กิตติกร หาญตระกูล")).toBe(
    normalizePersonnelName("อาจารย์ ดร.กิตติกร หาญตระกูล"),
  );
  expect(normalizePersonnelName("ผศ.ดร. ปวีณ เขื่อนแก้ว")).toBe(
    normalizePersonnelName("ผู้ช่วยศาสตราจารย์ ดร. ปวีณ เขื่อนแก้ว"),
  );
});
