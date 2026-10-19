import { describe, expect, it } from "vitest";

import { toEvent, type ApiNotification } from "./notifications";

const item = (overrides: Partial<ApiNotification> = {}): ApiNotification => ({
  id: 42,
  kind: "inquiry_reply",
  type: "reply",
  unread: true,
  created_at: "2026-10-19T07:24:40.295000+03:00",
  title: "Bole Electronics replied",
  body: "Yes, it is in stock.",
  cta: { label: "Open chat", href: "/inquiries/17" },
  ...overrides,
});

describe("toEvent", () => {
  it("maps the API's snake_case item to the UI shape", () => {
    expect(toEvent(item())).toEqual({
      id: "42",
      type: "reply",
      unread: true,
      createdAt: "2026-10-19T07:24:40.295000+03:00",
      title: "Bole Electronics replied",
      body: "Yes, it is in stock.",
      cta: { label: "Open chat", href: "/inquiries/17" },
    });
  });

  it("accepts the merchant message type", () => {
    expect(toEvent(item({ type: "message" }))?.type).toBe("message");
  });

  it("drops a type this build doesn't know", () => {
    expect(toEvent(item({ type: "flash_sale" }))).toBeNull();
  });

  it.each(["javascript:alert(1)", "//evil.example/x", "https://evil.example", "", "inquiries/17"])(
    "drops an unsafe CTA href %j",
    (href) => {
      expect(toEvent(item({ cta: { label: "Open", href } }))).toBeNull();
    },
  );
});
