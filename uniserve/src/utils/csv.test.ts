import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("writes headers followed by rows separated by CRLF", () => {
    expect(toCsv(["a", "b"], [["1", "2"]])).toBe("a,b\r\n1,2");
  });

  it("quotes cells that contain commas", () => {
    expect(toCsv(["t"], [["Room 4, Block B"]])).toBe('t\r\n"Room 4, Block B"');
  });

  it("escapes embedded quotes by doubling them", () => {
    expect(toCsv(["t"], [['The "main" door']])).toBe('t\r\n"The ""main"" door"');
  });

  it("quotes cells that contain newlines", () => {
    expect(toCsv(["t"], [["line one\nline two"]])).toBe('t\r\n"line one\nline two"');
  });

  it("renders null and undefined as empty cells and keeps numbers", () => {
    expect(toCsv(["a", "b", "c"], [[null, undefined, 3]])).toBe("a,b,c\r\n,,3");
  });
});
