import { expect } from "chai";
import WebDriverManager from "../utils/WebDriverManager.js";
import ScreenshotUtils from "../utils/ScreenshotUtils.js";
import LoginPage from "../pages/LoginPage.js";
import ProductsPage from "../pages/ProductsPage.js";
import CartPage from "../pages/CartPage.js";
import TestDataReader from "../utils/TestDataReader.js";
import config from "../config/test.config.js";

/**
 * Enhanced End-to-End Tests with Professional Features
 */
describe("🧪 Enhanced SauceDemo E2E Test Suite", function () {
  let driverManager;
  let driver;
  let loginPage;
  let productsPage;
  let cartPage;
  let testDataReader;
  let screenshotUtils;

  before(async function () {
    console.log("\n🚀 Initializing Enhanced Test Suite...");
    testDataReader = new TestDataReader();
    console.log("✅ Test data reader initialized");
  });

  beforeEach(async function () {
    console.log("\n🔧 Setting up enhanced test environment...");

    driverManager = new WebDriverManager();
    driver = await driverManager.createDriver(
      config.browser.name,
      config.browser.headless
    );
    screenshotUtils = new ScreenshotUtils(driver);

    // Create page objects
    loginPage = new LoginPage(driver);
    productsPage = new ProductsPage(driver);
    cartPage = new CartPage(driver);

    console.log("✅ Enhanced test environment ready");
  });

  afterEach(async function () {
    console.log("🧹 Enhanced cleanup...");

    if (this.currentTest.state === "failed") {
      console.log("📸 Test failed - capturing failure evidence...");
      await screenshotUtils.captureFailureEvidence(
        this.currentTest.title,
        new Error(`Test failed: ${this.currentTest.title}`)
      );
    }

    await driverManager.quitDriver();
  });

  /**
   * ENHANCED TEST 1: Complete Shopping Journey with Screenshots
   * This test demonstrates the full user journey with visual documentation
   */
  it("should complete full shopping journey from login to order completion", async function () {
    const testName = "Complete Shopping Journey";
    console.log(`\n🎯 ENHANCED TEST: ${testName}`);

    try {
      // STEP 1: Login
      console.log("📝 Step 1: User Authentication");
      await loginPage.open();
      await screenshotUtils.captureStep(testName, "1-login-page-loaded");

      await loginPage.login(
        config.testUsers.standard.username,
        config.testUsers.standard.password
      );
      await screenshotUtils.captureStep(testName, "2-login-completed");

      // Verify login success
      const onProductsPage = await productsPage.isOnProductsPage();
      expect(onProductsPage).to.be.true;
      console.log("✅ Step 1 Complete: User successfully authenticated");

      // STEP 2: Product Selection
      console.log("📝 Step 2: Product Discovery and Selection");
      const allProducts = await productsPage.getAllProducts();
      console.log(`🔍 Found ${allProducts.length} products available`);

      await screenshotUtils.captureStep(testName, "3-products-page-loaded");

      // Select products based on business criteria (price range)
      const selectedProducts = allProducts
        .filter((product) => product.price >= 15.99 && product.price <= 29.99)
        .slice(0, 2); // Take first 2 products in price range

      console.log(
        `🛒 Selected products: ${selectedProducts
          .map((p) => p.name)
          .join(", ")}`
      );

      for (const product of selectedProducts) {
        await productsPage.addProductToCartByName(product.name);
        console.log(`✅ Added to cart: ${product.name} ($${product.price})`);
      }

      await screenshotUtils.captureStep(testName, "4-products-added-to-cart");
      console.log("✅ Step 2 Complete: Products selected and added to cart");

      // STEP 3: Cart Review
      console.log("📝 Step 3: Shopping Cart Review");
      await productsPage.goToCart();

      const cartItems = await cartPage.getCartItems();
      expect(cartItems).to.have.length(selectedProducts.length);

      await screenshotUtils.captureStep(testName, "5-cart-review");

      // Verify cart contents match selections
      const cartProductNames = cartItems.map((item) => item.name);
      for (const selectedProduct of selectedProducts) {
        expect(cartProductNames).to.include(selectedProduct.name);
      }

      const expectedSubtotal = await cartPage.calculateExpectedSubtotal();
      console.log(
        `🧮 Cart subtotal calculated: $${expectedSubtotal.toFixed(2)}`
      );
      console.log("✅ Step 3 Complete: Cart contents verified");

      // STEP 4: Checkout Process
      console.log("📝 Step 4: Secure Checkout Process");
      const checkoutInfo = await testDataReader.getRandomCheckoutInfo();
      console.log(`👤 Using checkout profile: ${checkoutInfo.testCase}`);

      await cartPage.proceedToCheckout();
      await screenshotUtils.captureStep(testName, "6-checkout-form");

      await cartPage.fillCheckoutInformation(checkoutInfo);
      await screenshotUtils.captureStep(testName, "7-checkout-form-filled");

      await cartPage.continueToReview();
      await screenshotUtils.captureStep(testName, "8-order-review");
      console.log("✅ Step 4 Complete: Checkout information provided");

      // STEP 5: Order Verification and Completion
      console.log("📝 Step 5: Order Verification and Final Processing");
      const orderSummary = await cartPage.getOrderSummary();

      // Financial validation
      const tolerance = 0.01;
      expect(Math.abs(orderSummary.subtotal - expectedSubtotal)).to.be.below(
        tolerance
      );

      const expectedTax = expectedSubtotal * 0.08; // SauceDemo tax rate
      expect(Math.abs(orderSummary.tax - expectedTax)).to.be.below(tolerance);

      const expectedTotal = expectedSubtotal + expectedTax;
      expect(Math.abs(orderSummary.total - expectedTotal)).to.be.below(
        tolerance
      );

      console.log("💰 Financial validation passed:");
      console.log(`   📊 Subtotal: $${orderSummary.subtotal.toFixed(2)}`);
      console.log(`   💸 Tax (8%): $${orderSummary.tax.toFixed(2)}`);
      console.log(`   💳 Total: $${orderSummary.total.toFixed(2)}`);

      await cartPage.finishOrder();
      await screenshotUtils.captureStep(testName, "9-order-completed");

      // Final verification
      const completion = await cartPage.getCompletionMessage();
      expect(completion.header).to.include("Thank you for your order!");

      await screenshotUtils.captureSuccess(testName);
      console.log("✅ Step 5 Complete: Order successfully processed");

      // Business metrics logging
      console.log("\n📈 BUSINESS METRICS:");
      console.log(`   🛍️ Products purchased: ${selectedProducts.length}`);
      console.log(`   💰 Order value: $${orderSummary.total.toFixed(2)}`);
      console.log(
        `   👤 Customer: ${checkoutInfo.firstName} ${checkoutInfo.lastName}`
      );
      console.log(`   📍 Location: ${checkoutInfo.postalCode}`);

      console.log("\n🎉 COMPLETE SHOPPING JOURNEY TEST PASSED!");
    } catch (error) {
      console.error("❌ Enhanced test failed:", error.message);
      await screenshotUtils.captureFailureEvidence(testName, error);
      throw error;
    }
  });

  /**
   * ENHANCED TEST 2: Data-Driven User Experience Testing
   * Tests different user personas and their experiences
   */
  it("should handle different user personas with appropriate experiences", async function () {
    const testName = "User Persona Testing";
    console.log(`\n🎯 ENHANCED TEST: ${testName}`);

    try {
      const validUsers = await testDataReader.getValidUsers();
      console.log(`👥 Testing ${validUsers.length} different user personas`);

      // Test with performance_glitch_user (known to be slow)
      const performanceUser = validUsers.find(
        (user) => user.username === "performance_glitch_user"
      );

      if (performanceUser) {
        console.log(
          `🐌 Testing performance user: ${performanceUser.description}`
        );

        await loginPage.open();
        await screenshotUtils.captureStep(
          testName,
          "performance-user-login-start"
        );

        const startTime = Date.now();
        await loginPage.login(
          performanceUser.username,
          performanceUser.password
        );
        const loginDuration = Date.now() - startTime;

        await screenshotUtils.captureStep(
          testName,
          "performance-user-login-complete"
        );

        console.log(`⏱️ Performance user login took: ${loginDuration}ms`);

        // Verify login succeeded despite performance issues
        const onProductsPage = await productsPage.isOnProductsPage();
        expect(onProductsPage).to.be.true;

        // Document performance characteristics
        if (loginDuration > 5000) {
          console.log("⚠️ Performance user exhibited expected slow behavior");
        } else {
          console.log("ℹ️ Performance user was faster than expected");
        }

        console.log("✅ Performance user persona test completed");
      }
    } catch (error) {
      console.error("❌ User persona test failed:", error.message);
      await screenshotUtils.captureFailureEvidence(testName, error);
      throw error;
    }
  });

  /**
   * ENHANCED TEST 3: Comprehensive Error Handling and Recovery
   * Tests application behavior under error conditions
   */
  it("should handle errors gracefully and provide clear feedback", async function () {});

  /**
   * ENHANCED TEST 4: Cross-Browser Compatibility Simulation
   * Tests key functionality that should work across different environments
   */
  it("should maintain consistent functionality across different configurations", async function () {});
});
