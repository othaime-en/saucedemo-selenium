import { By } from "selenium-webdriver";
import BasePage from "./BasePage.js";

/**
 * LoginPage class represents the SauceDemo login page
 * This encapsulates ALL interactions with the login page
 */
class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);

    this.locators = {
      usernameField: By.id("user-name"),
      passwordField: By.id("password"),
      loginButton: By.id("login-button"),
      errorMessage: By.css('[data-test="error"]'),
      logoImage: By.css(".login_logo"),
      loginContainer: By.id("login_button_container"),
    };

    console.log("🏠 LoginPage object created");
  }

  /**
   * Navigate to the login page
   */
  async open() {
    console.log("🚪 Opening SauceDemo login page...");
    await this.navigateTo("https://www.saucedemo.com");

    // Verify we're actually on the login page
    const isLoginPageLoaded = await this.isElementDisplayed(
      this.locators.loginButton
    );
    if (!isLoginPageLoaded) {
      throw new Error("Login page did not load correctly");
    }

    console.log("✅ Login page loaded successfully");
  }

  /**
   * @param {string} username - Username to type
   */
  async enterUsername(username) {
    console.log(`👤 Entering username: ${username}`);
    await this.typeText(
      this.locators.usernameField,
      username,
      "username field"
    );
  }

  /**
   * @param {string} password - Password to type
   */
  async enterPassword(password) {
    console.log(`🔒 Entering password: ${"*".repeat(password.length)}`); // Hide actual password in logs
    await this.typeText(
      this.locators.passwordField,
      password,
      "password field"
    );
  }

  /**
   * Click the login button
   */
  async clickLoginButton() {
    await this.clickElement(this.locators.loginButton, "login button");
  }

  /**
   * @param {string} username - Username
   * @param {string} password - Password
   */
  async login(username, password) {
    console.log(`🔐 Performing login for user: ${username}`);

    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();

    console.log("✅ Login process completed");
  }

  /**
   * Get error message text (for negative testing)
   * @returns {string} Error message text
   */
  async getErrorMessage() {
    console.log("🚨 Checking for error message...");

    const isErrorDisplayed = await this.isElementDisplayed(
      this.locators.errorMessage
    );
    if (!isErrorDisplayed) {
      return null; // No error message
    }

    return await this.getElementText(
      this.locators.errorMessage,
      "error message"
    );
  }

  /**
   * Check if we're still on the login page (useful for negative tests)
   * @returns {boolean} True if still on login page
   */
  async isOnLoginPage() {
    const currentUrl = await this.getCurrentUrl();
    return (
      currentUrl.includes("saucedemo.com") &&
      (await this.isElementDisplayed(this.locators.loginButton))
    );
  }

  /**
   * Get all available test usernames from the page
   * @returns {string[]} Array of available usernames
   */
  async getAvailableUsernames() {
    console.log("📋 Reading available test usernames from page...");

    try {
      // SauceDemo shows usernames in a specific div
      const usernamesElement = await this.findElement(
        By.id("login_credentials"),
        "usernames list"
      );

      const usernamesText = await usernamesElement.getText();

      // Parse the text to extract usernames
      const usernames = usernamesText
        .split("\n")
        .filter((line) => line.includes("_user"))
        .map((line) => line.trim());

      console.log(
        `✅ Found ${usernames.length} available usernames:`,
        usernames
      );
      return usernames;
    } catch (error) {
      console.log("ℹ️ Could not read usernames from page");
      return [];
    }
  }
}

export default LoginPage;
