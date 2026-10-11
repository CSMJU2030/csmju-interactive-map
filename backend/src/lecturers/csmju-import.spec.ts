import { LecturersService } from "./lecturers.service";
import { PrismaService } from "../prisma/prisma.service";
const source = {
  id: "0c86953b-1035-43b8-b4a4-8c92b261ee77",
  prefix: "อ.ดร.",
  fullnameTh: "กิตติกร หาญตระกูล",
  personnelType: "อาจารย์",
};
const html =
  "<script>self.__next_f.push([1," +
  JSON.stringify(
    "a:" +
      JSON.stringify({
        queries: [
          {
            queryKey: ["personnels"],
            state: {
              data: { data: [source], meta: { totalItems: 1, totalPages: 1 } },
            },
          },
        ],
      }) +
      "\n",
  ) +
  "])</script>";
describe("Department personnel import", () => {
  const findMany = jest.fn();
  const update = jest.fn();
  const create = jest.fn();
  const transaction = jest.fn();
  const service = new LecturersService({
    $transaction: transaction,
  } as unknown as PrismaService);
  beforeEach(() => {
    jest.resetAllMocks();
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true, text: async () => html } as Response);
    transaction.mockImplementation(async (callback) =>
      callback({ lecturer: { findMany, update, create } }),
    );
  });
  afterEach(() => jest.restoreAllMocks());
  it("matches a registrar teacher and updates only profile fields, preserving offices and schedules", async () => {
    findMany.mockResolvedValue([
      {
        id: "existing",
        nameTh: "อาจารย์ ดร.กิตติกร หาญตระกูล",
        sourcePersonnelId: null,
        _count: { teachingSchedule: 3 },
      },
    ]);
    expect(await service.importCsmju()).toMatchObject({
      created: 0,
      updated: 1,
      skipped: [],
    });
    const args = update.mock.calls[0][0];
    expect(args.where).toEqual({ id: "existing" });
    expect(args.data.sourcePersonnelId).toBe(source.id);
    expect(args.data).not.toHaveProperty("placeId");
    expect(args.data).not.toHaveProperty("teachingSchedule");
    expect(args.data).not.toHaveProperty("personCode");
    expect(create).not.toHaveBeenCalled();
  });
  it("uses the stable source identity after a local name edit", async () => {
    findMany.mockResolvedValue([
      {
        id: "existing",
        nameTh: "ชื่อที่แก้",
        sourcePersonnelId: source.id,
        _count: { teachingSchedule: 0 },
      },
    ]);
    expect(await service.importCsmju()).toMatchObject({
      created: 0,
      updated: 1,
    });
  });
  it("skips ambiguous existing names instead of merging schedules", async () => {
    findMany.mockResolvedValue(
      ["one", "two"].map((id) => ({
        id,
        nameTh: source.fullnameTh,
        sourcePersonnelId: null,
        _count: { teachingSchedule: 0 },
      })),
    );
    expect(await service.importCsmju()).toMatchObject({
      created: 0,
      updated: 0,
      skipped: [source.fullnameTh],
    });
    expect(update).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });
  it("never mutates stored data if the source cannot be parsed", async () => {
    jest
      .mocked(fetch)
      .mockResolvedValue({ ok: true, text: async () => "<html/>" } as Response);
    await expect(service.importCsmju()).rejects.toMatchObject({ status: 503 });
    expect(transaction).not.toHaveBeenCalled();
  });
});
