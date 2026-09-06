import { expect, test } from "@playwright/test";

function collectPageErrors(page: Parameters<typeof test>[0]["page"]) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("core navigation and responsive shell are usable", async ({ page }) => {
  const errors = collectPageErrors(page);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Vouch" })).toBeVisible();
  await page.getByRole("button", { name: /Get started/i }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole("heading", { name: "Rahul K\." })).toBeVisible();

  for (const [label, heading] of [
    ["Map", "Road Map"],
    ["Score", "Vouch Score"],
    ["History", "Ride History"],
  ] as const) {
    await page.getByRole("link", { name: label }).click();
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }

  await page.getByRole("link", { name: "Home" }).click();
  await expect(page.getByRole("button", { name: /Start Live Ride/i })).toBeVisible();
  expect(errors).toEqual([]);
});

test("hero manoeuvre flow can be completed with taps", async ({ page }) => {
  const errors = collectPageErrors(page);

  await page.goto("/demo");
  await expect(page.getByRole("heading", { name: "Demo Controls" })).toBeVisible();
  await page.getByRole("button", { name: /Pothole \+ Vehicle/i }).click();
  await expect(page).toHaveURL(/\/ride$/);

  await expect(page.getByText("Manoeuvre detected")).toBeVisible();
  await page.getByText("Manoeuvre detected").click();
  await expect(page.getByText("Understanding the context")).toBeVisible();
  await page.getByText("Understanding the context").click();
  await expect(page.getByText("Likely Justified")).toBeVisible();
  await page.getByRole("button", { name: /Continue$/i }).click();
  await expect(page.getByText("Added to shared road intelligence")).toBeVisible();
  await expect(page.getByText(/8 reports/)).toBeVisible();
  await expect(page.getByText(/7 riders/)).toBeVisible();
  await page.getByRole("button", { name: /Continue riding/i }).click();
  await expect(page.getByText("Context saved")).toBeVisible();
  await expect(page.getByRole("button", { name: /Simulate Manoeuvre/i })).toBeVisible({
    timeout: 8_000,
  });

  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page).toHaveURL(/\/home$/);
  expect(errors).toEqual([]);
});

test("demo controls ignore a second scenario while processing", async ({ page }) => {
  const errors = collectPageErrors(page);

  await page.goto("/demo");
  const hero = page.getByRole("button", { name: /Pothole \+ Vehicle/i });
  // Dispatch both clicks in one browser task. The controller lock is set before
  // its first await, so only one rider event should be persisted.
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find((element) =>
      element.textContent?.includes("Pothole + Vehicle"),
    );
    if (!button) throw new Error("Hero scenario button not found");
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await expect(page).toHaveURL(/\/ride$/);
  await page.goto("/history");
  await expect(page.getByRole("heading", { name: "Ride History" })).toBeVisible();
  await expect(page.getByRole("button")).toHaveCount(3);
  await expect(page.getByRole("button", { name: /Lateral movement/ })).toHaveCount(2);
  expect(errors).toEqual([]);
});

test("phone layout has no horizontal overflow at a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/home");
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
  await expect(page.getByRole("button", { name: /Start Live Ride/i })).toBeVisible();
});
