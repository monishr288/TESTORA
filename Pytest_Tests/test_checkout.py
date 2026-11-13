"""
Test Suite: Checkout Workflow & Form Validation
Tests checkout customer info validations and end-to-end order placement on SauceDemo.
"""

import pytest
from Pytest_Tests import config
from Pytest_Tests.pages.login_page import LoginPage
from Pytest_Tests.pages.products_page import ProductsPage
from Pytest_Tests.pages.cart_page import CartPage
from Pytest_Tests.pages.checkout_page import CheckoutPage


class TestCheckout:
    """Test suite covering checkout validations and complete order processing."""

    @pytest.fixture(autouse=True)
    def setup_cart_for_checkout(self, driver):
        """Pre-condition: Log in and add an item to the cart, then navigate to checkout step one."""
        login_page = LoginPage(driver)
        login_page.login(config.STANDARD_USER, config.PASSWORD)

        products_page = ProductsPage(driver)
        assert products_page.is_loaded()
        products_page.add_product_by_name("Sauce Labs Backpack")
        products_page.navigate_to_cart()

        cart_page = CartPage(driver)
        assert cart_page.is_loaded()
        cart_page.proceed_to_checkout()

        checkout_page = CheckoutPage(driver)
        assert checkout_page.is_step_one_loaded(), "Checkout Step 1 should be loaded."

    def test_checkout_form_empty_first_name(self, driver):
        """
        Verify that submitting the checkout form without a first name
        triggers 'Error: First Name is required'.
        """
        checkout_page = CheckoutPage(driver)
        checkout_page.enter_customer_info(first_name="", last_name="Tester", postal_code="12345")
        checkout_page.click_continue()

        assert checkout_page.is_error_displayed(), "Expected validation error for empty first name"
        error_text = checkout_page.get_error_message()
        assert "First Name is required" in error_text, f"Expected 'First Name is required', got '{error_text}'"

    def test_checkout_form_empty_last_name(self, driver):
        """
        Verify that submitting the checkout form without a last name
        triggers 'Error: Last Name is required'.
        """
        checkout_page = CheckoutPage(driver)
        checkout_page.enter_customer_info(first_name="Monish", last_name="", postal_code="12345")
        checkout_page.click_continue()

        assert checkout_page.is_error_displayed(), "Expected validation error for empty last name"
        error_text = checkout_page.get_error_message()
        assert "Last Name is required" in error_text, f"Expected 'Last Name is required', got '{error_text}'"

    def test_checkout_form_empty_postal_code(self, driver):
        """
        Verify that submitting the checkout form without a postal code
        triggers 'Error: Postal Code is required'.
        """
        checkout_page = CheckoutPage(driver)
        checkout_page.enter_customer_info(first_name="Monish", last_name="Tester", postal_code="")
        checkout_page.click_continue()

        assert checkout_page.is_error_displayed(), "Expected validation error for empty postal code"
        error_text = checkout_page.get_error_message()
        assert "Postal Code is required" in error_text, f"Expected 'Postal Code is required', got '{error_text}'"

    def test_successful_end_to_end_checkout(self, driver):
        """
        Verify the entire checkout journey:
        Submitting valid customer information -> Reviewing Order Overview -> Completing order
        -> Asserting final confirmation message 'Thank you for your order!'.
        """
        checkout_page = CheckoutPage(driver)

        # 1. Fill valid customer information
        checkout_page.enter_customer_info(first_name="Monish", last_name="QA Engineer", postal_code="94016")
        checkout_page.click_continue()

        # 2. Assert Step 2 (Overview) loaded
        assert checkout_page.is_step_two_loaded(), "Expected checkout overview page (Step 2) to load"
        subtotal = checkout_page.get_subtotal_text()
        assert "Item total:" in subtotal, f"Expected subtotal label, got '{subtotal}'"

        # 3. Finish the order
        checkout_page.click_finish()

        # 4. Assert Order Completion
        assert checkout_page.is_order_complete(), "Expected checkout complete page to load"
        confirmation_heading = checkout_page.get_completion_header()
        assert "Thank you for your order!" in confirmation_heading, (
            f"Expected confirmation header 'Thank you for your order!', got '{confirmation_heading}'"
        )
