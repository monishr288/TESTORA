"""
Test Suite: Product Catalog & Sorting
Tests inventory page loading, catalog item structure, and product sorting options on SauceDemo.
"""

import pytest
from Pytest_Tests import config
from Pytest_Tests.pages.login_page import LoginPage
from Pytest_Tests.pages.products_page import ProductsPage


class TestProducts:
    """Test suite covering product inventory display and catalog functionality."""

    @pytest.fixture(autouse=True)
    def setup_authenticated_session(self, driver):
        """Pre-condition: Log in with standard user before each product test."""
        login_page = LoginPage(driver)
        login_page.login(config.STANDARD_USER, config.PASSWORD)
        products_page = ProductsPage(driver)
        assert products_page.is_loaded(), "Pre-condition failed: Products page did not load."

    def test_product_page_loading_and_items_display(self, driver):
        """
        Verify that the product inventory page loads properly with
        all catalog items visible and having title, price, and description.
        """
        products_page = ProductsPage(driver)

        # 1. Verify page title
        assert products_page.get_title_text() == "Products"

        # 2. Verify product count (SauceDemo standard inventory has 6 items)
        count = products_page.get_product_count()
        assert count == 6, f"Expected 6 items in catalog, found {count}"

        # 3. Verify product names and prices are non-empty
        names = products_page.get_all_product_names()
        prices = products_page.get_all_product_prices()

        assert len(names) == 6, "Expected 6 product names"
        assert len(prices) == 6, "Expected 6 product prices"
        assert all(len(name) > 0 for name in names), "Found item with empty name"
        assert all(price > 0 for price in prices), "Found item with non-positive price"

    def test_product_sorting_price_low_to_high(self, driver):
        """
        Verify that selecting 'Price (low to high)' sorts products in ascending price order.
        """
        products_page = ProductsPage(driver)

        # Apply sort
        products_page.sort_by("lohi")

        # Fetch prices and assert ascending order
        prices = products_page.get_all_product_prices()
        assert len(prices) > 0, "No prices retrieved"
        sorted_expected = sorted(prices)
        assert prices == sorted_expected, f"Prices not sorted low to high: {prices} vs {sorted_expected}"

    def test_product_sorting_name_z_to_a(self, driver):
        """
        Verify that selecting 'Name (Z to A)' sorts products in reverse alphabetical order.
        """
        products_page = ProductsPage(driver)

        # Apply sort
        products_page.sort_by("za")

        # Fetch names and assert descending alphabetical order
        names = products_page.get_all_product_names()
        assert len(names) > 0, "No product names retrieved"
        sorted_expected = sorted(names, reverse=True)
        assert names == sorted_expected, f"Names not sorted Z to A: {names} vs {sorted_expected}"
