# TESTORA Defect Report: SauceDemo E-Commerce Platform

**Bug ID:** BUG-2026-SD-001
**Project:** TESTORA — Quality Engineering Platform (SauceDemo Target)
**Environment:** Production Demo (https://www.saucedemo.com/)
**Browser:** Google Chrome (Headless & Headed)
**Reported By:** Monish - QA Automation Engineer
**Date Reported:** 2026-11-13
**Severity:** High
**Priority:** High
**Status:** Open

---

## 1. Summary
When authenticating as `problem_user`, all product catalog images fail to load correctly (render identical dog avatar placeholder `sl-404.168b1cce.jpg`), and submitting customer information during Checkout Step 1 throws an unhandled input freeze where the `last-name` value is rejected.

---

## 2. Steps to Reproduce
1. Navigate to `https://www.saucedemo.com/`.
2. Enter Username: `problem_user`.
3. Enter Password: `secret_sauce`.
4. Click the **Login** button.
5. Observe the product catalog grid at `/inventory.html`.
6. Add the first product ("Sauce Labs Backpack") to the shopping cart.
7. Click the shopping cart icon to navigate to `/cart.html`.
8. Click the **Checkout** button to navigate to `/checkout-step-one.html`.
9. Enter:
   - First Name: `Monish`
   - Last Name: `Tester`
   - Postal Code: `94016`
10. Click the **Continue** button.

---

## 3. Expected Result
1. Product cards should display distinct, matching image assets corresponding to each inventory product.
2. The checkout form should accept valid customer names and zip code, successfully transitioning to `/checkout-step-two.html` (Order Overview).

---

## 4. Actual Result
1. All 6 inventory items load the generic fallback 404 asset: `src="/static/media/sl-404.168b1cce.jpg"`.
2. In the checkout form, the Last Name field cannot be saved properly; clicking **Continue** displays error: `Error: Last Name is required`, preventing the customer from completing checkout.

---

## 5. Automated Test Evidence
- **Automated Test Script:** `Pytest_Tests/test_checkout.py`
- **Failure Screenshot:** Saved in `Screenshots/failure_checkout_step_one_problem_user.png`
- **Execution Log:** Captured in `Test_Reports/latest_results.json`

---

## 6. Suggested Fix / Developer Notes
- Inspect the React state binding for the `#last-name` input inside `CheckoutStepOne.jsx`. Ensure `onChange` correctly updates the checkout form state when populated.
- Review image path mapping in inventory data store for user roles.
