import {
  normalizedPersonnelName,
  parseCsmjuPersonnels,
  safePersonnelImage,
} from "./csmju-personnels";
const person = {
  id: "0c86953b-1035-43b8-b4a4-8c92b261ee77",
  fullnameTh: "กิตติกร หาญตระกูล",
  personnelType: "อาจารย์",
};
const page = (people: unknown[], total = people.length) =>
  "<script>self.__next_f.push([1," +
  JSON.stringify(
    "a:" +
      JSON.stringify([
        "$",
        null,
        null,
        {
          state: {
            queries: [
              {
                queryKey: ["personnels", {}],
                state: {
                  data: {
                    data: people,
                    meta: { totalItems: total, totalPages: 1 },
                  },
                },
              },
            ],
          },
        },
      ]) +
      "\n",
  ) +
  "])</script>";
describe("CSMJU public personnel source", () => {
  it("reads the personnel query from streamed public page data", () => {
    expect(parseCsmjuPersonnels(page([person]))).toEqual([person]);
  });
  it("rejects incomplete lists, changed schemas and duplicate source IDs before import", () => {
    expect(() => parseCsmjuPersonnels(page([person], 2))).toThrow();
    expect(() =>
      parseCsmjuPersonnels(page([{ ...person, personnelType: "unknown" }])),
    ).toThrow();
    expect(() => parseCsmjuPersonnels(page([person, person]))).toThrow();
    expect(() => parseCsmjuPersonnels("<html/>")).toThrow();
  });
  it("matches registrar and source titles without fuzzy matching unrelated people", () => {
    expect(normalizedPersonnelName("อาจารย์ ดร.กิตติกร หาญตระกูล")).toBe(
      normalizedPersonnelName("อ.ดร. กิตติกร หาญตระกูล"),
    );
    expect(normalizedPersonnelName("ผศ. ก่องกาญจน์ ดุลยไชย")).toBe(
      "ก่องกาญจน์ดุลยไชย",
    );
    expect(normalizedPersonnelName("กิตติกร คนอื่น")).not.toBe(
      normalizedPersonnelName(person.fullnameTh),
    );
  });
  it("only uses HTTPS personnel images on the source domain", () => {
    expect(safePersonnelImage("https://csmju.com/files/personnels/a.png")).toBe(
      "https://csmju.com/files/personnels/a.png",
    );
    expect(safePersonnelImage("https://example.com/a.png")).toBeNull();
    expect(
      safePersonnelImage("http://csmju.com/files/personnels/a.png"),
    ).toBeNull();
  });
});
