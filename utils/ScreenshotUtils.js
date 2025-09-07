import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

/**
 * ScreenshotUtils - Handles screenshot capture and evidence collection
 */
class ScreenshotUtils {
  constructor(driver) {
    this.driver = driver;

    // Setup directories
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.projectRoot = path.join(__dirname, "..");
    this.screenshotsDir = path.join(this.projectRoot, "reports", "screenshots");
    this.evidenceDir = path.join(this.projectRoot, "reports", "evidence");

    // Ensure directories exist
    this.ensureDirectoriesExist();

    console.log("📸 ScreenshotUtils initialized");
  }

  async ensureDirectoriesExist() {
    try {
      await fs.mkdir(this.screenshotsDir, { recursive: true });
      await fs.mkdir(this.evidenceDir, { recursive: true });
    } catch (error) {
      console.log("ℹ️ Directories already exist or created");
    }
  }

  /**
   * Take a screenshot with descriptive filename
   * @param {string} testName - Name of the test
   * @param {string} step - Current step description
   * @param {string} type - 'success', 'failure', 'step'
   * @returns {string} Screenshot file path
   */
  async takeScreenshot(testName, step = "screenshot", type = "step") {
    try {
      console.log(`📸 Taking ${type} screenshot: ${step}`);

      // Generate timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .split(".")[0];

      // Create descriptive filename
      const sanitizedTestName = testName.replace(/[^a-zA-Z0-9]/g, "_");
      const sanitizedStep = step.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${timestamp}_${sanitizedTestName}_${sanitizedStep}_${type}.png`;

      const screenshotPath = path.join(this.screenshotsDir, filename);

      // Take screenshot
      const screenshot = await this.driver.takeScreenshot();
      await fs.writeFile(screenshotPath, screenshot, "base64");

      console.log(`✅ Screenshot saved: ${filename}`);
      return screenshotPath;
    } catch (error) {
      console.error("❌ Failed to take screenshot:", error.message);
      return null;
    }
  }

  /**
   * Take screenshot on test failure with additional context
   * @param {string} testName - Name of the failed test
   * @param {Error} error - The error that caused the failure
   * @returns {Object} Screenshot info with metadata
   */
  async captureFailureEvidence(testName, error) {
    console.log("🔍 Capturing failure evidence...");

    try {
      const screenshotPath = await this.takeScreenshot(
        testName,
        "FAILURE",
        "failure"
      );

      // Gather additional context
      const currentUrl = await this.driver.getCurrentUrl();
      const pageTitle = await this.driver.getTitle();
      const timestamp = new Date().toISOString();

      // Get page source (HTML) for debugging
      const pageSource = await this.driver.getPageSource();

      const evidence = {
        testName: testName,
        timestamp: timestamp,
        screenshotPath: screenshotPath,
        error: {
          message: error.message,
          stack: error.stack,
        },
        browserState: {
          url: currentUrl,
          title: pageTitle,
        },
        pageSource: pageSource,
      };

      // Save evidence JSON
      const evidenceFileName = `failure_${Date.now()}_${testName.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}.json`;
      const evidencePath = path.join(this.evidenceDir, evidenceFileName);
      await fs.writeFile(evidencePath, JSON.stringify(evidence, null, 2));

      console.log(`📋 Failure evidence saved: ${evidenceFileName}`);
      console.log(`📸 Screenshot: ${path.basename(screenshotPath)}`);
      console.log(`🌐 URL at failure: ${currentUrl}`);

      return evidence;
    } catch (captureError) {
      console.error(
        "❌ Failed to capture failure evidence:",
        captureError.message
      );
      return null;
    }
  }

  /**
   * Take screenshot at key test steps for documentation
   * @param {string} testName - Test name
   * @param {string} stepDescription - Description of current step
   */
  async captureStep(testName, stepDescription) {
    return await this.takeScreenshot(testName, stepDescription, "step");
  }

  /**
   * Take screenshot when test passes for positive evidence
   * @param {string} testName - Test name
   */
  async captureSuccess(testName) {
    return await this.takeScreenshot(testName, "SUCCESS", "success");
  }

  /**
   * Get browser information for debugging
   * @returns {Object} Browser and system information
   */
  async getBrowserInfo() {
    try {
      const capabilities = await this.driver.getCapabilities();
      return {
        browserName: capabilities.get("browserName"),
        browserVersion: capabilities.get("browserVersion"),
        platform: capabilities.get("platform"),
        userAgent: await this.driver.executeScript(
          "return navigator.userAgent;"
        ),
      };
    } catch (error) {
      console.log("ℹ️ Could not retrieve browser info");
      return {};
    }
  }

  /**
   * Clean up old screenshots (keep only recent ones)
   * @param {number} daysToKeep - Number of days to keep screenshots
   */
  async cleanupOldScreenshots(daysToKeep = 7) {
    try {
      console.log(
        `🧹 Cleaning up screenshots older than ${daysToKeep} days...`
      );

      const files = await fs.readdir(this.screenshotsDir);
      const now = Date.now();
      const keepThreshold = daysToKeep * 24 * 60 * 60 * 1000; // Convert to milliseconds

      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.screenshotsDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtime.getTime() > keepThreshold) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      console.log(`🗑️ Deleted ${deletedCount} old screenshot files`);
    } catch (error) {
      console.log("ℹ️ Screenshot cleanup completed or not needed");
    }
  }
}

export default ScreenshotUtils;
