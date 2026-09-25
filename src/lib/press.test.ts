import { describe, expect, it } from "vitest";
import {
  formatCoverageDate,
  sortCoverageNewestFirst,
  type PressMention,
} from "./press";

const mention = (date: string): PressMention => ({
  outlet: "Outlet",
  headline: `Story on ${date}`,
  date,
  url: "https://example.com",
});

describe("sortCoverageNewestFirst", () => {
  it("orders items newest first, across years", () => {
    const sorted = sortCoverageNewestFirst([
      mention("2025-08-02"),
      mention("2026-03-14"),
      mention("2025-11-30"),
      mention("2026-02-01"),
    ]);
    expect(sorted.map((m) => m.date)).toEqual([
      "2026-03-14",
      "2026-02-01",
      "2025-11-30",
      "2025-08-02",
    ]);
  });

  it("does not reorder the input array", () => {
    const input = [mention("2025-01-01"), mention("2026-01-01")];
    sortCoverageNewestFirst(input);
    expect(input.map((m) => m.date)).toEqual(["2025-01-01", "2026-01-01"]);
  });

  it("returns an empty list for no coverage", () => {
    expect(sortCoverageNewestFirst([])).toEqual([]);
  });
});

describe("formatCoverageDate", () => {
  it("renders year and short month", () => {
    expect(formatCoverageDate("2026-03-14")).toBe("2026 · Mar");
    expect(formatCoverageDate("2025-12-01")).toBe("2025 · Dec");
  });

  it("falls back to the year when the month is missing", () => {
    expect(formatCoverageDate("2026")).toBe("2026");
  });
});
