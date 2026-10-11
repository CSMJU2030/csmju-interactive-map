import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";

export class RegistrarQueryDto {
  @ApiProperty({ example: 2569 })
  @Type(() => Number)
  @IsInt()
  @Min(2563)
  @Max(2600)
  academicYear!: number;
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3)
  semester!: number;
}
export class RegistrarSessionDto {
  @ApiProperty() courseCode!: string;
  @ApiProperty() courseName!: string;
  @ApiProperty() section!: string;
  @ApiProperty({ type: [String] }) lecturerNames!: string[];
  @ApiProperty() roomName!: string;
  @ApiProperty() dayOfWeek!: number;
  @ApiProperty() startTime!: string;
  @ApiProperty() endTime!: string;
}

const days: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};
const plain = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

/** The public registrar's course list uses flat rows with TD cells and LI teacher names. */
export function parseRegistrarTimetable(html: string): RegistrarSessionDto[] {
  const result: RegistrarSessionDto[] = [];
  for (const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(
      (match) => match[1],
    );
    if (cells.length < 6) continue;
    const courseCode = plain(cells[1]);
    if (!/^10301\d{3}$/.test(courseCode)) continue;
    const [title, ...names] = cells[2].split(/<li\b[^>]*>/gi);
    const lecturerNames = [
      ...new Set(
        names.map(plain).filter((name) => /อาจารย์|ศาสตราจารย์/.test(name)),
      ),
    ];
    const courseName = plain(title);
    if (!courseName || !lecturerNames.length) continue;
    const section = plain(cells[5]);
    for (const line of cells[4].split(/<br\s*\/?\s*>/gi)) {
      const text = plain(line);
      const slot = text.match(
        /^(SU|MO|TU|WE|TH|FR|SA)\s+(\d{2}:\d{2})-(\d{2}:\d{2})\s+(.+)$/,
      );
      if (!slot || slot[2] >= slot[3]) continue;
      result.push({
        courseCode,
        courseName,
        section,
        lecturerNames,
        dayOfWeek: days[slot[1]],
        startTime: slot[2],
        endTime: slot[3],
        roomName: slot[4],
      });
    }
  }
  return result;
}
