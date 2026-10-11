import { parseRegistrarTimetable } from "./registrar-timetable";

const courseRow = (code = "10301225") =>
  `<TR VALIGN=TOP><TD></TD><TD><A HREF=class_info_2.asp>${code}</A></TD><TD>วิศวกรรมซอฟต์แวร์<FONT><LI>อาจารย์อลงกต กองมณี<LI>ผู้ช่วยศาสตราจารย์ ดร.สมนึก สินธุปวน<LI>นายประทีป สุขสมัย</TD><TD>3</TD><TD><B><FONT>MO</FONT></B><FONT>13:00-15:00 <U>Lab คอม3-4</U><BR><B><FONT>FR</FONT></B><FONT>13:00-16:00 <U>บรรยาย คอม 6</U></TD><TD>1&nbsp;</TD></TR>`;
describe("Registrar timetable parser", () => {
  it("extracts teachers, multiple slots and room names from legacy HTML", () => {
    const result = parseRegistrarTimetable(courseRow());
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      courseCode: "10301225",
      dayOfWeek: 1,
      startTime: "13:00",
      endTime: "15:00",
      section: "1",
      roomName: "Lab คอม3-4",
      lecturerNames: [
        "อาจารย์อลงกต กองมณี",
        "ผู้ช่วยศาสตราจารย์ ดร.สมนึก สินธุปวน",
      ],
    });
    expect(result[1]).toMatchObject({ dayOfWeek: 5, roomName: "บรรยาย คอม 6" });
  });
  it("excludes other departments even when their course titles include computing", () => {
    expect(parseRegistrarTimetable(courseRow("10306213"))).toEqual([]);
  });
  it("does not invent schedules for unknown markup or reversed times", () => {
    expect(parseRegistrarTimetable("<html>เข้าสู่ระบบ</html>")).toEqual([]);
    expect(
      parseRegistrarTimetable(
        courseRow().replace("13:00-15:00", "15:00-13:00"),
      ),
    ).toHaveLength(1);
  });
});
