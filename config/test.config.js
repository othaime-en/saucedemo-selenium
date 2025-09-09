// Test configuration - centralized settings for our test suite
const config = {
  // Base URL for the application under test
  baseUrl: "https://www.saucedemo.com",

  // Browser settings
  browser: {
    name: process.env.BROWSER || "chrome", // Can be overridden with environment variable
    headless: process.env.HEADLESS === "true" || false,
    windowSize: {
      width: 1920,
      height: 1080,
    },
  },

  // Timeouts (in milliseconds)
  timeouts: {
    implicit: 20000, // How long to wait for elements to appear
    explicit: 30000, // How long to wait for specific conditions
    pageLoad: 60000, // How long to wait for pages to load
  },

  // Test credentials (we'll move these to env variables later for security)
  testUsers: {
    standard: {
      username: "standard_user",
      password: "secret_sauce",
    },
    locked: {
      username: "locked_out_user",
      password: "secret_sauce",
    },
    problem: {
      username: "problem_user",
      password: "secret_sauce",
    },
    performance: {
      username: "performance_glitch_user",
      password: "secret_sauce",
    },
  },
};

export default config;
