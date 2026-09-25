import { expect, test } from "@playwright/test";

// Anonymous buyer journeys. Read-only: safe against any environment with data.

test("home page renders and links into the catalogue", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator('a[href^="/products"]').first()).toBeAttached();
});

test("browse listings and open a product", async ({ page }) => {
  await page.goto("/products");

  const firstCard = page.locator('main a[href^="/products/"]').first();
  await expect(firstCard).toBeVisible();
  const href = await firstCard.getAttribute("href");
  await firstCard.click();

  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.locator("h1")).toBeVisible();
  // The price panel is the reason buyers come: it must render.
  await expect(page.getByText(/ETB\s[\d,]+/).first()).toBeVisible();
});

test("product pages carry structured data for search engines", async ({ page, request }) => {
  await page.goto("/products");
  const href = await page.locator('main a[href^="/products/"]').first().getAttribute("href");

  const html = await (await request.get(href!)).text();
  const match = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/);
  expect(match, "Product JSON-LD present").not.toBeNull();
  const data = JSON.parse(match![1]);
  expect(data["@type"]).toBe("Product");
  expect(data.offers.price).toBeTruthy();
  expect(html).toContain('property="og:title"');
});

test("search from the header lands on filtered results", async ({ page, isMobile }) => {
  test.skip(isMobile, "the mobile header search lives in the menu drawer");
  await page.goto("/");
  const search = page.getByRole("search").getByLabel("Search products");
  await search.fill("phone");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/products\?q=phone/);
});

test("unknown pages return a real 404", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("doesn't exist.")).toBeVisible();
});

test("the dashboard is not reachable signed out", async ({ page }) => {
  await page.goto("/shop/dashboard/overview");
  await expect(page).toHaveURL(/\/signin\?next=%2Fshop%2Fdashboard%2Foverview/);
});

test("security headers are sent", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["x-frame-options"]).toBe("DENY");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(res.headers()["x-powered-by"]).toBeUndefined();
});
