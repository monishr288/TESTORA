/**
 * Manual Test Cases Database for SauceDemo E-Commerce Testing.
 * Structured for QA Portfolio showcase demonstrating rigorous testing documentation.
 *
 * Each test case contains:
 * - status: 'Not Run' | 'Passed' | 'Failed' | 'Blocked'
 * - isExecutedManually: boolean (true if executed manually, false if unexecuted/pending)
 */

export const INITIAL_MANUAL_TESTS = [
  {
    id: "TC-AUTH-001",
    scenario: "Verify successful authentication with valid standard user credentials",
    module: "Authentication",
    priority: "Critical",
    status: "Passed",
    isExecutedManually: true,
    preconditions: "1. Web browser open to https://www.saucedemo.com/\n2. Valid credentials standard_user / secret_sauce exist",
    steps: [
      "Navigate to SauceDemo homepage",
      "Enter 'standard_user' into the Username field",
      "Enter 'secret_sauce' into the Password field",
      "Click the 'Login' button"
    ],
    expectedResult: "User is authenticated and redirected to /inventory.html. Header displays 'Products' and inventory items are loaded.",
    actualResult: "User redirected to /inventory.html successfully. Title 'Products' visible.",
    executedAt: "2026-11-13 10:15 AM",
    tester: "Monish (QA Automation Lead)"
  },
  {
    id: "TC-AUTH-002",
    scenario: "Verify error message when logging in with locked-out account",
    module: "Authentication",
    priority: "High",
    status: "Passed",
    isExecutedManually: true,
    preconditions: "User is on the SauceDemo login page",
    steps: [
      "Enter 'locked_out_user' into the Username field",
      "Enter 'secret_sauce' into the Password field",
      "Click the 'Login' button"
    ],
    expectedResult: "Login fails. Red banner displays: 'Epic sadface: Sorry, this user has been locked out.'",
    actualResult: "Red error banner accurately displayed with exact message. No redirect occurred.",
    executedAt: "2026-11-13 10:20 AM",
    tester: "Monish (QA Automation Lead)"
  },
  {
    id: "TC-AUTH-003",
    scenario: "Verify validation errors when submitting empty username or password",
    module: "Authentication",
    priority: "High",
    status: "Passed",
    isExecutedManually: true,
    preconditions: "User is on the SauceDemo login page",
    steps: [
      "Leave Username empty and click 'Login'",
      "Observe validation error banner",
      "Enter username but leave Password empty, click 'Login'",
      "Observe validation error banner"
    ],
    expectedResult: "Displays 'Epic sadface: Username is required' then 'Epic sadface: Password is required'.",
    actualResult: "Both field validations trigger with proper error highlights.",
    executedAt: "2026-11-13 10:25 AM",
    tester: "Monish (QA Automation Lead)"
  },
  {
    id: "TC-PROD-001",
    scenario: "Verify all 6 product catalog items render with name, description, and price",
    module: "Product Catalog",
    priority: "Critical",
    status: "Passed",
    isExecutedManually: true,
    preconditions: "User is logged in as standard_user on /inventory.html",
    steps: [
      "Count total item cards in the catalog grid",
      "Verify each product card contains an image, non-empty title, descriptive text, and dollar price",
      "Verify 'Add to cart' button is visible for each item"
    ],
    expectedResult: "Exactly 6 products render with valid attributes and positive currency amounts.",
    actualResult: "All 6 items render properly. Currency format matches $XX.YY.",
    executedAt: "2026-11-13 10:40 AM",
    tester: "Monish (QA Automation Lead)"
  },
  {
    id: "TC-PROD-002",
    scenario: "Verify catalog product images when logged in as problem_user",
    module: "Product Catalog",
    priority: "High",
    status: "Failed",
    isExecutedManually: true,
    preconditions: "User logged in with problem_user / secret_sauce",
    steps: [
      "Navigate to inventory catalog as problem_user",
      "Inspect image source for each product card"
    ],
    expectedResult: "Each item card should display its unique product photograph asset.",
    actualResult: "BUG CONFIRMED: All product images display identical fallback dog avatar (/static/media/sl-404.168b1cce.jpg).",
    executedAt: "2026-11-13 10:55 AM",
    tester: "Monish (QA Automation Lead)"
  },
  {
    id: "TC-PROD-003",
    scenario: "Verify product sorting by Price (low to high) and Name (Z to A)",
    module: "Product Catalog",
    priority: "Medium",
    status: "Passed",
    isExecutedManually: true,
    preconditions: "User on inventory page",
    steps: [
      "Click product sort dropdown",
      "Select 'Price (low to high)' and verify ascending sequence",
      "Select 'Name (Z to A)' and verify descending alphabetical sequence"
    ],
    expectedResult: "Inventory items reorder correctly based on selected sorting criteria.",
    actualResult: "Price sort: $7.99 to $49.99 ascending. Name sort: 'Test.allTheThings()...' to 'Sauce Labs Backpack'.",
    executedAt: "2026-11-13 11:10 AM",
    tester: "Monish (QA Automation Lead)"
  },
  {
    id: "TC-CART-001",
    scenario: "Verify adding product increments cart badge and updates button state",
    module: "Shopping Cart",
    priority: "Critical",
    status: "Passed",
    isExecutedManually: true,
    preconditions: "Authenticated standard_user with empty shopping cart",
    steps: [
      "Verify cart badge does not exist initially",
      "Click 'Add to cart' on 'Sauce Labs Backpack'",
      "Verify cart badge displays '1'",
      "Verify button label toggles to 'Remove'"
    ],
    expectedResult: "Badge counter becomes visible showing 1. Button changes style and label to Remove.",
    actualResult: "Badge displayed '1'. Button changed to 'Remove'.",
    executedAt: "2026-11-13 11:30 AM",
    tester: "Monish (QA Automation Lead)"
  },
  {
    id: "TC-CART-002",
    scenario: "Verify item persistence and removal inside Cart page view",
    module: "Shopping Cart",
    priority: "High",
    status: "Not Run",
    isExecutedManually: false,
    preconditions: "1 item added to cart",
    steps: [
      "Click the shopping cart link icon in the top header",
      "Verify navigation to /cart.html",
      "Verify item name, quantity, and price match the inventory page",
      "Click 'Remove' button inside cart",
      "Verify item is removed and cart becomes empty"
    ],
    expectedResult: "Item correctly appears in cart list. Clicking Remove deletes it from DOM and badge count drops to 0.",
    actualResult: "Pending manual execution",
    executedAt: null,
    tester: "Unassigned"
  },
  {
    id: "TC-CHCK-001",
    scenario: "Verify customer information form validation on Checkout Step One",
    module: "Checkout",
    priority: "Critical",
    status: "Not Run",
    isExecutedManually: false,
    preconditions: "Cart has items and user is on /checkout-step-one.html",
    steps: [
      "Leave First Name empty and click 'Continue'",
      "Assert 'Error: First Name is required'",
      "Fill First Name, leave Last Name empty, click 'Continue'",
      "Assert 'Error: Last Name is required'",
      "Fill Last Name, leave Zip Code empty, click 'Continue'",
      "Assert 'Error: Postal Code is required'"
    ],
    expectedResult: "Validation banners appear for all three mandatory fields.",
    actualResult: "Pending manual execution",
    executedAt: null,
    tester: "Unassigned"
  },
  {
    id: "TC-CHCK-002",
    scenario: "Verify complete End-to-End checkout journey and order placement",
    module: "Checkout",
    priority: "Critical",
    status: "Passed",
    isExecutedManually: true,
    preconditions: "Standard user logged in with 1 item in cart",
    steps: [
      "Navigate to cart and click 'Checkout'",
      "Fill valid details: First Name='Monish', Last Name='QA', Zip='94016'",
      "Click 'Continue'",
      "Review Order Overview (/checkout-step-two.html): check subtotal, tax, and total",
      "Click 'Finish'",
      "Verify /checkout-complete.html with header 'Thank you for your order!'"
    ],
    expectedResult: "Order confirmed with header 'Thank you for your order!' and 'Back Home' button active.",
    actualResult: "Order placed successfully. Confirmation banner confirmed.",
    executedAt: "2026-11-13 12:30 PM",
    tester: "Monish (QA Automation Lead)"
  },
  {
    id: "TC-PERF-001",
    scenario: "Verify system latency when authenticating as performance_glitch_user",
    module: "Performance",
    priority: "Medium",
    status: "Blocked",
    isExecutedManually: true,
    preconditions: "Performance monitoring tools attached",
    steps: [
      "Login using 'performance_glitch_user'",
      "Measure page transition time to /inventory.html"
    ],
    expectedResult: "Page transition should complete under 2000ms threshold.",
    actualResult: "Blocked: Synthetic delay introduces 5000ms server stall. Requires SLA exception or mock bypass.",
    executedAt: "2026-11-13 01:00 PM",
    tester: "Monish (QA Automation Lead)"
  },
  {
    id: "TC-SEC-001",
    scenario: "Verify unauthorized direct access to /inventory.html without session",
    module: "Security",
    priority: "Critical",
    status: "Not Run",
    isExecutedManually: false,
    preconditions: "Clear cookies and browser storage",
    steps: [
      "Paste https://www.saucedemo.com/inventory.html directly into URL bar in incognito window",
      "Press Enter"
    ],
    expectedResult: "User is blocked from inventory view and redirected to login with error: 'Epic sadface: You can only access '/inventory.html' when you are logged in.'",
    actualResult: "Pending manual execution",
    executedAt: null,
    tester: "Unassigned"
  }
];
