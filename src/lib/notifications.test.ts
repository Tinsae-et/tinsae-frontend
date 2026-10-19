import { describe, expect, it } from "vitest";

import {
  groupFor,
  matchesFilter,
  notificationListParams,
  timeAgo,
  type NotificationEvent,
} from "./notifications";

// A fixed local "now" so buckets never depend on when the suite runs.
const NOW = new Date(2026, 9, 18, 15, 0).getTime();
const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m).toISOString();

const event = (overrides: Partial<NotificationEvent>): NotificationEvent => ({
  id: "n",
  type: "drop",
  unread: false,
  createdAt: at(18, 12),
  title: "t",
  body: "b",
  cta: { label: "View", href: "/" },
  ...overrides,
});

describe("groupFor", () => {
  it("buckets by calendar day, not by 24-hour window", () => {
    // 15 hours before NOW, but still today.
    expect(groupFor(at(18, 0, 5), NOW)).toBe("Today");
    // 16 hours before NOW, but last night.
    expect(groupFor(at(17, 23, 0), NOW)).toBe("Yesterday");
    expect(groupFor(at(17, 0, 0), NOW)).toBe("Yesterday");
  });

  it("falls through to this week, then earlier", () => {
    expect(groupFor(at(16, 23), NOW)).toBe("This week");
    expect(groupFor(at(12, 0), NOW)).toBe("This week");
    expect(groupFor(at(11, 23), NOW)).toBe("Earlier");
  });
});

describe("timeAgo", () => {
  it.each([
    [NOW - 20_000, "just now"],
    [NOW - 12 * 60_000, "12m ago"],
    [NOW - 2 * 36e5, "2h ago"],
    [NOW - 3 * 864e5, "3d ago"],
    [NOW - 15 * 864e5, "2w ago"],
  ])("formats %s as %s", (t, label) => {
    expect(timeAgo(new Date(t).toISOString(), NOW)).toBe(label);
  });

  it("never shows a negative age for a clock-skewed timestamp", () => {
    expect(timeAgo(new Date(NOW + 60_000).toISOString(), NOW)).toBe("just now");
  });
});

describe("filters", () => {
  const feed = [
    event({ id: "1", type: "drop", unread: true }),
    event({ id: "2", type: "back" }),
    event({ id: "3", type: "sold", unread: true }),
    event({ id: "4", type: "search" }),
    event({ id: "5", type: "reply", unread: true }),
    event({ id: "6", type: "verify" }),
    event({ id: "7", type: "message", unread: true }),
  ];

  const ids = (filter: Parameters<typeof matchesFilter>[1]) =>
    feed.filter((e) => matchesFilter(e, filter)).map((e) => e.id);

  it("puts both back-in-stock and selling-fast under Stock", () => {
    expect(ids("stock")).toEqual(["2", "3"]);
  });

  it("puts shop replies and buyer messages under Replies", () => {
    expect(ids("replies")).toEqual(["5", "7"]);
  });

  it("matches unread items under Unread", () => {
    expect(ids("unread")).toEqual(["1", "3", "5", "7"]);
  });
});

describe("notificationListParams", () => {
  const forward = (qs: string) => notificationListParams(new URLSearchParams(qs)).toString();

  it("keeps page and page_size when they are small integers", () => {
    expect(forward("page=2&page_size=50")).toBe("page=2&page_size=50");
  });

  it("drops every other param", () => {
    expect(forward("page_size=50&recipient=7&ordering=id")).toBe("page_size=50");
  });

  it("drops non-numeric or oversized values", () => {
    expect(forward("page=abc&page_size=-1")).toBe("");
    expect(forward("page=1e3&page_size=1000")).toBe("");
  });
});
