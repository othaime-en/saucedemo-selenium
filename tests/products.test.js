import { expect } from "chai";
import WebDriverManager from "../utils/WebDriverManager.js";
import LoginPage from "../pages/LoginPage.js";
import ProductsPage from "../pages/ProductsPage.js";
import config from "../config/test.config.js";

/**
 * Products page test suite
 * These tests verify product browsing, shopping cart functionality, and sorting
 */
describe("SauceDemo Products Page Functionality", function () {
  let driverManager;
  let driver;
  let loginPage;
  let productsPage;

  // Setup: Login before each test since we need to be authenticated
  beforeEach(async function () {
    console.log("\n🔧 Setting up authenticated test session...");

    driverManager = new WebDriverManager();
    driver = await driverManager.createDriver(
      config.browser.name,
      config.browser.headless
    );

    // Create page objects
    loginPage = new LoginPage(driver);
    productsPage = new ProductsPage(driver);

    // Login before each test (this is a common pattern)
    await loginPage.open();
    await loginPage.login(
      config.testUsers.standard.username,
      config.testUsers.standard.password
    );

    // Verify we're on products page
    const onProductsPage = await productsPage.isOnProductsPage();
    expect(onProductsPage).to.be.true;

    console.log("✅ Test session authenticated and ready");
  });

  afterEach(async function () {
    await driverManager.quitDriver();
  });

  /**
   * TEST 1: Verify all products load correctly
   * This tests that the page structure and data are correct
   */
  it("should load and display all products with correct information", async function () {
    console.log("\n🧪 TEST: Products loading and data verification");

    // Get all products
    const products = await productsPage.getAllProducts();

    // Verify we have the expected number of products (SauceDemo has 6)
    expect(products).to.have.length(6);
    console.log(`✅ Verified ${products.length} products loaded`);

    // Verify each product has required data
    for (const product of products) {
      expect(product.name).to.be.a("string").and.not.be.empty;
      expect(product.price).to.be.a("number").and.be.above(0);
      expect(product.description).to.be.a("string").and.not.be.empty;
      expect(product.buttonId).to.include("add-to-cart");

      console.log(`✅ Product validated: ${product.name} - $${product.price}`);
    }

    console.log("🎉 All products loaded and validated successfully!");
  });

  /**
   * TEST 2: Add single product to cart
   * Tests basic shopping cart functionality
   */
  it("should add a single product to cart and update cart count", async function () {
    console.log("\n🧪 TEST: Single product addition to cart");

    // Verify cart starts empty
    const initialCartCount = await productsPage.getCartItemCount();
    expect(initialCartCount).to.equal(0);

    // Add a specific product
    const productToAdd = "Sauce Labs Backpack";
    await productsPage.addProductToCartByName(productToAdd);

    // Verify cart count increased
    const finalCartCount = await productsPage.getCartItemCount();
    expect(finalCartCount).to.equal(1);

    console.log("🎉 Single product addition test passed!");
  });

  /**
   * TEST 3: Add multiple products to cart
   * Tests cart accumulation and state management
   */
  it("should add multiple products to cart and track count correctly", async function () {
    console.log("\n🧪 TEST: Multiple products addition to cart");

    const productsToAdd = [
      "Sauce Labs Backpack",
      "Sauce Labs Bike Light",
      "Sauce Labs Bolt T-Shirt",
    ];

    // Add multiple products
    await productsPage.addMultipleProductsToCart(productsToAdd);

    // Verify final cart count
    const finalCartCount = await productsPage.getCartItemCount();
    expect(finalCartCount).to.equal(productsToAdd.length);

    console.log(
      `🎉 Successfully added ${productsToAdd.length} products to cart!`
    );
  });

  /**
   * TEST 4: Product sorting functionality
   * Tests dropdown interactions and dynamic content updates
   */
  it("should sort products by name (A to Z)", async function () {
    console.log("\n🧪 TEST: Product sorting by name");

    // Get products before sorting
    const productsBefore = await productsPage.getAllProducts();
    const namesBefore = productsBefore.map((p) => p.name);
    console.log("📋 Products before sorting:", namesBefore);

    // Sort products A-Z
    await productsPage.sortProducts("az");

    // Get products after sorting
    const productsAfter = await productsPage.getAllProducts();
    const namesAfter = productsAfter.map((p) => p.name);
    console.log("📋 Products after sorting:", namesAfter);

    // Verify they are sorted alphabetically
    const expectedOrder = [...namesBefore].sort();
    expect(namesAfter).to.deep.equal(expectedOrder);

    console.log("🎉 Product sorting test passed!");
  });

  /**
   * TEST 5: Price sorting functionality
   * Tests numerical sorting (different from string sorting)
   */
  it("should sort products by price (low to high)", async function () {
    console.log("\n🧪 TEST: Product sorting by price");

    // Sort by price low to high
    await productsPage.sortProducts("lohi");

    // Get products after sorting
    const products = await productsPage.getAllProducts();
    const prices = products.map((p) => p.price);
    console.log("💰 Prices after sorting:", prices);

    // Verify prices are in ascending order
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).to.be.at.least(prices[i - 1]);
    }

    console.log("🎉 Price sorting test passed!");
  });

  /**
   * TEST 6: Find most and least expensive products
   * Tests data analysis capabilities
   */
  it("should correctly identify most and least expensive products", async function () {
    console.log("\n🧪 TEST: Price analysis");

    // Get price extremes
    const mostExpensive = await productsPage.getMostExpensiveProduct();
    const cheapest = await productsPage.getCheapestProduct();

    // Get all products for verification
    const allProducts = await productsPage.getAllProducts();
    const allPrices = allProducts.map((p) => p.price);

    // Verify most expensive
    const actualMaxPrice = Math.max(...allPrices);
    expect(mostExpensive.price).to.equal(actualMaxPrice);

    // Verify cheapest
    const actualMinPrice = Math.min(...allPrices);
    expect(cheapest.price).to.equal(actualMinPrice);

    console.log(
      `💰 Most expensive: ${mostExpensive.name} ($${mostExpensive.price})`
    );
    console.log(`💸 Cheapest: ${cheapest.name} ($${cheapest.price})`);
    console.log("🎉 Price analysis test passed!");
  });

  /**
   * TEST 7: Shopping cart navigation
   * Tests navigation between pages
   */
  it("should navigate to cart page when cart icon is clicked", async function () {
    console.log("\n🧪 TEST: Cart navigation");

    // Add a product first (so cart isn't empty)
    await productsPage.addProductToCartByName("Sauce Labs Backpack");

    // Click cart to navigate
    await productsPage.goToCart();

    // Verify we're on cart page
    const currentUrl = await productsPage.getCurrentUrl();
    expect(currentUrl).to.include("cart.html");

    console.log("🎉 Cart navigation test passed!");
  });

  /**
   * TEST 8: Logout functionality
   * Tests session management
   */
  it("should successfully logout and return to login page", async function () {
    console.log("\n🧪 TEST: Logout functionality");

    // Perform logout
    await productsPage.logout();

    // Verify we're back on login page
    const currentUrl = await productsPage.getCurrentUrl();
    expect(currentUrl).to.include("saucedemo.com");
    expect(currentUrl).to.not.include("inventory.html");

    // Verify login elements are present
    const loginPageVisible = await loginPage.isOnLoginPage();
    expect(loginPageVisible).to.be.true;

    console.log("🎉 Logout test passed!");
  });
});
