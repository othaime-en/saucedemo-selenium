import { expect } from "chai";
import WebDriverManager from "../utils/WebDriverManager.js";
import LoginPage from "../pages/LoginPage.js";
import config from "../config/test.config.js";

/**
 * Login functionality test suite
 * These tests verify that users can log in successfully and handle errors properly
 */
describe("SauceDemo Login Functionality", function () {
  let driverManager;
  let driver;
  let loginPage;

  beforeEach(async function () {
    console.log("\n🔧 Setting up test environment...");

    // Create browser instance
    driverManager = new WebDriverManager();
    driver = await driverManager.createDriver(
      config.browser.name,
      config.browser.headless
    );

    // Create page object instance
    loginPage = new LoginPage(driver);

    console.log("✅ Test environment ready");
  });

  afterEach(async function () {
    console.log("🧹 Cleaning up test environment...");
    await driverManager.quitDriver();
  });

  /**
   * TEST 1: Successful login with valid credentials
   * This is a "positive" test - testing the happy path
   */
  it("should successfully login with valid credentials", async function () {
    console.log("\n🧪 TEST: Valid login attempt");

    // Step 1: Open login page
    await loginPage.open();

    // Step 2: Perform login
    await loginPage.login(
      config.testUsers.standard.username,
      config.testUsers.standard.password
    );

    // Step 3: Verify we're redirected to products page
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include("/inventory.html");

    // Step 4: Verify we're no longer on login page
    const stillOnLoginPage = await loginPage.isOnLoginPage();
    expect(stillOnLoginPage).to.be.false;

    console.log("🎉 Valid login test passed!");
  });

  /**
   * TEST 2: Login failure with invalid credentials
   * This is a "negative" test - testing error conditions
   */
  it("should show error message with invalid credentials", async function () {
    console.log("\n🧪 TEST: Invalid login attempt");

    // Step 1: Open login page
    await loginPage.open();

    // Step 2: Try to login with wrong credentials
    await loginPage.login("invalid_user", "wrong_password");

    // Step 3: Verify error message appears
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).to.not.be.null;
    expect(errorMessage).to.include("Username and password do not match");

    // Step 4: Verify we're still on login page
    const stillOnLoginPage = await loginPage.isOnLoginPage();
    expect(stillOnLoginPage).to.be.true;

    console.log("🎉 Invalid login test passed!");
  });

  /**
   * TEST 3: Login with locked out user
   * Testing specific business rule
   */
  it("should show error message for locked out user", async function () {
    console.log("\n🧪 TEST: Locked out user login attempt");

    await loginPage.open();

    await loginPage.login(
      config.testUsers.locked.username,
      config.testUsers.locked.password
    );

    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).to.include("Sorry, this user has been locked out");

    console.log("🎉 Locked out user test passed!");
  });

  /**
   * TEST 4: Empty credentials validation
   * Testing form validation
   */
  it("should show error message when login fields are empty", async function () {
    console.log("\n🧪 TEST: Empty credentials");

    await loginPage.open();

    // Just click login without entering anything
    await loginPage.clickLoginButton();

    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).to.include("Username is required");

    console.log("🎉 Empty credentials test passed!");
  });

  /**
   * TEST 5: Page elements verification
   * Testing that all expected elements are present
   */
  it("should display all required login page elements", async function () {
    console.log("\n🧪 TEST: Login page elements verification");

    await loginPage.open();

    // Verify all elements are displayed
    const usernameDisplayed = await loginPage.isElementDisplayed(
      loginPage.locators.usernameField
    );
    const passwordDisplayed = await loginPage.isElementDisplayed(
      loginPage.locators.passwordField
    );
    const loginButtonDisplayed = await loginPage.isElementDisplayed(
      loginPage.locators.loginButton
    );
    const logoDisplayed = await loginPage.isElementDisplayed(
      loginPage.locators.logoImage
    );

    expect(usernameDisplayed).to.be.true;
    expect(passwordDisplayed).to.be.true;
    expect(loginButtonDisplayed).to.be.true;
    expect(logoDisplayed).to.be.true;

    console.log("🎉 Page elements verification passed!");
  });
});
