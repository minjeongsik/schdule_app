import { expect, test } from "@playwright/test";

test("todo crud flow", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Title").fill("Playwright todo");
  await page.getByLabel("Description").fill("Run end to end CRUD");
  await page.getByRole("button", { name: "Add Todo" }).click();

  await expect(page.getByText("Playwright todo")).toBeVisible();

  await page.getByRole("link", { name: "View" }).first().click();
  await expect(page.getByText("Detail")).toBeVisible();

  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByText("Playwright todo")).toBeVisible();

  await page.getByRole("button", { name: "Delete" }).first().click();
});
