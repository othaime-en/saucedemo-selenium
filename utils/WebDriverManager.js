import { Builder, Browser, TouchSequence } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import firefox from "selenium-webdriver/firefox.js";

class WebDriverManager {
  constructor() {
    this.driver = null;
  }

  /**
   * Creates and configures a WebDriver instance
   * @param {string} browserName - 'chrome' or 'firefox'
   * @param {boolean} headless - Run browser without GUI (faster for CI/CD)
   * @returns {WebDriver} Configured WebDriver instance
   */
  async createDriver(browserName = "chrome", headless = false) {
    try {
      console.log(`🚀 Starting ${browserName} browser...`);

      if (browserName.toLowerCase() === "chrome") {
        // Chrome-specific options
        const chromeOptions = new chrome.Options();

        if (headless) {
          chromeOptions.addArguments("--headless"); // Run without GUI
        }

        // These options make Chrome more stable for automation
        chromeOptions.addArguments("--no-sandbox");
        chromeOptions.addArguments("--disable-dev-shm-usage");
        chromeOptions.addArguments("--disable-gpu");
        chromeOptions.addArguments("--window-size=1920,1080"); // Set consistent window size

        this.driver = await new Builder()
          .forBrowser(Browser.CHROME)
          .setChromeOptions(chromeOptions)
          .build();
      } else if (browserName.toLowercase() === "firefox") {
        const firefoxOptions = new firefox.Options();

        if (headless) {
          firefoxOptions.addArguments("--headless");
        }

        firefoxOptions.addArguments("--width=1920");
        firefoxOptions.addArguments("--height=1080");

        this.driver = await new Builder()
          .forBrowser(Browser.FIREFOX)
          .addArguments(firefoxOptions)
          .build();
      } else {
        throw new Error(`Unsupported browser: ${browserName}`);
      }

      // Set implicit wait - WebDriver will wait up to 10 seconds for elements to appear
      await this.driver.manage().setTimeouts({ implicit: 10000 });

      console.log("✅ Browser started successfully");
      return this.driver;
    } catch (error) {
      console.error("❌ Failed to start browser:", error.message);
      throw error;
    }
  }

  /**
   * Safely closes the browser
   */
  async quitDriver() {
    if (this.driver) {
      try {
        await this.driver.quit();
        console.log("🔚 Browser closed successfully");
      } catch (error) {
        console.error("⚠️ Error closing browser:", error.message);
      }
    }
  }

  /**
   * Get the current driver instance
   */
  getDriver() {
    return this.driver;
  }
}

export default WebDriverManager;
