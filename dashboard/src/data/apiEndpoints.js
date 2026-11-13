/**
 * API Endpoints Documentation & Live Test Specifications.
 * Distinguishes implemented live backend endpoints from mock/sample endpoints.
 * Supports full REST verbs: GET, POST, PUT, DELETE.
 */

export const API_ENDPOINTS = [
  // --- Live GET Endpoints ---
  {
    id: "api-health",
    name: "Backend Health Check",
    method: "GET",
    endpoint: "/",
    isLive: true,
    description: "Pings the backend service root to verify server liveness, operational status, and API version.",
    expectedStatus: 200,
    expectedResponse: {
      message: "TESTORA Backend API is running",
      status: "healthy",
      version: "1.0.0",
      docs_url: "/docs",
      timestamp: "string"
    },
    samplePayload: null
  },
  {
    id: "api-status",
    name: "System Status & Test Suites",
    method: "GET",
    endpoint: "/api/status",
    isLive: true,
    description: "Returns backend system state, active execution lock status, and discovered Pytest test suites.",
    expectedStatus: 200,
    expectedResponse: {
      status: "ready | busy",
      is_test_running: false,
      available_test_suites: ["test_login.py", "test_products.py", "..."],
      total_history_runs: 5,
      target_application: { name: "SauceDemo", url: "https://www.saucedemo.com/" }
    },
    samplePayload: null
  },
  {
    id: "api-test-files",
    name: "List Test Suite Files",
    method: "GET",
    endpoint: "/api/test-files",
    isLive: true,
    description: "Dynamically inspects the Pytest_Tests directory and returns all test suite filenames.",
    expectedStatus: 200,
    expectedResponse: {
      success: true,
      count: 5,
      files: ["test_cart.py", "test_checkout.py", "test_login.py", "test_login_scenarios.py", "test_products.py"]
    },
    samplePayload: null
  },
  {
    id: "api-latest-results",
    name: "Get Latest Test Results",
    method: "GET",
    endpoint: "/api/results/latest",
    isLive: true,
    description: "Fetches structured metrics and individual test breakdowns from the most recent test run.",
    expectedStatus: 200,
    expectedResponse: {
      success: true,
      latest: {
        run_id: "run_20261113_135854",
        status: "passed",
        summary: { total: 18, passed: 18, failed: 0, skipped: 0, errors: 0 },
        duration_seconds: 104.77,
        tests: []
      }
    },
    samplePayload: null
  },
  {
    id: "api-history",
    name: "Get Test Execution History",
    method: "GET",
    endpoint: "/api/history?limit=10",
    isLive: true,
    description: "Reads persistent execution records from test_history.json in reverse chronological order.",
    expectedStatus: 200,
    expectedResponse: {
      success: true,
      count: 2,
      history: []
    },
    samplePayload: null
  },
  {
    id: "api-get-config",
    name: "Get Test Configuration",
    method: "GET",
    endpoint: "/api/config",
    isLive: true,
    description: "Retrieves active test execution parameters (headless mode, browser engine, timeouts, target URL).",
    expectedStatus: 200,
    expectedResponse: {
      success: true,
      config: {
        headless: true,
        browser: "chrome",
        timeout: 10,
        base_url: "https://www.saucedemo.com/",
        retries: 0,
        verbose: true
      }
    },
    samplePayload: null
  },
  {
    id: "api-screenshots",
    name: "List Failure Screenshots",
    method: "GET",
    endpoint: "/api/screenshots",
    isLive: true,
    description: "Returns catalog of auto-captured failure screenshots with public asset URLs.",
    expectedStatus: 200,
    expectedResponse: {
      success: true,
      count: 2,
      screenshots: [{ filename: "failure_test.png", url: "/screenshots/failure_test.png" }]
    },
    samplePayload: null
  },

  // --- Live POST Endpoints ---
  {
    id: "api-run-tests",
    name: "Trigger Pytest Test Suite",
    method: "POST",
    endpoint: "/api/run-tests",
    isLive: true,
    description: "Safely spawns Pytest via Python subprocess to execute genuine Selenium tests on SauceDemo.",
    expectedStatus: 200,
    expectedResponse: {
      success: true,
      message: "Test execution finished",
      run: {
        run_id: "run_2026...",
        status: "passed",
        summary: { total: 2, passed: 2, failed: 0, skipped: 0, errors: 0 }
      }
    },
    samplePayload: {
      test_file: "test_login.py",
      headless: true,
      browser: "chrome"
    }
  },

  // --- Live PUT Endpoints ---
  {
    id: "api-update-config",
    name: "Update Test Runner Configuration",
    method: "PUT",
    endpoint: "/api/config",
    isLive: true,
    description: "Dynamically updates runtime test configuration (headless mode, browser, timeout, target URL) via HTTP PUT.",
    expectedStatus: 200,
    expectedResponse: {
      success: true,
      message: "Configuration updated successfully",
      config: {
        headless: true,
        browser: "chrome",
        timeout: 10,
        base_url: "https://www.saucedemo.com/",
        retries: 0,
        verbose: true
      }
    },
    samplePayload: {
      headless: true,
      browser: "chrome",
      timeout: 10,
      base_url: "https://www.saucedemo.com/"
    }
  },

  // --- Live DELETE Endpoints ---
  {
    id: "api-clear-history",
    name: "Clear All Test History",
    method: "DELETE",
    endpoint: "/api/history",
    isLive: true,
    description: "Clears all execution records from persistent test_history.json storage.",
    expectedStatus: 200,
    expectedResponse: {
      success: true,
      message: "Test history cleared successfully"
    },
    samplePayload: null
  },
  {
    id: "api-delete-run",
    name: "Delete Single Test Run Record",
    method: "DELETE",
    endpoint: "/api/history/{run_id}",
    isLive: true,
    description: "Deletes an individual historical execution record by its unique run_id.",
    expectedStatus: 200,
    expectedResponse: {
      success: true,
      message: "Test run 'run_...' deleted successfully"
    },
    samplePayload: null
  },
  {
    id: "api-delete-screenshot",
    name: "Delete Failure Screenshot File",
    method: "DELETE",
    endpoint: "/api/screenshots/{filename}",
    isLive: true,
    description: "Removes a specific captured failure screenshot file from disk storage.",
    expectedStatus: 200,
    expectedResponse: {
      success: true,
      message: "Screenshot 'filename.png' deleted successfully"
    },
    samplePayload: null
  },

  // --- Sample / Mock E-Commerce Endpoints (Contract Documentation) ---
  {
    id: "api-sample-auth-mock",
    name: "SauceDemo Mock User Session (Sample)",
    method: "POST",
    endpoint: "/mock/auth/v1/sessions",
    isLive: false,
    description: "[Sample / Documentation Only] Mock OAuth2 session token endpoint used for contract testing comparisons.",
    expectedStatus: 201,
    expectedResponse: {
      token_type: "Bearer",
      access_token: "jwt_mock_eyJhbGciOi...",
      expires_in: 3600,
      scope: "read:inventory write:cart"
    },
    samplePayload: {
      client_id: "sauce_demo_app",
      username: "standard_user"
    }
  },
  {
    id: "api-sample-inventory-mock",
    name: "SauceDemo Inventory REST API (Sample)",
    method: "GET",
    endpoint: "/mock/inventory/v1/items",
    isLive: false,
    description: "[Sample / Documentation Only] Headless catalog item schema for contract verification and API fuzz testing.",
    expectedStatus: 200,
    expectedResponse: {
      total: 6,
      items: [
        { id: 4, name: "Sauce Labs Backpack", price: 29.99, in_stock: true }
      ]
    },
    samplePayload: null
  },
  {
    id: "api-sample-cart-update",
    name: "SauceDemo Update Cart Item (Sample)",
    method: "PUT",
    endpoint: "/mock/cart/v1/items/4",
    isLive: false,
    description: "[Sample / Documentation Only] Update quantity or customer options for an item in the active shopping cart.",
    expectedStatus: 200,
    expectedResponse: {
      success: true,
      item_id: 4,
      quantity: 2,
      subtotal: 59.98
    },
    samplePayload: {
      quantity: 2
    }
  },
  {
    id: "api-sample-cart-delete",
    name: "SauceDemo Remove Item From Cart (Sample)",
    method: "DELETE",
    endpoint: "/mock/cart/v1/items/4",
    isLive: false,
    description: "[Sample / Documentation Only] Removes an item from the user's active shopping cart session.",
    expectedStatus: 200,
    expectedResponse: {
      success: true,
      message: "Item 4 removed from cart",
      remaining_items: 0
    },
    samplePayload: null
  }
];
