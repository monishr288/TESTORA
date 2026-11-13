"""
Test Suite: Shopping Cart Operations
Tests adding items, badge counter updates, removing items, and cart page contents on SauceDemo.
"""

import pytest
from Pytest_Tests import config
from Pytest_Tests.pages.login_page import LoginPage
from Pytest_Tests.pages.products_page import ProductsPage
from Pytest_Tests.pages.cart_page import CartPage


class TestCart:
    """Test suite covering cart management actions."""

    @pytest.fixture(autouse=True)
    def setup_authenticated_session(self, driver):
        """Pre-condition: Log in with standard user before each cart test."""
        login_page = LoginPage(driver)
        login_page.login(config.STANDARD_USER, config.PASSWORD)
        products_page = ProductsPage(driver)
        assert products_page.is_loaded(), "Pre-condition failed: Products page did not load."

    def test_add_single_product_to_cart(self, driver):
        """
        Verify that clicking 'Add to cart' on a product increases the cart badge count to 1
        and the button switches to 'Remove'.
        """
        products_page = ProductsPage(driver)

        # 1. Cart badge initially 0
        assert products_page.get_cart_badge_count(timeout=1) == 0, "Cart should initially be empty"

        # 2. Add first product
        added_product = products_page.add_first_product_to_cart()
        assert added_product != "", "Expected at least one product in catalog"

        # 3. Assert button changed to Remove and badge count is updated to 1
        assert products_page.is_remove_button_displayed(added_product), f"Expected Remove button for {added_product}"
        assert products_page.get_cart_badge_count(timeout=3) == 1, "Cart badge should display '1' after adding one item"

    def test_add_multiple_products_to_cart(self, driver):
        """
        Verify that adding multiple items updates the cart badge count accordingly.
        """
        products_page = ProductsPage(driver)

        # Add two specific items
        products_page.add_product_by_name("Sauce Labs Backpack")
        products_page.add_product_by_name("Sauce Labs Bike Light")

        assert products_page.get_cart_badge_count() == 2, "Cart badge should display '2' after adding two items"

    def test_remove_product_from_products_page(self, driver):
        """
        Verify that clicking 'Remove' on the inventory page decreases/clears the cart badge.
        """
        products_page = ProductsPage(driver)

        # 1. Add product
        products_page.add_product_by_name("Sauce Labs Backpack")
        assert products_page.get_cart_badge_count() == 1

        # 2. Remove product
        products_page.remove_product_by_name("Sauce Labs Backpack")

        # 3. Assert cart badge is 0 (removed)
        assert products_page.get_cart_badge_count() == 0, "Cart badge should be 0 after item removal"

    def test_cart_page_item_verification_and_removal(self, driver):
        """
        Verify that items added to the cart appear accurately on the cart page
        and can be removed from within the cart view.
        """
        products_page = ProductsPage(driver)
        cart_page = CartPage(driver)

        # 1. Add specific item
        product_name = "Sauce Labs Backpack"
        products_page.add_product_by_name(product_name)

        # 2. Navigate to Cart page
        products_page.navigate_to_cart()
        assert cart_page.is_loaded(), "Cart page should be loaded"
        assert cart_page.get_title_text() == "Your Cart"

        # 3. Verify item is in cart
        items_in_cart = cart_page.get_cart_item_names()
        assert product_name in items_in_cart, f"Expected '{product_name}' to be listed in cart"
        assert cart_page.get_cart_item_count() == 1

        # 4. Remove item from inside the cart page
        cart_page.remove_item_by_name(product_name)
        assert cart_page.get_cart_item_count() == 0, "Cart should be empty after item is removed"
