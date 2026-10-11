import { z } from "zod";

export const personnelSourceUrl = "https://www.csmju.com/personnels";
const optionalText = z.string().max(1000).nullish();
const sourcePerson = z.object({
  id: z.string().uuid(),
  prefix: z.string().max(80).nullish(),
  fullnameTh: z.string().trim().min(1).max(150),
  fullnameEn: z.string().max(150).nullish(),
  personnelType: z.enum(["อาจารย์", "เจ้าหน้าที่"]),
  academicPosition: z.string().max(150).nullish(),
  administrativePosition: z.string().max(150).nullish(),
  email: z.union([z.string().email().max(254), z.literal("")]).nullish(),
  phoneNumber: optionalText,
  education: optionalText,
  profileImage: z.object({ url: z.string().url() }).nullish(),
});
export type SourcePerson = z.infer<typeof sourcePerson>;

// Read only the personnel query publicly rendered by the source page.
export function parseCsmjuPersonnels(html: string): SourcePerson[] {
  const flight = [
    ...html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g),
  ]
    .map((match) => JSON.parse(match[1]) as string)
    .join("");
  let result: SourcePerson[] | undefined;
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    const node = value as Record<string, unknown>;
    if (Array.isArray(node.queryKey) && node.queryKey[0] === "personnels") {
      const parsed = z
        .object({
          data: z.object({
            data: z.array(sourcePerson).min(1).max(200),
            meta: z.object({
              totalItems: z.number(),
              totalPages: z.literal(1),
            }),
          }),
        })
        .parse(node.state);
      if (parsed.data.meta.totalItems !== parsed.data.data.length)
        throw new Error("Incomplete personnel list");
      result = parsed.data.data;
    }
    Object.values(node).forEach(visit);
  };
  for (const line of flight.split("\n")) {
    const json = line.slice(line.indexOf(":") + 1);
    if (!json.startsWith("[") && !json.startsWith("{")) continue;
    let value: unknown;
    try {
      value = JSON.parse(json);
    } catch {
      continue;
    }
    visit(value);
  }
  if (!result || new Set(result.map((row) => row.id)).size !== result.length)
    throw new Error("Invalid personnel source");
  return result;
}

export function normalizedPersonnelName(name: string): string {
  return name
    .normalize("NFC")
    .replace(
      /^(?:(?:ผู้ช่วยศาสตราจารย์|รองศาสตราจารย์|ศาสตราจารย์|อาจารย์|ผศ\.|รศ\.|ศ\.|อ\.|ดร\.|นางสาว|นาง|นาย)\s*)+/,
      "",
    )
    .replace(/\s+/g, "");
}

export function safePersonnelImage(url?: string | null): string | null {
  if (!url) return null;
  const parsed = new URL(url);
  return parsed.protocol === "https:" &&
    ["csmju.com", "www.csmju.com"].includes(parsed.hostname) &&
    parsed.pathname.startsWith("/files/personnels/") &&
    !parsed.username &&
    !parsed.password
    ? parsed.href
    : null;
}
