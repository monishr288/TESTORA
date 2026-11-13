"""
Test Suite: Authentication & Session Management
Tests valid login workflow and user session logout on SauceDemo.
"""

import pytest
from Pytest_Tests import config
from Pytest_Tests.pages.login_page import LoginPage
from Pytest_Tests.pages.products_page import ProductsPage


class TestLogin:
    """Test suite covering standard valid authentication flows."""

    def test_valid_login(self, driver):
        """
        Verify that a user with valid credentials successfully logs in
        and is redirected to the products inventory page.
        """
        login_page = LoginPage(driver)
        products_page = ProductsPage(driver)

        # 1. Open login page and submit valid credentials
        login_page.login(config.STANDARD_USER, config.PASSWORD)

        # 2. Assert successful redirect to inventory page
        assert products_page.is_loaded(), "Expected products page to load after valid login"
        assert "inventory.html" in driver.current_url, f"Expected URL to contain 'inventory.html', got {driver.current_url}"

        # 3. Assert header title and inventory presence
        assert products_page.get_title_text() == "Products", f"Expected title 'Products', got '{products_page.get_title_text()}'"
        assert products_page.get_product_count() > 0, "Expected at least 1 product to be visible on the inventory page"

    def test_valid_user_logout(self, driver):
        """
        Verify that an authenticated user can log out via the navigation menu
        and is safely redirected back to the login page.
        """
        login_page = LoginPage(driver)
        products_page = ProductsPage(driver)

        # 1. Login with standard credentials
        login_page.login(config.STANDARD_USER, config.PASSWORD)
        assert products_page.is_loaded(), "Products page should be loaded before logout"

        # 2. Trigger logout
        login_page.logout()

        # 3. Assert user is redirected back to login page
        assert login_page.is_on_login_page(), "Expected user to return to login page after logout"
        assert "saucedemo.com" in driver.current_url, "User should remain on saucedemo domain"
