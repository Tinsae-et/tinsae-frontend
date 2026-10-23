import { describe, expect, it } from "vitest";

import {
  asksForAdvancePayment,
  cleanMessageBody,
  counterpartName,
  dayLabel,
  inquiryListParams,
  isIdOrSlug,
  isInquiryId,
  isSeen,
  matchesInquiryFilter,
  matchesInquirySearch,
  MESSAGE_MAX_LENGTH,
  needsReply,
  safeContactTarget,
  telegramProfileUrl,
} from "./inquiries";
import type { Inquiry, InquiryMessage, Shop } from "./types";

function message(overrides: Partial<InquiryMessage> = {}): InquiryMessage {
  return {
    id: 1,
    inquiry: 7,
    body: "Is it still available?",
    sent_via: "web",
    sender_role: "buyer",
    created_at: "2026-10-22T10:00:00+03:00",
    ...overrides,
  };
}

function inquiry(overrides: Partial<Inquiry> = {}): Inquiry {
  return {
    id: 7,
    buyer: 123,
    buyer_name: "Abebe Kebede",
    shop: { id: 3, name: "Bole Electronics", slug: "bole-electronics" } as Shop,
    product: null,
    status: "open",
    last_message_at: "2026-10-22T10:00:00+03:00",
    last_sender_role: "buyer",
    buyer_unread: 0,
    shop_unread: 1,
    messages: [message()],
    ...overrides,
  };
}

describe("isInquiryId", () => {
  it("accepts integer ids only", () => {
    expect(isInquiryId("42")).toBe(true);
    for (const bad of ["", "4a", "-1", "1.5", "..%2F", "../shops", "1/close", " 1"]) {
      expect(isInquiryId(bad)).toBe(false);
    }
  });
});

describe("inquiryListParams", () => {
  it("keeps page, page_size and a known status, drops the rest", () => {
    const out = inquiryListParams(
      new URLSearchParams("page=2&page_size=50&status=open&evil=1&ordering=-id"),
    );
    expect(out.toString()).toBe("page=2&page_size=50&status=open");
  });

  it("drops values in the wrong shape", () => {
    const out = inquiryListParams(new URLSearchParams("page=abc&page_size=99999&status=all"));
    expect(out.toString()).toBe("");
  });
});

describe("isIdOrSlug", () => {
  it("accepts positive ids and slugs", () => {
    expect(isIdOrSlug(12)).toBe(true);
    expect(isIdOrSlug("bole-electronics")).toBe(true);
  });

  it("rejects everything else", () => {
    for (const bad of [0, -3, 1.5, "", "a/b", "../x", null, {}, ["x"]]) {
      expect(isIdOrSlug(bad)).toBe(false);
    }
  });
});

describe("cleanMessageBody", () => {
  it("trims a valid message", () => {
    expect(cleanMessageBody("  hello  ")).toBe("hello");
  });

  it("rejects non-text, blank and over-long messages", () => {
    expect(cleanMessageBody(42)).toBeNull();
    expect(cleanMessageBody("   ")).toBeNull();
    expect(cleanMessageBody("x".repeat(MESSAGE_MAX_LENGTH + 1))).toBeNull();
    expect(cleanMessageBody("x".repeat(MESSAGE_MAX_LENGTH))).not.toBeNull();
  });
});

describe("safeContactTarget", () => {
  it("allows tel: numbers and https t.me links", () => {
    expect(safeContactTarget("tel:+251911223344")).toBe("tel:+251911223344");
    expect(safeContactTarget("https://t.me/bole_shop")).toBe("https://t.me/bole_shop");
  });

  it("drops other schemes and hosts", () => {
    for (const bad of [
      "javascript:alert(1)",
      "data:text/html,hi",
      "http://t.me/bole_shop",
      "https://evil.example/t.me",
      "https://t.me.evil.example/x",
      "tel:abc",
      "",
      null,
    ]) {
      expect(safeContactTarget(bad)).toBeNull();
    }
  });
});

describe("telegramProfileUrl", () => {
  it("builds a link for a well-formed username, with or without @", () => {
    expect(telegramProfileUrl("@bole_shop")).toBe("https://t.me/bole_shop");
  });

  it("returns null for anything that isn't a username", () => {
    for (const bad of ["abc", "bole shop", "../x", "x?y=1", "", null, undefined]) {
      expect(telegramProfileUrl(bad)).toBeNull();
    }
  });
});

describe("conversation state", () => {
  it("needsReply when the buyer spoke last on an open thread", () => {
    expect(needsReply(inquiry({ shop_unread: 0 }))).toBe(true);
    expect(needsReply(inquiry({ shop_unread: 0, last_sender_role: "shop" }))).toBe(false);
    expect(needsReply(inquiry({ status: "closed" }))).toBe(false);
  });

  it("names the counterpart without exposing the buyer's user id", () => {
    expect(counterpartName(inquiry(), "shop")).toBe("Abebe Kebede");
    expect(counterpartName(inquiry({ buyer_name: "" }), "shop")).toBe("Customer");
    expect(counterpartName(inquiry(), "buyer")).toBe("Bole Electronics");
  });

  it("isSeen once the other side has read the viewer's last message", () => {
    expect(isSeen(inquiry({ shop_unread: 1 }), "buyer")).toBe(false);
    expect(isSeen(inquiry({ shop_unread: 0 }), "buyer")).toBe(true);
    // The last message is the buyer's, so the shop has nothing to see as "seen".
    expect(isSeen(inquiry({ buyer_unread: 0 }), "shop")).toBe(false);
  });

  it("filters by role: the shop's unread tab is what it owes a reply", () => {
    const answeredRead = inquiry({ shop_unread: 0, last_sender_role: "shop" });
    expect(matchesInquiryFilter(inquiry({ shop_unread: 0 }), "unread", "shop")).toBe(true);
    expect(matchesInquiryFilter(answeredRead, "unread", "shop")).toBe(false);
    expect(matchesInquiryFilter(inquiry({ buyer_unread: 2 }), "unread", "buyer")).toBe(true);
    expect(matchesInquiryFilter(inquiry({ status: "closed" }), "closed", "buyer")).toBe(true);
  });

  it("searches shop, buyer, listing and messages", () => {
    expect(matchesInquirySearch(inquiry(), "bole")).toBe(true);
    expect(matchesInquirySearch(inquiry(), "abebe")).toBe(true);
    expect(matchesInquirySearch(inquiry(), "AVAILABLE")).toBe(true);
    expect(matchesInquirySearch(inquiry(), "laptop")).toBe(false);
    expect(matchesInquirySearch(inquiry(), "  ")).toBe(true);
  });
});

describe("asksForAdvancePayment", () => {
  it("flags requests to pay before inspecting", () => {
    for (const text of [
      "Please send a deposit to hold it",
      "Pay first and we deliver",
      "Payment upfront only",
      "transfer the money first",
    ]) {
      expect(asksForAdvancePayment(text)).toBe(true);
    }
  });

  it("leaves ordinary replies alone", () => {
    for (const text of ["Yes, it's in stock", "Visit us today", "Advanced model, 256GB"]) {
      expect(asksForAdvancePayment(text)).toBe(false);
    }
  });
});

describe("dayLabel", () => {
  const now = new Date(2026, 9, 22, 15, 0).getTime();

  it("uses calendar days in local time", () => {
    expect(dayLabel(new Date(2026, 9, 22, 0, 5).toISOString(), now)).toBe("Today");
    expect(dayLabel(new Date(2026, 9, 21, 23, 55).toISOString(), now)).toBe("Yesterday");
    expect(dayLabel("not a date", now)).toBe("");
  });
});
