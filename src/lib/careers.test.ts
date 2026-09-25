import { describe, expect, it } from "vitest";
import {
  CAREERS_EMAIL,
  getRoleById,
  ROLES,
  Role,
} from "@/components/careers/data";

describe("Careers Data and Role Schema", () => {
  it("exports valid careers email", () => {
    expect(CAREERS_EMAIL).toBe("careers@tinsae.et");
  });

  it("contains valid roles with all required fields per acceptance criteria", () => {
    expect(ROLES.length).toBeGreaterThan(0);

    ROLES.forEach((role: Role) => {
      expect(role.id).toBeDefined();
      expect(typeof role.id).toBe("string");
      expect(role.title).toBeDefined();
      expect(role.department).toBeDefined();
      expect(role.location).toBeDefined();
      expect(["full-time", "part-time", "contract", "internship"]).toContain(
        role.type
      );
      expect(role.summary).toBeDefined();
      expect(role.summary.length).toBeGreaterThan(10);
      expect(Array.isArray(role.responsibilities)).toBe(true);
      expect(role.responsibilities.length).toBeGreaterThan(0);
      expect(Array.isArray(role.requirements)).toBe(true);
      expect(role.requirements.length).toBeGreaterThan(0);
      expect(Array.isArray(role.niceToHave)).toBe(true);
      expect(role.postedAt).toBeDefined();
      expect(new Date(role.postedAt).toString()).not.toBe("Invalid Date");
    });
  });

  it("finds roles by id via getRoleById", () => {
    const firstRole = ROLES[0];
    const found = getRoleById(firstRole.id);
    expect(found).toBeDefined();
    expect(found?.title).toBe(firstRole.title);

    const notFound = getRoleById("non-existent-role-id");
    expect(notFound).toBeUndefined();
  });
});
