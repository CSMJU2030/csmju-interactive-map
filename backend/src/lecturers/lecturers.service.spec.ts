import { LecturersService } from "./lecturers.service";
import { PrismaService } from "../prisma/prisma.service";

describe("Locally managed personnel", () => {
  const create = jest.fn();
  const findUnique = jest.fn();
  const findMany = jest.fn();
  const count = jest.fn();
  const update = jest.fn();
  const transaction = jest.fn((items: Promise<unknown>[]) =>
    Promise.all(items),
  );
  const prisma = {
    lecturer: { create, findMany, count, update },
    place: { findUnique },
    $transaction: transaction,
  } as unknown as PrismaService;
  const service = new LecturersService(prisma);
  const row = {
    id: "person",
    personCode: "P-1",
    nameTh: "อาจารย์ทดสอบ",
    nameEn: null,
    personnelType: "TEACHER",
    email: null,
    placeId: null,
    place: null,
    teachingSchedule: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  beforeEach(() => {
    jest.resetAllMocks();
    create.mockResolvedValue(row);
    update.mockResolvedValue(row);
    count.mockResolvedValue(1);
    findMany.mockResolvedValue([row]);
    transaction.mockImplementation((items: Promise<unknown>[]) =>
      Promise.all(items),
    );
  });
  it("stores the entered name without contacting Core Hub", async () => {
    const result = await service.create({
      personCode: " P-1 ",
      nameTh: " อาจารย์ทดสอบ ",
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          personCode: "P-1",
          nameTh: "อาจารย์ทดสอบ",
          placeId: null,
        }),
      }),
    );
    expect(result.nameTh).toBe("อาจารย์ทดสอบ");
  });
  it("allows an active locally managed office without a Core room code", async () => {
    findUnique.mockResolvedValue({
      id: "office",
      roomCode: null,
      isActive: true,
    });
    await service.create({
      personCode: "P-1",
      nameTh: "อาจารย์ทดสอบ",
      placeId: "office",
    });
    expect(create).toHaveBeenCalled();
  });
  it("rejects inactive office assignments", async () => {
    findUnique.mockResolvedValue({ id: "office", isActive: false });
    await expect(
      service.create({
        personCode: "P-1",
        nameTh: "อาจารย์ทดสอบ",
        placeId: "office",
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(create).not.toHaveBeenCalled();
  });
  it("rejects names containing only whitespace", async () => {
    await expect(
      service.create({ personCode: "P-1", nameTh: " " }),
    ).rejects.toMatchObject({ status: 400 });
    expect(create).not.toHaveBeenCalled();
  });
  it("lists local personnel even without office assignments", async () => {
    const result = await service.directory({ page: 1, limit: 20 });
    expect(result).toMatchObject({
      total: 1,
      data: [{ nameTh: row.nameTh, place: null }],
    });
  });
  it("unassigns an office when placeId is null", async () => {
    await service.update("person", { placeId: null });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { placeId: null } }),
    );
  });
});
