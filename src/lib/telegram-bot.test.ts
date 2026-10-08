import { describe, expect, it } from "vitest";
import { metadata } from "@/app/(common)/telegram-bot/page";
import {
  COMMANDS,
  FAQ_ITEMS,
  GETTING_STARTED_STEPS,
  HOW_IT_WORKS_STEPS,
} from "@/components/telegram-bot/types";
import sitemap from "@/app/sitemap";

describe("Telegram Bot Page Metadata and Technical Spec", () => {
  it("exports valid page title, meta description, and open graph tags", () => {
    expect(metadata.title).toBe("Telegram Bot — Keep your listings fresh in one tap | Tinsae");
    expect(metadata.description).toBeDefined();
    expect(typeof metadata.description).toBe("string");
    expect(metadata.description?.length).toBeGreaterThan(20);

    const og = metadata.openGraph;
    expect(og).toBeDefined();
    if (og && typeof og === "object") {
      const ogObj = og as Record<string, unknown>;
      expect(ogObj.title).toBe("Telegram Bot — Keep your listings fresh in one tap | Tinsae");
      expect(ogObj.type).toBe("website");
      expect(ogObj.url).toBe("https://tinsae.et/telegram-bot");
      expect(ogObj.siteName).toBe("Tinsae");
    }

    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it("registers /telegram-bot in sitemap for public SEO indexability", async () => {
    const entries = await sitemap();
    const entry = entries.find((e) => e.url.endsWith("/telegram-bot"));
    expect(entry).toBeDefined();
  });
});

describe("Telegram Bot Content Specifications", () => {
  it("defines the 3 How It Works steps matching the design handoff", () => {
    expect(HOW_IT_WORKS_STEPS).toHaveLength(3);

    const titles = HOW_IT_WORKS_STEPS.map((s) => s.title);
    expect(titles).toEqual([
      "Weekly check-in",
      "One-tap answer",
      "Higher ranking",
    ]);

    const labels = HOW_IT_WORKS_STEPS.map((s) => s.stepLabel);
    expect(labels).toEqual(["STEP 1", "STEP 2", "STEP 3"]);
  });

  it("defines all 7 chat commands matching the design spec", () => {
    expect(COMMANDS).toHaveLength(7);

    const commandNames = COMMANDS.map((c) => c.command);
    expect(commandNames).toEqual([
      "/menu",
      "/myproducts",
      "/status",
      "/pause_shop",
      "/resume_shop",
      "/unlink",
      "/help",
    ]);

    for (const cmd of COMMANDS) {
      expect(cmd.command.startsWith("/")).toBe(true);
      expect(cmd.description.length).toBeGreaterThan(15);
    }
  });

  it("defines the 3 Getting Started steps", () => {
    expect(GETTING_STARTED_STEPS).toHaveLength(3);

    const stepNumbers = GETTING_STARTED_STEPS.map((s) => s.step);
    expect(stepNumbers).toEqual(["01", "02", "03"]);

    const titles = GETTING_STARTED_STEPS.map((s) => s.title);
    expect(titles).toEqual([
      "Create your shop account",
      "Connect Telegram",
      "Confirm on your due date",
    ]);
  });

  it("defines all 4 FAQ items matching the design", () => {
    expect(FAQ_ITEMS).toHaveLength(4);

    const questions = FAQ_ITEMS.map((f) => f.question);
    expect(questions).toEqual([
      "What happens if I miss a check-in?",
      "I'm going away. Can I pause everything?",
      "Can I disconnect the bot?",
      "Does the bot cost anything?",
    ]);

    for (const item of FAQ_ITEMS) {
      expect(item.question.length).toBeGreaterThan(10);
      expect(item.answer.length).toBeGreaterThan(20);
    }
  });
});
