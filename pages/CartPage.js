import { By, until } from "selenium-webdriver";
import BasePage from "./BasePage.js";

/**
 * CartPage represents the shopping cart page (/cart.html)
 * This encapsulates all interactions with the cart and checkout process
 */
class CartPage extends BasePage {
  constructor(driver) {
    super(driver);

    this.locators = {
      // Page identification
      pageTitle: By.css(".title"), // "Your Cart" header
      cartContents: By.css(".cart_contents"), // Main cart container

      // Cart items
      cartItems: By.css(".cart_item"), // All items in cart
      cartItemNames: By.css(".inventory_item_name"), // Product names in cart
      cartItemPrices: By.css(".inventory_item_price"), // Product prices
      cartItemQuantities: By.css(".cart_quantity"), // Quantity labels
      removeButtons: By.css('button[id^="remove-"]'), // Remove item buttons

      // Cart actions
      continueShoppingBtn: By.id("continue-shopping"),
      checkoutBtn: By.id("checkout"),

      // Checkout form (appears after clicking checkout)
      checkoutContainer: By.css(".checkout_info"),
      firstNameField: By.id("first-name"),
      lastNameField: By.id("last-name"),
      postalCodeField: By.id("postal-code"),
      continueBtn: By.id("continue"),
      cancelBtn: By.id("cancel"),

      // Checkout overview (final review page)
      summaryContainer: By.css(".summary_info"),
      subtotalLabel: By.css(".summary_subtotal_label"),
      taxLabel: By.css(".summary_tax_label"),
      totalLabel: By.css(".summary_total_label"),
      finishBtn: By.id("finish"),

      // Order completion
      completeHeader: By.css(".complete-header"), // "Thank you" message
      completeText: By.css(".complete-text"), // Order complete text
      backToProductsBtn: By.id("back-to-products"), // Return to products
    };

    console.log("🛒 CartPage object created");
  }

  /**
   * Verify we're on the cart page
   */
  async isOnCartPage() {
    console.log("🔍 Verifying we are on the cart page...");

    const currentUrl = await this.getCurrentUrl();
    const titleExists = await this.isElementDisplayed(this.locators.pageTitle);
    const isOnCart = currentUrl.includes("cart.html") && titleExists;

    if (isOnCart) {
      console.log("✅ Confirmed: We are on the cart page");
    }
    return isOnCart;
  }

  /**
   * Get all items currently in the cart
   * @returns {Array} Array of cart item objects
   */
  async getCartItems() {
    console.log("📦 Reading cart items...");

    try {
      const itemElements = await this.driver.findElements(
        this.locators.cartItems
      );

      if (itemElements.length === 0) {
        console.log("🛒 Cart is empty");
        return [];
      }

      const cartItems = [];

      for (let i = 0; i < itemElements.length; i++) {
        const nameElement = await itemElements[i].findElement(
          By.css(".inventory_item_name")
        );
        const priceElement = await itemElements[i].findElement(
          By.css(".inventory_item_price")
        );
        const quantityElement = await itemElements[i].findElement(
          By.css(".cart_quantity")
        );
        const removeButton = await itemElements[i].findElement(
          By.css('button[id^="remove-"]')
        );

        const name = await nameElement.getText();
        const priceText = await priceElement.getText();
        const quantity = parseInt(await quantityElement.getText());
        const removeButtonId = await removeButton.getAttribute("id");

        // Parse price
        const price = parseFloat(priceText.replace("$", ""));

        const item = {
          index: i,
          name: name,
          price: price,
          priceText: priceText,
          quantity: quantity,
          removeButtonId: removeButtonId,
          totalPrice: price * quantity,
        };

        cartItems.push(item);
        console.log(
          `📦 Cart item ${i + 1}: ${name} (${quantity}x) - ${priceText}`
        );
      }

      console.log(`✅ Found ${cartItems.length} items in cart`);
      return cartItems;
    } catch (error) {
      console.log("ℹ️ No items found in cart or error reading cart");
      return [];
    }
  }

  /**
   * Remove a specific item from cart by name
   * @param {string} itemName - Name of item to remove
   */
  async removeItemFromCart(itemName) {
    console.log(`🗑️ Removing item from cart: "${itemName}"`);

    const cartItems = await this.getCartItems();
    const itemToRemove = cartItems.find((item) => item.name === itemName);

    if (!itemToRemove) {
      throw new Error(`Item "${itemName}" not found in cart`);
    }

    // Click remove button for this item
    const removeButton = await this.driver.findElement(
      By.id(itemToRemove.removeButtonId)
    );
    await removeButton.click();

    console.log(`✅ Removed "${itemName}" from cart`);

    // Wait a moment for the item to be removed from DOM
    await this.driver.sleep(1000);
  }

  /**
   * Calculate expected cart subtotal
   * @returns {number} Expected subtotal amount
   */
  async calculateExpectedSubtotal() {
    const cartItems = await this.getCartItems();
    const subtotal = cartItems.reduce(
      (total, item) => total + item.totalPrice,
      0
    );

    console.log(`🧮 Calculated expected subtotal: $${subtotal.toFixed(2)}`);
    return subtotal;
  }

  /**
   * Proceed to checkout (click checkout button)
   */
  async proceedToCheckout() {
    console.log("🏪 Proceeding to checkout...");
    await this.clickElement(this.locators.checkoutBtn, "checkout button");

    // Wait for checkout form to appear
    await this.driver.wait(
      until.elementLocated(this.locators.checkoutContainer),
      this.timeout,
      "Checkout form did not appear"
    );

    console.log("✅ Checkout form loaded");
  }

  /**
   * Fill out checkout information form
   * @param {Object} checkoutInfo - Object with firstName, lastName, postalCode
   */
  async fillCheckoutInformation(checkoutInfo) {
    console.log("📝 Filling checkout information...");

    const { firstName, lastName, postalCode } = checkoutInfo;

    await this.typeText(
      this.locators.firstNameField,
      firstName,
      "first name field"
    );
    await this.typeText(
      this.locators.lastNameField,
      lastName,
      "last name field"
    );
    await this.typeText(
      this.locators.postalCodeField,
      postalCode,
      "postal code field"
    );

    console.log(
      `✅ Filled checkout info: ${firstName} ${lastName}, ${postalCode}`
    );
  }

  /**
   * Continue to order review after filling checkout info
   */
  async continueToReview() {
    console.log("➡️ Continuing to order review...");
    await this.clickElement(this.locators.continueBtn, "continue button");

    // Wait for summary page to load
    await this.driver.wait(
      until.elementLocated(this.locators.summaryContainer),
      this.timeout,
      "Order summary did not load"
    );

    console.log("✅ Order review page loaded");
  }

  /**
   * Get order summary totals from review page
   * @returns {Object} Object with subtotal, tax, and total amounts
   */
  async getOrderSummary() {
    console.log("📊 Reading order summary...");

    const subtotalElement = await this.findElement(
      this.locators.subtotalLabel,
      "subtotal"
    );
    const taxElement = await this.findElement(this.locators.taxLabel, "tax");
    const totalElement = await this.findElement(
      this.locators.totalLabel,
      "total"
    );

    const subtotalText = await subtotalElement.getText();
    const taxText = await taxElement.getText();
    const totalText = await totalElement.getText();

    // Parse amounts (format: "Item total: $29.99")
    const subtotal = parseFloat(subtotalText.match(/\$([\d.]+)/)[1]);
    const tax = parseFloat(taxText.match(/\$([\d.]+)/)[1]);
    const total = parseFloat(totalText.match(/\$([\d.]+)/)[1]);

    const summary = {
      subtotal: subtotal,
      tax: tax,
      total: total,
      subtotalText: subtotalText,
      taxText: taxText,
      totalText: totalText,
    };

    console.log(
      `💰 Order Summary - Subtotal: $${subtotal}, Tax: $${tax}, Total: $${total}`
    );
    return summary;
  }

  /**
   * Complete the order (click finish)
   */
  async finishOrder() {
    console.log("🎯 Completing order...");
    await this.clickElement(this.locators.finishBtn, "finish button");

    // Wait for completion page
    await this.driver.wait(
      until.elementLocated(this.locators.completeHeader),
      this.timeout,
      "Order completion page did not load"
    );

    console.log("✅ Order completed successfully!");
  }

  /**
   * Get order completion message
   * @returns {string} Completion message text
   */
  async getCompletionMessage() {
    const headerElement = await this.findElement(
      this.locators.completeHeader,
      "completion header"
    );
    const textElement = await this.findElement(
      this.locators.completeText,
      "completion text"
    );

    const header = await headerElement.getText();
    const text = await textElement.getText();

    console.log(`🎉 Order completion: ${header}`);
    return { header, text };
  }

  /**
   * Complete full checkout process
   * This is a high-level method that combines multiple steps
   * @param {Object} checkoutInfo - Checkout form data
   * @returns {Object} Order summary with totals
   */
  async completeCheckout(checkoutInfo) {
    console.log("🛍️ Starting complete checkout process...");

    // Step 1: Proceed to checkout
    await this.proceedToCheckout();

    // Step 2: Fill information
    await this.fillCheckoutInformation(checkoutInfo);

    // Step 3: Continue to review
    await this.continueToReview();

    // Step 4: Get summary for validation
    const orderSummary = await this.getOrderSummary();

    // Step 5: Complete order
    await this.finishOrder();

    // Step 6: Verify completion
    const completion = await this.getCompletionMessage();

    console.log("🎉 Full checkout process completed successfully!");

    return {
      orderSummary: orderSummary,
      completion: completion,
    };
  }

  /**
   * Return to shopping from cart
   */
  async continueShopping() {
    console.log("🔄 Continuing shopping...");
    await this.clickElement(
      this.locators.continueShoppingBtn,
      "continue shopping button"
    );
    console.log("✅ Returned to products page");
  }

  /**
   * Check if cart is empty
   * @returns {boolean} True if cart has no items
   */
  async isCartEmpty() {
    const cartItems = await this.getCartItems();
    return cartItems.length === 0;
  }
}

export default CartPage;
