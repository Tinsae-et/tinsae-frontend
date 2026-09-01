import { describe, expect, it } from "vitest";

import { formatETB, freshness } from "./format";

// A fixed "now" so an age never depends on when the suite runs.
const NOW = Date.parse("2026-08-31T12:00:00Z");
const hoursAgo = (h: number) => new Date(NOW - h * 36e5).toISOString();
const daysAgo = (d: number) => hoursAgo(d * 24);

describe("freshness", () => {
  // The two rows below are the regressions this module was rewritten for. Both
  // rendered a green "In stock" badge under the old threshold-based version.
  it("does not call an unconfirmed listing fresh, however recent it is", () => {
    expect(freshness(hoursAgo(1), "unconfirmed", NOW).tone).toBe("unconfirmed");
  });

  it("does not trust the status when the timestamp is null", () => {
    // The column defaults to "fresh", so a listing nobody has ever confirmed
    // arrives claiming to be fresh. The null timestamp is the real signal.
    const result = freshness(null, "fresh", NOW);
    expect(result.tone).toBe("unconfirmed");
    expect(result.confirmed).toBe("Not yet confirmed");
  });

  it("passes through the backend's own label otherwise", () => {
    expect(freshness(hoursAgo(4), "fresh", NOW).tone).toBe("fresh");
    expect(freshness(hoursAgo(4), "stale", NOW).tone).toBe("stale");
  });

  it("falls back to unconfirmed rather than guessing green", () => {
    expect(freshness(hoursAgo(4), null, NOW).tone).toBe("unconfirmed");
    expect(freshness(hoursAgo(4), undefined, NOW).tone).toBe("unconfirmed");
    expect(freshness("not a date", "fresh", NOW).tone).toBe("unconfirmed");
  });

  it("never grades on age — that clock belongs to the backend", () => {
    // The deleted "aging" tier lived here, downgrading fresh listings past a
    // local threshold. A listing the backend calls fresh is fresh at any age.
    const tones = [1, 24, 24 * 25, 24 * 40, 24 * 400].map(
      (h) => freshness(hoursAgo(h), "fresh", NOW).tone,
    );
    expect(new Set(tones)).toEqual(new Set(["fresh"]));
  });

  it("treats a future timestamp as now rather than going negative", () => {
    // Clock skew between the server and the database is not the buyer's problem.
    const future = new Date(NOW + 36e5).toISOString();
    expect(freshness(future, "fresh", NOW).age).toBe("Just now");
  });

  it("abbreviates on the chip and spells it out in the sentence", () => {
    // The chip is roughly eight characters wide; the confirmation line is a row.
    const day = freshness(daysAgo(2), "fresh", NOW);
    expect(day.age).toBe("2d ago");
    expect(day.confirmed).toBe("Confirmed 2 days ago");

    expect(freshness(hoursAgo(4), "fresh", NOW).confirmed).toBe("Confirmed today");
    expect(freshness(daysAgo(1), "fresh", NOW).confirmed).toBe("Confirmed yesterday");
    expect(freshness(daysAgo(45), "fresh", NOW).confirmed).toBe("Confirmed last month");
    expect(freshness(daysAgo(400), "fresh", NOW).confirmed).toBe("Confirmed last year");
  });

  it("labels each tone for the badge", () => {
    expect(freshness(hoursAgo(4), "fresh", NOW).badge).toBe("In stock");
    expect(freshness(hoursAgo(4), "stale", NOW).badge).toBe("Stale");
    expect(freshness(hoursAgo(4), "unconfirmed", NOW).badge).toBe("Unconfirmed");
  });
});

describe("formatETB", () => {
  it("groups a DRF decimal string without decimals", () => {
    expect(formatETB("142500.00")).toBe("ETB 142,500");
    expect(formatETB(142500)).toBe("ETB 142,500");
  });

  it("renders a dash rather than NaN", () => {
    expect(formatETB("abc")).toBe("—");
  });
});
