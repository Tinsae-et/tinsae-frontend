import { describe, expect, it } from "vitest";
import { metadata } from "@/app/(common)/about/page";
import {
  ABOUT_STATS,
  PRINCIPLES,
  TEAM,
  TIMELINE,
  WHAT_WE_ARE,
  WHAT_WE_ARE_NOT,
} from "@/components/about/about-sections";

describe("About Page Metadata and Technical Spec", () => {
  it("exports valid page title, meta description, and open graph tags", () => {
    expect(metadata.title).toBe("About Tinsae — We made the trust legible");
    expect(metadata.description).toBeDefined();
    expect(typeof metadata.description).toBe("string");
    expect(metadata.description?.length).toBeGreaterThan(20);

    const og = metadata.openGraph;
    expect(og).toBeDefined();
    if (og && typeof og === "object") {
      const ogObj = og as Record<string, unknown>;
      expect(ogObj.title).toBe("About Tinsae — We made the trust legible");
      expect(ogObj.type).toBe("website");
      expect(ogObj.url).toBe("https://tinsae.et/about");
      expect(ogObj.siteName).toBe("Tinsae");
    }
  });
});

describe("About Page Content and Constraints", () => {
  it("defines the 4 key principles/constraints per design spec", () => {
    expect(PRINCIPLES).toHaveLength(4);

    const titles = PRINCIPLES.map((p) => p.title);
    expect(titles).toEqual([
      "Trust is earned in person",
      "A price is only true today",
      "The shop keeps the relationship",
      "Built for how Addis actually shops",
    ]);

    for (const principle of PRINCIPLES) {
      expect(principle.icon).toBeDefined();
      expect(principle.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(principle.body.length).toBeGreaterThan(10);
    }
  });

  it("defines the 5 timeline milestones matching design handoff", () => {
    expect(TIMELINE).toHaveLength(5);

    const milestones = TIMELINE.map((t) => ({ when: t.when, title: t.title }));
    expect(milestones).toEqual([
      { when: "2024 · Q3", title: "A wasted Saturday" },
      { when: "2025 · Q1", title: "Forty shops, one spreadsheet" },
      { when: "2025 · Q3", title: "The bot replaced the spreadsheet" },
      { when: "2026 · Q1", title: "412 verified shops" },
      { when: "Next", title: "City by city, category by category" },
    ]);

    // Color progression: grey -> grey -> amber -> green -> red
    expect(TIMELINE[0].dot).toBe("#76746E");
    expect(TIMELINE[1].dot).toBe("#76746E");
    expect(TIMELINE[2].dot).toBe("#B8741F");
    expect(TIMELINE[3].dot).toBe("#1F8A5B");
    expect(TIMELINE[4].dot).toBe("#CC3000");
  });

  it("defines team members with roles, notes, and initials", () => {
    expect(TEAM).toHaveLength(4);

    const names = TEAM.map((m) => m.name);
    expect(names).toEqual([
      "Selam Mekonnen",
      "Dawit Tesfaye",
      "Hanna Alemu",
      "Yonas Bekele",
    ]);

    for (const member of TEAM) {
      expect(member.initials).toHaveLength(2);
      expect(member.role).toBeDefined();
      expect(member.note).toBeDefined();
      expect(member.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("defines accurate stat figures and labels", () => {
    expect(ABOUT_STATS).toHaveLength(4);
    expect(ABOUT_STATS[0]).toEqual(["412", "verified shops in Bole"]);
    expect(ABOUT_STATS[1]).toEqual(["8,920", "listings live today"]);
    expect(ABOUT_STATS[2]).toEqual(["96%", "reconfirmed within 24h"]);
    expect(ABOUT_STATS[3]).toEqual(["0%", "commission, ever"]);
  });

  it("defines 'What we are' and 'What we are not' boundary lists", () => {
    expect(WHAT_WE_ARE).toHaveLength(4);
    expect(WHAT_WE_ARE_NOT).toHaveLength(4);

    expect(WHAT_WE_ARE).toContain("A directory of shops verified in person");
    expect(WHAT_WE_ARE_NOT).toContain("A payment processor or escrow service");
  });
});
