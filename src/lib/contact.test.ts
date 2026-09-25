import { describe, expect, it } from "vitest";
import { metadata } from "@/app/(common)/contact/page";
import { CONTACT_REASONS } from "@/components/contact/contact-form";
import sitemap from "@/app/sitemap";

describe("Contact Page Metadata and SEO", () => {
  it("exports valid page title, meta description, and indexable robots configuration", () => {
    expect(metadata.title).toBe("Contact Tinsae | Talk to a human in Addis");
    expect(metadata.description).toBeDefined();
    expect(typeof metadata.description).toBe("string");
    expect(metadata.description?.length).toBeGreaterThan(20);
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it("registers /contact in sitemap", async () => {
    const entries = await sitemap();
    const contactEntry = entries.find((e) => e.url.endsWith("/contact"));
    expect(contactEntry).toBeDefined();
  });
});

describe("Contact Form Reasons", () => {
  it("provides valid contact reasons", () => {
    expect(CONTACT_REASONS).toContain("Buyer support");
    expect(CONTACT_REASONS).toContain("Shop support");
    expect(CONTACT_REASONS).toContain("Report a problem");
    expect(CONTACT_REASONS).toContain("Press");
    expect(CONTACT_REASONS).toContain("Something else");
  });
});
