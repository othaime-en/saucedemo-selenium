import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

/**
 * ReportGenerator - Creates professional HTML test reports
 */
class ReportGenerator {
  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.projectRoot = path.join(__dirname, "..");
    this.reportsDir = path.join(this.projectRoot, "reports");

    console.log("📊 ReportGenerator initialized");
  }

  /**
   * Generate comprehensive HTML test report
   * @param {Object} testResults - Test execution results
   * @param {Object} config - Test configuration
   * @returns {string} Path to generated report
   */
  async generateHtmlReport(testResults, config = {}) {
    console.log("📋 Generating comprehensive HTML test report...");

    try {
      await fs.mkdir(this.reportsDir, { recursive: true });

      const reportData = this.prepareReportData(testResults, config);
      const htmlContent = this.generateHtmlContent(reportData);

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .split(".")[0];
      const reportFileName = `test-report-${timestamp}.html`;
      const reportPath = path.join(this.reportsDir, reportFileName);

      await fs.writeFile(reportPath, htmlContent);

      console.log(`✅ Test report generated: ${reportFileName}`);
      console.log(`📁 Report location: ${reportPath}`);

      return reportPath;
    } catch (error) {
      console.error("❌ Failed to generate test report:", error.message);
      throw error;
    }
  }

  /**
   * Prepare test data for report generation
   * @param {Object} testResults - Raw test results
   * @param {Object} config - Configuration
   * @returns {Object} Formatted report data
   */
  prepareReportData(testResults, config) {
    const timestamp = new Date().toISOString();
    const duration = testResults.duration || 0;

    return {
      summary: {
        timestamp: timestamp,
        duration: duration,
        total: testResults.total || 0,
        passed: testResults.passed || 0,
        failed: testResults.failed || 0,
        skipped: testResults.skipped || 0,
        passRate: testResults.total
          ? ((testResults.passed / testResults.total) * 100).toFixed(2)
          : 0,
      },
      environment: {
        browser: config.browser?.name || "chrome",
        headless: config.browser?.headless || false,
        baseUrl: config.baseUrl || "https://www.saucedemo.com",
        nodeVersion: process.version,
        platform: process.platform,
      },
      testSuites: testResults.suites || [],
      screenshots: testResults.screenshots || [],
    };
  }

  /**
   * Generate HTML content for the report
   * @param {Object} reportData - Prepared report data
   * @returns {string} HTML content
   */
  generateHtmlContent(reportData) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SauceDemo Test Report - ${new Date().toLocaleDateString()}</title>
    <style>
        ${this.getReportStyles()}
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="report-header">
            <h1>🧪 SauceDemo Automation Test Report</h1>
            <div class="report-meta">
                <span class="timestamp">📅 ${new Date(
                  reportData.summary.timestamp
                ).toLocaleString()}</span>
                <span class="duration">⏱️ Duration: ${this.formatDuration(
                  reportData.summary.duration
                )}</span>
            </div>
        </header>

        <!-- Summary Cards -->
        <section class="summary-section">
            <div class="summary-cards">
                <div class="card total">
                    <h3>Total Tests</h3>
                    <span class="number">${reportData.summary.total}</span>
                </div>
                <div class="card passed">
                    <h3>Passed</h3>
                    <span class="number">${reportData.summary.passed}</span>
                </div>
                <div class="card failed">
                    <h3>Failed</h3>
                    <span class="number">${reportData.summary.failed}</span>
                </div>
                <div class="card pass-rate">
                    <h3>Pass Rate</h3>
                    <span class="number">${reportData.summary.passRate}%</span>
                </div>
            </div>
            
            <!-- Progress Bar -->
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-passed" style="width: ${
                      reportData.summary.passRate
                    }%"></div>
                </div>
                <div class="progress-label">${reportData.summary.passed} of ${
      reportData.summary.total
    } tests passed</div>
            </div>
        </section>

        <!-- Environment Info -->
        <section class="environment-section">
            <h2>🔧 Test Environment</h2>
            <div class="environment-grid">
                <div class="env-item">
                    <span class="label">Browser:</span>
                    <span class="value">${reportData.environment.browser}${
      reportData.environment.headless ? " (headless)" : ""
    }</span>
                </div>
                <div class="env-item">
                    <span class="label">Base URL:</span>
                    <span class="value">${reportData.environment.baseUrl}</span>
                </div>
                <div class="env-item">
                    <span class="label">Platform:</span>
                    <span class="value">${
                      reportData.environment.platform
                    }</span>
                </div>
                <div class="env-item">
                    <span class="label">Node.js:</span>
                    <span class="value">${
                      reportData.environment.nodeVersion
                    }</span>
                </div>
            </div>
        </section>

        <!-- Test Suites -->
        <section class="suites-section">
            <h2>📋 Test Suites</h2>
            ${this.generateTestSuitesHtml(reportData.testSuites)}
        </section>

        <!-- Screenshots -->
        ${
          reportData.screenshots.length > 0
            ? `
        <section class="screenshots-section">
            <h2>📸 Screenshots</h2>
            <div class="screenshots-grid">
                ${reportData.screenshots
                  .map(
                    (screenshot) => `
                    <div class="screenshot-item">
                        <img src="${screenshot.path}" alt="${screenshot.description}" />
                        <p>${screenshot.description}</p>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </section>
        `
            : ""
        }

        <!-- Footer -->
        <footer class="report-footer">
            <p>Generated by SauceDemo Automation Suite</p>
            <p>Report created on ${new Date().toLocaleString()}</p>
        </footer>
    </div>

    <script>
        ${this.getReportScripts()}
    </script>
</body>
</html>`;
  }

  /**
   * Generate HTML for test suites section
   * @param {Array} testSuites - Array of test suite results
   * @returns {string} HTML content for test suites
   */
  generateTestSuitesHtml(testSuites) {
    if (!testSuites || testSuites.length === 0) {
      return '<p class="no-data">No test suite data available</p>';
    }

    return testSuites
      .map(
        (suite, index) => `
            <div class="test-suite" data-suite="${index}">
                <div class="suite-header" onclick="toggleSuite(${index})">
                    <h3>${suite.title}</h3>
                    <div class="suite-stats">
                        <span class="stat passed">${
                          suite.passed || 0
                        } passed</span>
                        <span class="stat failed">${
                          suite.failed || 0
                        } failed</span>
                        <span class="toggle-icon">▼</span>
                    </div>
                </div>
                <div class="suite-tests" id="suite-${index}">
                    ${(suite.tests || [])
                      .map(
                        (test) => `
                        <div class="test-item ${test.status || "unknown"}">
                            <div class="test-header">
                                <span class="test-status">${this.getStatusIcon(
                                  test.status
                                )}</span>
                                <span class="test-title">${test.title}</span>
                                <span class="test-duration">${this.formatDuration(
                                  test.duration
                                )}</span>
                            </div>
                            ${
                              test.error
                                ? `
                                <div class="test-error">
                                    <strong>Error:</strong> ${test.error}
                                </div>
                            `
                                : ""
                            }
                            ${
                              test.screenshot
                                ? `
                                <div class="test-screenshot">
                                    <img src="${test.screenshot}" alt="Test screenshot" />
                                </div>
                            `
                                : ""
                            }
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        `
      )
      .join("");
  }

  /**
   * Get CSS styles for the report
   * @returns {string} CSS content
   */
  getReportStyles() {
    return `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f5f5f5;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                min-height: 100vh;
            }
            
            .report-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 2rem;
                text-align: center;
            }
            
            .report-header h1 { font-size: 2.5rem; margin-bottom: 1rem; }
            .report-meta { display: flex; justify-content: center; gap: 2rem; font-size: 1.1rem; }
            
            .summary-section { padding: 2rem; }
            .summary-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .card {
                background: white;
                padding: 1.5rem;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                border-left: 4px solid #ddd;
            }
            
            .card.total { border-left-color: #3498db; }
            .card.passed { border-left-color: #27ae60; }
            .card.failed { border-left-color: #e74c3c; }
            .card.pass-rate { border-left-color: #9b59b6; }
            
            .card h3 { color: #666; font-size: 0.9rem; margin-bottom: 0.5rem; }
            .card .number { font-size: 2rem; font-weight: bold; }
            
            .progress-container { margin: 2rem 0; }
            .progress-bar {
                height: 20px;
                background: #ecf0f1;
                border-radius: 10px;
                overflow: hidden;
            }
            .progress-passed {
                height: 100%;
                background: linear-gradient(90deg, #27ae60, #2ecc71);
                transition: width 1s ease;
            }
            .progress-label { text-align: center; margin-top: 0.5rem; color: #666; }
            
            .environment-section, .suites-section, .screenshots-section {
                padding: 2rem;
                border-top: 1px solid #eee;
            }
            
            .environment-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
            }
            
            .env-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid #eee;
            }
            
            .env-item .label { font-weight: bold; color: #666; }
            
            .test-suite {
                margin-bottom: 1rem;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .suite-header {
                background: #f8f9fa;
                padding: 1rem;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .suite-header:hover { background: #e9ecef; }
            
            .suite-stats { display: flex; gap: 1rem; align-items: center; }
            .stat.passed { color: #27ae60; }
            .stat.failed { color: #e74c3c; }
            
            .suite-tests { display: none; padding: 1rem; }
            .suite-tests.expanded { display: block; }
            
            .test-item {
                margin-bottom: 1rem;
                padding: 1rem;
                border-radius: 4px;
                border-left: 4px solid #ddd;
            }
            
            .test-item.passed { border-left-color: #27ae60; background: #f8fff8; }
            .test-item.failed { border-left-color: #e74c3c; background: #fff8f8; }
            
            .test-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }
            
            .test-error {
                background: #ffe6e6;
                padding: 0.5rem;
                border-radius: 4px;
                margin-top: 0.5rem;
                color: #d63031;
            }
            
            .test-screenshot img {
                max-width: 100%;
                height: auto;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-top: 0.5rem;
            }
            
            .report-footer {
                background: #f8f9fa;
                padding: 2rem;
                text-align: center;
                color: #666;
                border-top: 1px solid #eee;
            }
            
            .no-data { text-align: center; color: #666; padding: 2rem; }
        `;
  }

  /**
   * Get JavaScript for report interactivity
   * @returns {string} JavaScript content
   */
  getReportScripts() {
    return `
            function toggleSuite(index) {
                const suiteTests = document.getElementById('suite-' + index);
                const toggleIcon = document.querySelector('[data-suite="' + index + '"] .toggle-icon');
                
                if (suiteTests.classList.contains('expanded')) {
                    suiteTests.classList.remove('expanded');
                    toggleIcon.textContent = '▼';
                } else {
                    suiteTests.classList.add('expanded');
                    toggleIcon.textContent = '▲';
                }
            }
            
            // Auto-expand failed suites
            document.addEventListener('DOMContentLoaded', function() {
                const failedSuites = document.querySelectorAll('.test-suite:has(.failed)');
                failedSuites.forEach((suite, index) => {
                    toggleSuite(index);
                });
            });
        `;
  }

  /**
   * Get status icon for test result
   * @param {string} status - Test status
   * @returns {string} Status icon
   */
  getStatusIcon(status) {
    switch (status) {
      case "passed":
        return "✅";
      case "failed":
        return "❌";
      case "skipped":
        return "⏭️";
      default:
        return "❓";
    }
  }

  /**
   * Format duration in milliseconds to readable format
   * @param {number} duration - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  formatDuration(duration) {
    if (!duration) return "0ms";

    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;

    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
}

export default ReportGenerator;
