import { By, until } from "selenium-webdriver";

/**
 * BasePage class contains common functionality that ALL pages share
 * This follows the DRY principle (Don't Repeat Yourself)
 */
class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.timeout = 15000; // 15 seconds default timeout
  }

  /**
   * Navigate to a specific URL
   * @param {string} url - The URL to navigate to
   */
  async navigateTo(url) {
    console.log(`🌐 Navigating to: ${url}`);
    await this.driver.get(url);

    await this.driver.wait(until.titleContains(""), this.timeout);
    console.log("✅ Page navigation completed");
  }

  /**
   * Find an element with better error handling and logging
   * @param {By} locator - Selenium locator (By.id, By.css, etc.)
   * @param {string} elementName - Human-readable name for logging
   * @returns {WebElement} Found element
   */
  async findElement(locator, elementName = "element") {
    try {
      console.log(`🔍 Looking for ${elementName}...`);
      const element = await this.driver.findElement(locator);
      console.log(`✅ Found ${elementName}`);
      return element;
    } catch (error) {
      console.error(`❌ Could not find ${elementName}:`, error.message);
      throw new Error(`Element '${elementName}' not found`);
    }
  }

  /**
   * Wait for an element to be clickable before clicking
   * @param {By} locator - Element locator
   * @param {string} elementName - Human-readable name
   */
  async clickElement(locator, elementName = "element") {
    console.log(`👆 Clicking ${elementName}...`);

    // Wait for element to be clickable (visible and enabled)
    const element = await this.driver.wait(
      until.elementLocated(locator),
      this.timeout,
      `${elementName} not found within ${this.timeout}ms`
    );

    await this.driver.wait(
      until.elementIsEnabled(element),
      this.timeout,
      `${elementName} not clickable within ${this.timeout}ms`
    );

    await element.click();
    console.log(`✅ Successfully clicked ${elementName}`);
  }

  /**
   * Type text into an input field with clearing existing text
   * @param {By} locator - Element locator
   * @param {string} text - Text to type
   * @param {string} fieldName - Human-readable name
   */
  async typeText(locator, text, fieldName = "field") {
    console.log(`⌨️ Typing into ${fieldName}: "${text}"`);

    const element = await this.findElement(locator, fieldName);

    await element.clear();
    await element.sendKeys(text);

    console.log(`✅ Successfully typed into ${fieldName}`);
  }

  /**
   * Get text content from an element
   * @param {By} locator - Element locator
   * @param {string} elementName - Human-readable name
   * @returns {string} Element text
   */
  async getElementText(locator, elementName = "element") {
    console.log(`📖 Reading text from ${elementName}...`);
    const element = await this.findElement(locator, elementName);
    const text = await element.getText();
    console.log(`✅ Text from ${elementName}: "${text}"`);
    return text;
  }

  /**
   * Check if an element is displayed on the page
   * @param {By} locator - Element locator
   * @returns {boolean} True if element is visible
   */
  async isElementDisplayed(locator) {
    try {
      const element = await this.driver.findElement(locator);
      return await element.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for an element to disappear (useful for loading spinners)
   * @param {By} locator - Element locator
   * @param {string} elementName - Human-readable name
   */
  async waitForElementToDisappear(locator, elementName = "element") {
    console.log(`⏳ Waiting for ${elementName} to disappear...`);
    try {
      await this.driver.wait(
        until.stalenessOf(await this.driver.findElement(locator)),
        this.timeout
      );
      console.log(`✅ ${elementName} disappeared`);
    } catch (error) {
      console.log(`ℹ️ ${elementName} was not found or already gone`);
    }
  }

  /**
   * Get current page URL
   * @returns {string} Current URL
   */
  async getCurrentUrl() {
    const url = await this.driver.getCurrentUrl();
    console.log(`🌐 Current URL: ${url}`);
    return url;
  }

  /**
   * Get page title
   * @returns {string} Page title
   */
  async getPageTitle() {
    const title = await this.driver.getTitle();
    console.log(`📄 Page title: "${title}"`);
    return title;
  }
}

export default BasePage;
