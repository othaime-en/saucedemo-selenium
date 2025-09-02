import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

/**
 * TestDataReader utility class for reading external test data files
 */
class TestDataReader {
  constructor() {
    // Get current directory for ES modules
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.testDataDir = path.join(__dirname, "..", "test-data");

    console.log("📁 TestDataReader initialized");
  }

  /**
   * Read and parse JSON file
   * @param {string} filename - Name of JSON file (with or without .json extension)
   * @returns {Object} Parsed JSON data
   */
  async readJsonFile(filename) {
    try {
      // Ensure .json extension
      const fileName = filename.endsWith(".json")
        ? filename
        : `${filename}.json`;
      const filePath = path.join(this.testDataDir, fileName);

      console.log(`📖 Reading JSON file: ${fileName}`);

      const fileContent = await fs.readFile(filePath, "utf8");
      const jsonData = JSON.parse(fileContent);

      console.log(`✅ Successfully loaded JSON data from ${fileName}`);
      return jsonData;
    } catch (error) {
      console.error(`❌ Error reading JSON file ${filename}:`, error.message);
      throw new Error(`Failed to read JSON file: ${filename}`);
    }
  }

  /**
   * Read and parse CSV file
   * @param {string} filename - Name of CSV file (with or without .csv extension)
   * @returns {Array} Array of objects with CSV data
   */
  async readCsvFile(filename) {
    try {
      // Ensure .csv extension
      const fileName = filename.endsWith(".csv") ? filename : `${filename}.csv`;
      const filePath = path.join(this.testDataDir, fileName);

      console.log(`📊 Reading CSV file: ${fileName}`);

      const fileContent = await fs.readFile(filePath, "utf8");
      const csvData = this.parseCsv(fileContent);

      console.log(
        `✅ Successfully loaded ${csvData.length} rows from ${fileName}`
      );
      return csvData;
    } catch (error) {
      console.error(`❌ Error reading CSV file ${filename}:`, error.message);
      throw new Error(`Failed to read CSV file: ${filename}`);
    }
  }

  /**
   * Parse CSV content into array of objects
   * @param {string} csvContent - Raw CSV file content
   * @returns {Array} Array of objects
   */
  parseCsv(csvContent) {
    const lines = csvContent.trim().split("\n");

    if (lines.length < 2) {
      throw new Error(
        "CSV file must have at least a header row and one data row"
      );
    }

    // Parse header row
    const headers = lines[0].split(",").map((header) => header.trim());
    console.log(`📋 CSV headers: ${headers.join(", ")}`);

    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);

      if (values.length !== headers.length) {
        console.warn(
          `⚠️ Row ${i + 1} has ${values.length} values but expected ${
            headers.length
          }`
        );
        continue;
      }

      // Create object with headers as keys
      const rowObject = {};
      headers.forEach((header, index) => {
        rowObject[header] = values[index];
      });

      data.push(rowObject);
    }

    return data;
  }

  /**
   * Parse a single CSV line, handling quoted values and commas
   * @param {string} line - Single CSV line
   * @returns {Array} Array of values
   */
  parseCsvLine(line) {
    const values = [];
    let currentValue = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = "";
      } else {
        currentValue += char;
      }
    }

    // Add the last value
    values.push(currentValue.trim());

    return values;
  }

  /**
   * Get user test data from CSV
   * @returns {Array} Array of user test data objects
   */
  async getUserTestData() {
    console.log("👥 Loading user test data...");
    return await this.readCsvFile("users.csv");
  }

  /**
   * Get checkout test data from JSON
   * @returns {Object} Checkout test data object
   */
  async getCheckoutTestData() {
    console.log("🛒 Loading checkout test data...");
    return await this.readJsonFile("checkout-data.json");
  }

  /**
   * Get valid users only (for positive testing)
   * @returns {Array} Array of valid user objects
   */
  async getValidUsers() {
    const allUsers = await this.getUserTestData();
    const validUsers = allUsers.filter(
      (user) => user.expectedResult === "success"
    );

    console.log(`✅ Found ${validUsers.length} valid users for testing`);
    return validUsers;
  }

  /**
   * Get invalid users only (for negative testing)
   * @returns {Array} Array of invalid user objects
   */
  async getInvalidUsers() {
    const allUsers = await this.getUserTestData();
    const invalidUsers = allUsers.filter(
      (user) => user.expectedResult === "error"
    );

    console.log(
      `❌ Found ${invalidUsers.length} invalid users for negative testing`
    );
    return invalidUsers;
  }

  /**
   * Get shopping scenarios from checkout data
   * @returns {Array} Array of shopping scenario objects
   */
  async getShoppingScenarios() {
    const checkoutData = await this.getCheckoutTestData();
    console.log(
      `🛍️ Found ${checkoutData.shoppingScenarios.length} shopping scenarios`
    );
    return checkoutData.shoppingScenarios;
  }

  /**
   * Get random valid checkout information
   * @returns {Object} Random valid checkout data
   */
  async getRandomCheckoutInfo() {
    const checkoutData = await this.getCheckoutTestData();
    const validData = checkoutData.validCheckoutData;
    const randomIndex = Math.floor(Math.random() * validData.length);
    const randomCheckoutInfo = validData[randomIndex];

    console.log(
      `🎲 Selected random checkout info: ${randomCheckoutInfo.testCase}`
    );
    return randomCheckoutInfo;
  }
}

export default TestDataReader;
