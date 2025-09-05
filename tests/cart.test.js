import { expect } from "chai";
import WebDriverManager from "../utils/WebDriverManager.js";
import LoginPage from "../pages/LoginPage.js";
import ProductsPage from "../pages/ProductsPage.js";
import CartPage from "../pages/CartPage.js";
import TestDataReader from "../utils/TestDataReader.js";
import config from "../config/test.config.js";

/**
 * Shopping Cart and Data-Driven Testing Suite
 */
describe("SauceDemo Shopping Cart and Checkout", function () {
  let driverManager;
  let driver;
  let loginPage;
  let productsPage;
  let cartPage;
  let testDataReader;

  // Initialize test data reader
  before(async function () {
    console.log("🔧 Initializing test data reader...");
    testDataReader = new TestDataReader();
    console.log("✅ Test data reader ready");
  });

  beforeEach(async function () {
    console.log("\n🔧 Setting up test session...");

    driverManager = new WebDriverManager();
    driver = await driverManager.createDriver(
      config.browser.name,
      config.browser.headless
    );

    // Create all page objects
    loginPage = new LoginPage(driver);
    productsPage = new ProductsPage(driver);
    cartPage = new CartPage(driver);

    // Login with standard user
    await loginPage.open();
    await loginPage.login(
      config.testUsers.standard.username,
      config.testUsers.standard.password
    );

    console.log("✅ Test session ready");
  });

  afterEach(async function () {
    await driverManager.quitDriver();
  });

  /**
   * TEST 1: Basic cart functionality
   */
  it("should add items to cart and display them correctly", async function () {
    console.log("\n🧪 TEST: Basic cart functionality");

    // Add items from products page
    await productsPage.addProductToCartByName("Sauce Labs Backpack");
    await productsPage.addProductToCartByName("Sauce Labs Bike Light");

    // Navigate to cart
    await productsPage.goToCart();

    // Verify we're on cart page
    expect(await cartPage.isOnCartPage()).to.be.true;

    // Verify cart contents
    const cartItems = await cartPage.getCartItems();
    expect(cartItems).to.have.length(2);

    const itemNames = cartItems.map((item) => item.name);
    expect(itemNames).to.include("Sauce Labs Backpack");
    expect(itemNames).to.include("Sauce Labs Bike Light");

    console.log("🎉 Basic cart functionality test passed!");
  });

  /**
   * TEST 2: Cart item removal
   */
  it("should remove items from cart correctly", async function () {
    console.log("\n🧪 TEST: Cart item removal");

    // Add multiple items
    await productsPage.addMultipleProductsToCart([
      "Sauce Labs Backpack",
      "Sauce Labs Bike Light",
      "Sauce Labs Bolt T-Shirt",
    ]);

    // Go to cart
    await productsPage.goToCart();

    // Verify initial cart state
    let cartItems = await cartPage.getCartItems();
    expect(cartItems).to.have.length(3);

    // Remove one item
    await cartPage.removeItemFromCart("Sauce Labs Bike Light");

    // Verify item was removed
    cartItems = await cartPage.getCartItems();
    expect(cartItems).to.have.length(2);

    const remainingNames = cartItems.map((item) => item.name);
    expect(remainingNames).to.not.include("Sauce Labs Bike Light");
    expect(remainingNames).to.include("Sauce Labs Backpack");
    expect(remainingNames).to.include("Sauce Labs Bolt T-Shirt");

    console.log("🎉 Cart item removal test passed!");
  });

  /**
   * TEST 3: Data-driven checkout with multiple scenarios
   */
  it("should complete checkout with different shopping scenarios", async function () {
    console.log("\n🧪 TEST: Data-driven checkout scenarios");

    // Get shopping scenarios from test data
    const scenarios = await testDataReader.getShoppingScenarios();
    console.log(`🎯 Testing ${scenarios.length} shopping scenarios`);

    // Test first scenario (to keep test time reasonable)
    const scenario = scenarios[0]; // Single item purchase
    console.log(`🛍️ Testing scenario: ${scenario.scenario}`);

    // Add products from scenario
    for (const productName of scenario.products) {
      await productsPage.addProductToCartByName(productName);
    }

    // Go to cart and verify subtotal calculation
    await productsPage.goToCart();
    const calculatedSubtotal = await cartPage.calculateExpectedSubtotal();

    // Allow for small floating point differences
    const tolerance = 0.01;
    expect(
      Math.abs(calculatedSubtotal - scenario.expectedSubtotal)
    ).to.be.below(tolerance);

    // Get checkout data
    const checkoutInfo = await testDataReader.getRandomCheckoutInfo();

    // Complete checkout process
    const checkoutResult = await cartPage.completeCheckout(checkoutInfo);

    // Verify order completion
    expect(checkoutResult.completion.header).to.include(
      "Thank you for your order!"
    );

    console.log(`🎉 Scenario "${scenario.scenario}" completed successfully!`);
  });

  /**
   * TEST 4: Data-driven user login testing
   * Tests with different user types from CSV data
   */
  it("should handle different user types from test data", async function () {
    console.log("\n🧪 TEST: Data-driven user login testing");

    // Get user test data
    const invalidUsers = await testDataReader.getInvalidUsers();
    console.log(
      `🎯 Testing with ${invalidUsers.length} invalid user scenarios`
    );

    // Test first invalid user scenario
    const testUser = invalidUsers[0];
    console.log(`👤 Testing user: ${testUser.description}`);

    // Logout current session
    await productsPage.logout();

    // Try login with test data
    await loginPage.login(testUser.username, testUser.password);

    if (testUser.expectedResult === "error") {
      // Should get error message
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).to.not.be.null;
      console.log(`✅ Expected error received: ${errorMessage}`);

      // Should still be on login page
      const stillOnLogin = await loginPage.isOnLoginPage();
      expect(stillOnLogin).to.be.true;
    }

    console.log("🎉 Data-driven user testing passed!");
  });

  /**
   * TEST 5: Complete end-to-end workflow with data validation
   */
  it("should complete full shopping workflow with price validation", async function () {
    console.log("\n🧪 TEST: Complete end-to-end shopping workflow");

    // Step 1: Add products to cart
    const productsToAdd = ["Sauce Labs Backpack", "Sauce Labs Bolt T-Shirt"];
    console.log(`🛒 Adding products: ${productsToAdd.join(", ")}`);

    await productsPage.addMultipleProductsToCart(productsToAdd);

    // Step 2: Verify cart count before going to cart
    const cartCount = await productsPage.getCartItemCount();
    expect(cartCount).to.equal(productsToAdd.length);

    // Step 3: Navigate to cart
    await productsPage.goToCart();
    expect(await cartPage.isOnCartPage()).to.be.true;

    // Step 4: Verify cart contents match what we added
    const cartItems = await cartPage.getCartItems();
    expect(cartItems).to.have.length(productsToAdd.length);

    const cartProductNames = cartItems.map((item) => item.name);
    for (const expectedProduct of productsToAdd) {
      expect(cartProductNames).to.include(expectedProduct);
    }

    // Step 5: Calculate and verify subtotal
    const expectedSubtotal = await cartPage.calculateExpectedSubtotal();
    console.log(`🧮 Expected subtotal: ${expectedSubtotal.toFixed(2)}`);

    // Step 6: Proceed through checkout
    const checkoutInfo = await testDataReader.getRandomCheckoutInfo();
    console.log(`📝 Using checkout info: ${checkoutInfo.testCase}`);

    const checkoutResult = await cartPage.completeCheckout(checkoutInfo);

    // Step 7: Validate order summary calculations
    const orderSummary = checkoutResult.orderSummary;

    // Verify subtotal matches our calculation
    const tolerance = 0.01;
    expect(Math.abs(orderSummary.subtotal - expectedSubtotal)).to.be.below(
      tolerance
    );

    // Verify tax calculation (SauceDemo uses 8% tax)
    const expectedTax = expectedSubtotal * 0.08;
    expect(Math.abs(orderSummary.tax - expectedTax)).to.be.below(tolerance);

    // Verify total calculation
    const expectedTotal = expectedSubtotal + expectedTax;
    expect(Math.abs(orderSummary.total - expectedTotal)).to.be.below(tolerance);

    console.log(`💰 Price validation passed:`);
    console.log(`   Subtotal: ${orderSummary.subtotal.toFixed(2)}`);
    console.log(`   Tax (8%): ${orderSummary.tax.toFixed(2)}`);
    console.log(`   Total: ${orderSummary.total.toFixed(2)}`);

    // Step 8: Verify order completion
    expect(checkoutResult.completion.header).to.include(
      "Thank you for your order!"
    );

    console.log("🎉 Complete end-to-end workflow test passed!");
  });

  /**
   * TEST 6: Checkout form validation
   * Tests negative scenarios with invalid checkout data
   */
  it("should validate checkout form fields correctly", async function () {
    console.log("\n🧪 TEST: Checkout form validation");

    // Add a product so we can get to checkout
    await productsPage.addProductToCartByName("Sauce Labs Backpack");
    await productsPage.goToCart();

    // Proceed to checkout
    await cartPage.proceedToCheckout();

    // Get invalid checkout data
    const checkoutData = await testDataReader.getCheckoutTestData();
    const invalidData = checkoutData.invalidCheckoutData[0]; // Missing first name

    console.log(`🧪 Testing validation: ${invalidData.testCase}`);

    // Fill form with invalid data
    await cartPage.fillCheckoutInformation({
      firstName: invalidData.firstName,
      lastName: invalidData.lastName,
      postalCode: invalidData.postalCode,
    });

    // Try to continue (this should show validation error)
    await cartPage.clickElement(
      cartPage.locators.continueBtn,
      "continue button"
    );

    // Check for error message (implementation depends on SauceDemo's validation)
    // Note: This is a basic check - real implementation might need more specific validation
    const currentUrl = await cartPage.getCurrentUrl();

    // If validation works, we should still be on checkout info page
    expect(currentUrl).to.include("checkout-step-one.html");

    console.log("🎉 Checkout form validation test passed!");
  });

  /**
   * TEST 7: Cart persistence across navigation
   */
  it("should maintain cart state when navigating between pages", async function () {
    console.log("\n🧪 TEST: Cart state persistence");

    // Add items to cart
    await productsPage.addProductToCartByName("Sauce Labs Backpack");

    // Verify cart count
    let cartCount = await productsPage.getCartItemCount();
    expect(cartCount).to.equal(1);

    // Navigate to cart
    await productsPage.goToCart();

    // Navigate back to products
    await cartPage.continueShopping();

    // Verify cart count is still maintained
    cartCount = await productsPage.getCartItemCount();
    expect(cartCount).to.equal(1);

    // Add another item
    await productsPage.addProductToCartByName("Sauce Labs Bike Light");

    // Verify count increased
    cartCount = await productsPage.getCartItemCount();
    expect(cartCount).to.equal(2);

    console.log("🎉 Cart persistence test passed!");
  });

  /**
   * TEST 8: Data-driven shopping scenarios
   */
  it("should handle multiple shopping scenarios from test data", async function () {
    console.log("\n🧪 TEST: Multiple shopping scenarios");

    const scenarios = await testDataReader.getShoppingScenarios();

    // Test the "Multiple Items Purchase" scenario
    const scenario = scenarios.find(
      (s) => s.scenario === "Multiple Items Purchase"
    );
    expect(scenario).to.not.be.undefined;

    console.log(`🛍️ Testing: ${scenario.scenario}`);
    console.log(`📦 Products: ${scenario.products.join(", ")}`);

    // Add all products from scenario
    await productsPage.addMultipleProductsToCart(scenario.products);

    // Go to cart and verify
    await productsPage.goToCart();

    const cartItems = await cartPage.getCartItems();
    expect(cartItems).to.have.length(scenario.products.length);

    // Verify all expected products are in cart
    const cartProductNames = cartItems.map((item) => item.name);
    for (const expectedProduct of scenario.products) {
      expect(cartProductNames).to.include(expectedProduct);
    }

    // Verify subtotal calculation
    const calculatedSubtotal = await cartPage.calculateExpectedSubtotal();
    const tolerance = 0.01;
    expect(
      Math.abs(calculatedSubtotal - scenario.expectedSubtotal)
    ).to.be.below(tolerance);

    console.log(
      `💰 Subtotal verification: Expected ${
        scenario.expectedSubtotal
      }, Calculated ${calculatedSubtotal.toFixed(2)}`
    );
    console.log("🎉 Shopping scenario test passed!");
  });
});
