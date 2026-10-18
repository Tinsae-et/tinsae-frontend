import { describe, expect, it } from "vitest";

import {
  filterCounts,
  groupFor,
  matchesFilter,
  timeAgo,
  unreadCount,
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
  ];

  it("puts both back-in-stock and selling-fast under Stock", () => {
    expect(feed.filter((e) => matchesFilter(e, "stock")).map((e) => e.id)).toEqual(["2", "3"]);
  });

  it("counts every tab", () => {
    expect(filterCounts(feed)).toEqual({
      all: 6,
      unread: 3,
      price: 1,
      stock: 2,
      searches: 1,
      replies: 1,
    });
    expect(unreadCount(feed)).toBe(3);
  });
});
