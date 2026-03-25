import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/tests",
  timeout: 30_000,
  webServer: [
    {
      command: "npm.cmd --workspace server run dev",
      port: 4000,
      reuseExistingServer: true,
      timeout: 120_000
    },
    {
      command: "npm.cmd --workspace client run dev",
      port: 5173,
      reuseExistingServer: true,
      timeout: 120_000
    }
  ],
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure"
  }
});
