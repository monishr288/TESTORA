"""
ProductsPage (Inventory) Page Object for SauceDemo product catalog.
Encapsulates inventory listings, product sorting, and cart actions.
"""

from typing import List, Tuple
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support.ui import Select

from Pytest_Tests.pages.base_page import BasePage


class ProductsPage(BasePage):
    """Encapsulates SauceDemo inventory page elements and user actions."""

    # Locators
    PAGE_TITLE: Tuple[str, str] = (By.CLASS_NAME, "title")
    INVENTORY_ITEMS: Tuple[str, str] = (By.CLASS_NAME, "inventory_item")
    ITEM_NAMES: Tuple[str, str] = (By.CLASS_NAME, "inventory_item_name")
    ITEM_PRICES: Tuple[str, str] = (By.CLASS_NAME, "inventory_item_price")
    ITEM_DESCRIPTIONS: Tuple[str, str] = (By.CLASS_NAME, "inventory_item_desc")
    ITEM_IMAGES: Tuple[str, str] = (By.CSS_SELECTOR, ".inventory_item_img img")
    CART_BADGE: Tuple[str, str] = (By.CLASS_NAME, "shopping_cart_badge")
    CART_LINK: Tuple[str, str] = (By.CLASS_NAME, "shopping_cart_link")
    SORT_CONTAINER: Tuple[str, str] = (By.CLASS_NAME, "product_sort_container")

    def __init__(self, driver: WebDriver):
        super().__init__(driver)

    def is_loaded(self) -> bool:
        """Verifies if the products page has finished loading."""
        return self.wait_for_url_contains("inventory.html") and self.is_displayed(self.PAGE_TITLE)

    def get_title_text(self) -> str:
        """Returns the page title text (e.g. 'Products')."""
        return self.get_text(self.PAGE_TITLE)

    def get_product_count(self) -> int:
        """Returns the total number of displayed product cards."""
        return len(self.find_elements(self.INVENTORY_ITEMS))

    def get_all_product_names(self) -> List[str]:
        """Returns a list of all product name strings currently displayed."""
        elements = self.find_elements(self.ITEM_NAMES)
        return [elem.text.strip() for elem in elements]

    def get_all_product_prices(self) -> List[float]:
        """Returns a list of all product prices as floats (e.g. 29.99)."""
        elements = self.find_elements(self.ITEM_PRICES)
        prices = []
        for elem in elements:
            raw = elem.text.replace("$", "").strip()
            if raw:
                prices.append(float(raw))
        return prices

    def add_first_product_to_cart(self) -> str:
        """Adds the first product in the list to the shopping cart and returns its name."""
        names = self.get_all_product_names()
        if names:
            self.add_product_by_name(names[0])
            return names[0]
        return ""

    def add_product_by_name(self, product_name: str) -> None:
        """Adds a specific product to the cart by matching its display name."""
        # Convert product name to saucedemo button data-test format: add-to-cart-sauce-labs-backpack
        slug = product_name.lower().replace(" ", "-")
        locator = (By.CSS_SELECTOR, f"button[data-test='add-to-cart-{slug}']")
        self.click(locator)

    def remove_product_by_name(self, product_name: str) -> None:
        """Removes a specific product from the cart from the products page."""
        slug = product_name.lower().replace(" ", "-")
        locator = (By.CSS_SELECTOR, f"button[data-test='remove-{slug}']")
        self.click(locator)

    def is_remove_button_displayed(self, product_name: str) -> bool:
        """Checks if the Remove button is displayed for the given product."""
        slug = product_name.lower().replace(" ", "-")
        locator = (By.CSS_SELECTOR, f"button[data-test='remove-{slug}']")
        return self.is_displayed(locator, timeout=5)

    def get_cart_badge_count(self, timeout: int = 2) -> int:
        """Returns the integer number shown in the cart badge, or 0 if badge is not present."""
        if not self.is_displayed(self.CART_BADGE, timeout=timeout):
            return 0
        text = self.get_text(self.CART_BADGE, timeout=timeout)
        return int(text) if text.isdigit() else 0

    def navigate_to_cart(self) -> None:
        """Clicks the shopping cart icon to open the cart page."""
        self.click(self.CART_LINK)
        self.wait_for_url_contains("cart.html")

    def sort_by(self, option_value: str) -> None:
        """
        Sorts the products list using the sort dropdown.
        Options: 'az' (A-Z), 'za' (Z-A), 'lohi' (Low to High), 'hilo' (High to Low).
        """
        select_elem = self.find_element(self.SORT_CONTAINER)
        dropdown = Select(select_elem)
        dropdown.select_by_value(option_value)
