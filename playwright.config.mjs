import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }]
  ],
  use: {
    baseURL: process.env.QA_BASE_URL || "http://127.0.0.1:3000",
    extraHTTPHeaders: {
      "content-type": "application/json"
    }
  }
});
