import { expect } from "chai";
import WebDriverManager from "../utils/WebDriverManager.js";

// This is a test suite - a group of related tests
describe("Basic SauceDemo Connection Test", function () {
  let driverManager;
  let driver;

  // This runs BEFORE each test
  beforeEach(async function () {
    console.log("\n🧪 Setting up test...");
    driverManager = new WebDriverManager();
    driver = await driverManager.createDriver("chrome", false); // visible browser for learning
  });

  // This runs AFTER each test (cleanup)
  afterEach(async function () {
    console.log("🧹 Cleaning up test...");
    await driverManager.quitDriver();
  });

  it("should open SauceDemo and verify the page loads correctly", async function () {
    console.log("📖 Test: Opening SauceDemo website...");

    // Step 1: Navigate to the website
    await driver.get("https://www.saucedemo.com");
    console.log("✅ Navigated to SauceDemo");

    // Step 2: Get the page title
    const title = await driver.getTitle();
    console.log(`📄 Page title: "${title}"`);

    // Step 3: Verify the title is correct
    expect(title).to.equal("Swag Labs");
    console.log("✅ Title verification passed");

    // Step 4: Check if login elements are present
    const usernameField = await driver.findElement({ id: "user-name" });
    const passwordField = await driver.findElement({ id: "password" });
    const loginButton = await driver.findElement({ id: "login-button" });

    // Step 5: Verify elements are displayed
    const isUsernameVisible = await usernameField.isDisplayed();
    const isPasswordVisible = await passwordField.isDisplayed();
    const isLoginButtonVisible = await loginButton.isDisplayed();

    expect(isUsernameVisible).to.be.true;
    expect(isPasswordVisible).to.be.true;
    expect(isLoginButtonVisible).to.be.true;

    console.log("✅ All login elements are visible and present");
    console.log("🎉 Test completed successfully!");
  });

  it("should display the correct login placeholder texts", async function () {
    console.log("📖 Test: Checking login field placeholders...");

    await driver.get("https://www.saucedemo.com");

    // Find elements and get their placeholder attributes
    const usernameField = await driver.findElement({ id: "user-name" });
    const passwordField = await driver.findElement({ id: "password" });

    const usernamePlaceholder = await usernameField.getAttribute("placeholder");
    const passwordPlaceholder = await passwordField.getAttribute("placeholder");

    console.log(`👤 Username placeholder: "${usernamePlaceholder}"`);
    console.log(`🔒 Password placeholder: "${passwordPlaceholder}"`);

    // Verify placeholders are correct
    expect(usernamePlaceholder).to.equal("Username");
    expect(passwordPlaceholder).to.equal("Password");

    console.log("✅ Placeholder text verification passed");
  });
});
