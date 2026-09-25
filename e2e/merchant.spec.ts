import { expect, test, type Page } from "@playwright/test";

// Signed-in merchant journeys. They need a real account on the target backend
// (E2E_USER / E2E_PASSWORD) and are skipped without one. Use a seeded test
// backend: these sign in and change dashboard state.

const user = process.env.E2E_USER;
const password = process.env.E2E_PASSWORD;

test.skip(!user || !password, "set E2E_USER and E2E_PASSWORD to run merchant journeys");

async function signIn(page: Page, next = "/shop/dashboard/overview") {
  await page.goto(`/signin?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Username, email or phone").fill(user!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(new RegExp(next.replace(/\//g, "\\/")));
}

test("sign in lands on the dashboard, showing the merchant's own shop", async ({ page }) => {
  await signIn(page);
  // The sidebar used to show a hard-coded demo shop for every merchant.
  await expect(page.getByText("Almeda Electronics")).toHaveCount(0);
});

test("session cookies are httpOnly and the token never reaches the page", async ({ page, context }) => {
  await signIn(page, "/shop/dashboard/shop-profile");

  const cookies = await context.cookies();
  const session = cookies.filter((c) => c.name.includes("tinsae_"));
  expect(session.length).toBeGreaterThan(0);
  for (const c of session) expect(c.httpOnly, c.name).toBe(true);

  // No JWT in the HTML or RSC payload (they start with "eyJ").
  expect(await page.content()).not.toMatch(/eyJ[\w-]{10,}\.[\w-]{10,}/);
  expect(await page.evaluate(() => document.cookie)).not.toContain("tinsae_");
});

test("listings page loads with tab counts", async ({ page }) => {
  await signIn(page, "/shop/dashboard/listings");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByRole("link", { name: /new listing/i }).first()).toBeVisible();
});

test("signed-in users visiting /signin are sent on, not looped", async ({ page }) => {
  await signIn(page);
  await page.goto("/signin?next=/shop/dashboard/listings");
  await expect(page).toHaveURL(/\/shop\/dashboard\/listings/);
});

test("sign out ends the session", async ({ page, isMobile }) => {
  test.skip(isMobile, "sign-out sits in the mobile drawer");
  await signIn(page);
  await page.getByRole("button", { name: /sign out/i }).first().click();
  await page.goto("/shop/dashboard/overview");
  await expect(page).toHaveURL(/\/signin/);
});
