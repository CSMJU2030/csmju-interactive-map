export function normalizePersonnelName(name: string): string {
  return name
    .normalize("NFC")
    .replace(
      /^(?:(?:ผู้ช่วยศาสตราจารย์|รองศาสตราจารย์|ศาสตราจารย์|อาจารย์|ผศ\.|รศ\.|ศ\.|อ\.|ดร\.|นางสาว|นาง|นาย)\s*)+/,
      "",
    )
    .replace(/\s+/g, "");
}
