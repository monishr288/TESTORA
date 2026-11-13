/**
 * Bug Reports Database for SauceDemo E-Commerce Testing.
 * Clearly classifies defects as:
 * - 'Confirmed': Reproducible live bug on target application (SauceDemo).
 * - 'Sample': Portfolio demonstration defect for defect logging specification.
 */

export const INITIAL_BUG_REPORTS = [
  {
    id: "BUG-SD-001",
    title: "All product catalog images broken and load 404 placeholder for problem_user",
    module: "Product Catalog",
    severity: "High",
    priority: "P1",
    status: "Open",
    classification: "Confirmed",
    environment: "Chrome 124, Windows 11, https://www.saucedemo.com/",
    reporter: "Monish (QA Automation Lead)",
    assignee: "Frontend Team Lead",
    dateReported: "2026-11-13",
    stepsToReproduce: [
      "Navigate to https://www.saucedemo.com/",
      "Log in with username 'problem_user' and password 'secret_sauce'",
      "Inspect the product catalog grid at /inventory.html",
      "Inspect image elements across all 6 product cards"
    ],
    expectedResult: "Each product card must render its corresponding high-res product photo asset.",
    actualResult: "Confirmed Defect: All 6 product cards reference '/static/media/sl-404.168b1cce.jpg' (generic dog avatar) instead of real product images.",
    suggestedFix: "Fix asset path mapping in the user role mock provider for problem_user."
  },
  {
    id: "BUG-SD-002",
    title: "Checkout Step 1 fails to accept Last Name when logged in as problem_user",
    module: "Checkout",
    severity: "Critical",
    priority: "P1",
    status: "Open",
    classification: "Confirmed",
    environment: "Chrome 124, Windows 11, Production Demo",
    reporter: "Monish (QA Automation Lead)",
    assignee: "Checkout Engineer",
    dateReported: "2026-11-13",
    stepsToReproduce: [
      "Login as problem_user",
      "Add any product to cart and proceed to /checkout-step-one.html",
      "Type valid First Name, valid Last Name, and valid Zip Code",
      "Click 'Continue' button"
    ],
    expectedResult: "Form submits and navigates to /checkout-step-two.html (Overview).",
    actualResult: "Confirmed Defect: Form refuses input and flashes 'Error: Last Name is required', making checkout impossible.",
    suggestedFix: "Check input value binding in React controlled component state for '#last-name' field."
  },
  {
    id: "BUG-SD-003",
    title: "[Sample] Cart badge counter fails to re-render when navigating via browser back button",
    module: "Shopping Cart",
    severity: "Medium",
    priority: "P2",
    status: "In Progress",
    classification: "Sample",
    environment: "Chrome 124, Windows 11 & macOS Sonoma",
    reporter: "Monish (QA Automation Lead)",
    assignee: "State Management Squad",
    dateReported: "2026-11-12",
    stepsToReproduce: [
      "Log in as standard_user",
      "Add Sauce Labs Backpack to cart (badge shows '1')",
      "Navigate to Cart page and remove item (badge clears)",
      "Click browser Back button to return to /inventory.html"
    ],
    expectedResult: "Inventory page reflects updated empty cart state and 'Add to cart' button.",
    actualResult: "Demonstration Defect: Cached state displays stale badge until manual page refresh is triggered (portfolio sample specification).",
    suggestedFix: "Synchronize shopping cart state with localStorage / broadcast channel or popstate event listener."
  },
  {
    id: "BUG-SD-004",
    title: "[Sample] Sidebar hamburger menu overlay does not trap keyboard focus (WCAG 2.1)",
    module: "Accessibility / UI",
    severity: "Low",
    priority: "P3",
    status: "Resolved",
    classification: "Sample",
    environment: "Chrome 124, Firefox 125, Keyboard Navigation",
    reporter: "Monish (QA Automation Lead)",
    assignee: "Design Systems Engineer",
    dateReported: "2026-11-10",
    stepsToReproduce: [
      "Open hamburger menu via Tab + Enter on #react-burger-menu-btn",
      "Continue pressing Tab key to navigate menu items"
    ],
    expectedResult: "Focus stays trapped inside the slide-out navigation drawer until closed.",
    actualResult: "Demonstration Defect: Focus leaks into background elements (documented accessibility compliance sample).",
    suggestedFix: "Implement focus-trap or inert attribute on main content when sidebar dialog is active."
  },
  {
    id: "BUG-SD-005",
    title: "5000ms synthetic latency blocks automated regression on performance_glitch_user",
    module: "Performance",
    severity: "Medium",
    priority: "P3",
    status: "Verified",
    classification: "Confirmed",
    environment: "All Browsers, CI/CD Pipeline",
    reporter: "Monish (QA Automation Lead)",
    assignee: "QA DevSecOps",
    dateReported: "2026-11-08",
    stepsToReproduce: [
      "Initiate automated session using credentials for 'performance_glitch_user'",
      "Execute standard 10s timeout login verification step"
    ],
    expectedResult: "Standard HTTP 200/302 response within 1500ms budget.",
    actualResult: "Confirmed Defect: SauceDemo intentionally delays response by 5000ms, triggering transient timeout warnings in automation runner.",
    suggestedFix: "Set custom explicit wait tolerance (15s) when running the performance user test profile."
  }
];
