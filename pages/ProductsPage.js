import { By, until } from "selenium-webdriver";
import BasePage from "./BasePage.js";

/**
 * ProductsPage represents the inventory page after successful login
 */
class ProductsPage extends BasePage {
  constructor(driver) {
    super(driver);

    this.locators = {
      // Page identification
      pageTitle: By.css(".title"), // "Products" header
      inventoryContainer: By.id("inventory_container"), // Main products container

      // Product-related elements
      productItems: By.css(".inventory_item"), // All product cards
      productNames: By.css(".inventory_item_name"), // All product names
      productPrices: By.css(".inventory_item_price"), // All product prices
      productDescriptions: By.css(".inventory_item_desc"), // All descriptions
      addToCartButtons: By.css('button[id^="add-to-cart"]'), // All "Add to cart" buttons

      // Shopping cart
      shoppingCartLink: By.css(".shopping_cart_link"), // Cart icon
      cartBadge: By.css(".shopping_cart_badge"), // Cart item count

      // Sorting and filtering
      sortDropdown: By.css(".product_sort_container"), // Sort dropdown

      // Menu and navigation
      menuButton: By.id("react-burger-menu-btn"), // Hamburger menu
      logoutLink: By.id("logout_sidebar_link"), // Logout option
    };

    console.log("🏪 ProductsPage object created");
  }

  /**
   * Verify we're on the products page
   * This is crucial for test reliability - ensure we're where we think we are
   */
  async isOnProductsPage() {
    console.log("🔍 Verifying we are on the products page...");

    try {
      // Check for multiple indicators that we're on the right page
      const titleExists = await this.isElementDisplayed(
        this.locators.pageTitle
      );
      const inventoryExists = await this.isElementDisplayed(
        this.locators.inventoryContainer
      );
      const currentUrl = await this.getCurrentUrl();

      const isOnProductsPage =
        titleExists && inventoryExists && currentUrl.includes("inventory.html");

      if (isOnProductsPage) {
        console.log("✅ Confirmed: We are on the products page");
      } else {
        console.log("❌ Warning: We may not be on the products page");
      }

      return isOnProductsPage;
    } catch (error) {
      console.log("❌ Error verifying products page:", error.message);
      return false;
    }
  }

  /**
   * Get all products information from the page
   * This demonstrates working with multiple elements
   * @returns {Array} Array of product objects with name, price, description
   */
  async getAllProducts() {
    console.log("📦 Gathering all product information...");

    // Wait for products to load
    await this.driver.wait(
      until.elementsLocated(this.locators.productItems),
      this.timeout,
      "Products did not load within timeout"
    );

    // IMPORTANT: findElements (plural) returns an array of all matching elements
    const productElements = await this.driver.findElements(
      this.locators.productItems
    );
    const products = [];

    console.log(`🔍 Found ${productElements.length} products on page`);

    // Loop through each product and extract information
    for (let i = 0; i < productElements.length; i++) {
      console.log(`📖 Reading product ${i + 1} details...`);

      try {
        // Find child elements within each product card
        const nameElement = await productElements[i].findElement(
          By.css(".inventory_item_name")
        );
        const priceElement = await productElements[i].findElement(
          By.css(".inventory_item_price")
        );
        const descElement = await productElements[i].findElement(
          By.css(".inventory_item_desc")
        );
        const buttonElement = await productElements[i].findElement(
          By.css("button")
        );

        // Extract text content
        const name = await nameElement.getText();
        const priceText = await priceElement.getText();
        const description = await descElement.getText();
        const buttonId = await buttonElement.getAttribute("id");

        // Parse price (remove $ symbol, convert to number)
        const price = parseFloat(priceText.replace("$", ""));

        const product = {
          index: i,
          name: name,
          price: price,
          priceText: priceText,
          description: description,
          buttonId: buttonId,
        };

        products.push(product);
        console.log(`✅ Product ${i + 1}: ${name} - ${priceText}`);
      } catch (error) {
        console.error(`❌ Error reading product ${i + 1}:`, error.message);
      }
    }

    console.log(`✅ Successfully gathered ${products.length} products`);
    return products;
  }

  /**
   * Add a specific product to cart by name
   * @param {string} productName - Exact name of product to add
   */
  async addProductToCartByName(productName) {
    console.log(`🛒 Adding product to cart: "${productName}"`);

    // Get current cart count before adding
    const currentCartCount = await this.getCartItemCount();

    // Find all products and locate the specific one
    const products = await this.getAllProducts();
    const targetProduct = products.find((p) => p.name === productName);

    if (!targetProduct) {
      throw new Error(`Product "${productName}" not found on page`);
    }

    // Click the add to cart button for this specific product
    const addButton = await this.driver.findElement(
      By.id(targetProduct.buttonId)
    );
    await addButton.click();

    console.log(`✅ Clicked add to cart for: ${productName}`);

    // Wait for cart count to increase (this ensures the action completed)
    await this.waitForCartCountChange(currentCartCount + 1);

    console.log(`🎉 Successfully added "${productName}" to cart`);
  }

  /**
   * Add multiple products to cart
   * @param {string[]} productNames - Array of product names to add
   */
  async addMultipleProductsToCart(productNames) {
    console.log(`🛒 Adding ${productNames.length} products to cart...`);

    for (const productName of productNames) {
      await this.addProductToCartByName(productName);
      // Small delay between additions for stability
      await this.driver.sleep(500);
    }

    console.log("✅ All products added to cart successfully");
  }

  /**
   * Get current shopping cart item count
   * @returns {number} Number of items in cart (0 if badge not visible)
   */
  async getCartItemCount() {
    try {
      const badgeDisplayed = await this.isElementDisplayed(
        this.locators.cartBadge
      );

      if (badgeDisplayed) {
        const badge = await this.findElement(
          this.locators.cartBadge,
          "cart badge"
        );
        const countText = await badge.getText();
        const count = parseInt(countText);
        console.log(`🛒 Current cart count: ${count}`);
        return count;
      } else {
        console.log("🛒 Cart is empty (no badge visible)");
        return 0;
      }
    } catch (error) {
      console.log("🛒 Could not read cart count, assuming empty");
      return 0;
    }
  }

  /**
   * Wait for cart count to reach a specific value
   * This is an example of a "custom wait condition"
   * @param {number} expectedCount - Expected cart item count
   */
  async waitForCartCountChange(expectedCount) {
    console.log(`⏳ Waiting for cart count to become: ${expectedCount}`);

    await this.driver.wait(
      async () => {
        const currentCount = await this.getCartItemCount();
        return currentCount === expectedCount;
      },
      this.timeout,
      `Cart count did not reach ${expectedCount} within ${this.timeout}ms`
    );

    console.log(`✅ Cart count reached: ${expectedCount}`);
  }

  /**
   * Sort products by different criteria
   * @param {string} sortOption - 'az', 'za', 'lohi', 'hilo'
   */
  async sortProducts(sortOption) {
    const sortMap = {
      az: "Name (A to Z)",
      za: "Name (Z to A)",
      lohi: "Price (low to high)",
      hilo: "Price (high to low)",
    };

    const sortText = sortMap[sortOption];
    if (!sortText) {
      throw new Error(`Invalid sort option: ${sortOption}`);
    }

    console.log(`📊 Sorting products: ${sortText}`);

    // Click dropdown
    const dropdown = await this.findElement(
      this.locators.sortDropdown,
      "sort dropdown"
    );
    await dropdown.click();

    // Select option by value
    const option = await dropdown.findElement(
      By.css(`option[value="${sortOption}"]`)
    );
    await option.click();

    // Wait a moment for sorting to complete
    await this.driver.sleep(1000);

    console.log(`✅ Products sorted by: ${sortText}`);
  }

  /**
   * Click on shopping cart to go to cart page
   */
  async goToCart() {
    console.log("🛒 Navigating to shopping cart...");
    await this.clickElement(this.locators.shoppingCartLink, "shopping cart");
    console.log("✅ Clicked shopping cart link");
  }

  /**
   * Get the most expensive product
   * @returns {Object} Product object with highest price
   */
  async getMostExpensiveProduct() {
    const products = await this.getAllProducts();
    const mostExpensive = products.reduce((max, current) => {
      return current.price > max.price ? current : max;
    });

    console.log(
      `💰 Most expensive product: ${mostExpensive.name} (${mostExpensive.priceText})`
    );
    return mostExpensive;
  }

  /**
   * Get the cheapest product
   * @returns {Object} Product object with lowest price
   */
  async getCheapestProduct() {
    const products = await this.getAllProducts();
    const cheapest = products.reduce((min, current) => {
      return current.price < min.price ? current : min;
    });

    console.log(
      `💸 Cheapest product: ${cheapest.name} (${cheapest.priceText})`
    );
    return cheapest;
  }

  /**
   * Logout from the application
   */
  async logout() {
    console.log("🚪 Logging out...");

    // Click hamburger menu
    await this.clickElement(this.locators.menuButton, "menu button");

    // Wait for menu to open and click logout
    await this.driver.wait(
      until.elementIsVisible(
        await this.driver.findElement(this.locators.logoutLink)
      ),
      this.timeout
    );

    await this.clickElement(this.locators.logoutLink, "logout link");
    console.log("✅ Logout completed");
  }
}

export default ProductsPage;
