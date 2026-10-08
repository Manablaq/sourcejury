import {
  defineConfig,
  devices
} from "@playwright/test";

const port = 3115;

const baseURL =
  `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir:
    "./tests/e2e",

  fullyParallel:
    false,

  workers:
    1,

  retries:
    0,

  timeout:
    240_000,

  globalTimeout:
    2_700_000,

  expect: {
    timeout:
      30_000
  },

  outputDir:
    process.env.SOURCEJURY_P5_OUTPUT ??
    "test-results",

  reporter: [
    [
      "line"
    ],

    [
      "json",
      {
        outputFile:
          process.env.SOURCEJURY_P5_JSON_REPORT ??
          "test-results/results.json"
      }
    ],

    [
      "html",
      {
        outputFolder:
          process.env.SOURCEJURY_P5_HTML_REPORT ??
          "playwright-report",
        open:
          "never"
      }
    ]
  ],

  use: {
    baseURL,

    trace:
      "retain-on-failure",

    screenshot:
      "only-on-failure",

    video:
      "off",

    actionTimeout:
      20_000,

    navigationTimeout:
      45_000
  },

  webServer: {
    command:
      `npm run start -- -p ${port}`,

    url:
      baseURL,

    timeout:
      120_000,

    reuseExistingServer:
      false,

    gracefulShutdown: {
      signal:
        "SIGTERM",
      timeout:
        5_000
    }
  },

  projects: [
    {
      name:
        "chromium",

      use: {
        ...devices[
          "Desktop Chrome"
        ]
      }
    },

    {
      name:
        "firefox",

      use: {
        ...devices[
          "Desktop Firefox"
        ]
      }
    },

    {
      name:
        "webkit",

      use: {
        ...devices[
          "Desktop Safari"
        ]
      }
    }
  ]
});
