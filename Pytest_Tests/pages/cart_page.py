"""
CartPage Page Object for SauceDemo shopping cart view.
Encapsulates cart item inspection, item removal, and proceeding to checkout.
"""

from typing import List, Tuple
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from Pytest_Tests.pages.base_page import BasePage


class CartPage(BasePage):
    """Encapsulates SauceDemo cart page elements and user actions."""

    # Locators
    PAGE_TITLE: Tuple[str, str] = (By.CLASS_NAME, "title")
    CART_ITEMS: Tuple[str, str] = (By.CLASS_NAME, "cart_item")
    ITEM_NAMES: Tuple[str, str] = (By.CLASS_NAME, "inventory_item_name")
    ITEM_PRICES: Tuple[str, str] = (By.CLASS_NAME, "inventory_item_price")
    CHECKOUT_BUTTON: Tuple[str, str] = (By.ID, "checkout")
    CONTINUE_SHOPPING_BUTTON: Tuple[str, str] = (By.ID, "continue-shopping")

    def __init__(self, driver: WebDriver):
        super().__init__(driver)

    def is_loaded(self) -> bool:
        """Verifies if the cart page has finished loading."""
        return self.wait_for_url_contains("cart.html") and self.is_displayed(self.PAGE_TITLE)

    def get_title_text(self) -> str:
        """Returns the page title text (e.g. 'Your Cart')."""
        return self.get_text(self.PAGE_TITLE)

    def get_cart_item_count(self) -> int:
        """Returns total number of items currently listed in the cart."""
        return len(self.find_elements(self.CART_ITEMS))

    def get_cart_item_names(self) -> List[str]:
        """Returns a list of all product names present in the cart."""
        elements = self.find_elements(self.ITEM_NAMES)
        return [elem.text.strip() for elem in elements]

    def get_cart_item_prices(self) -> List[float]:
        """Returns a list of all product prices present in the cart."""
        elements = self.find_elements(self.ITEM_PRICES)
        prices = []
        for elem in elements:
            raw = elem.text.replace("$", "").strip()
            if raw:
                prices.append(float(raw))
        return prices

    def remove_item_by_name(self, product_name: str) -> None:
        """Removes a specific product from inside the cart page."""
        slug = product_name.lower().replace(" ", "-")
        locator = (By.CSS_SELECTOR, f"button[data-test='remove-{slug}']")
        self.click(locator)

    def proceed_to_checkout(self) -> None:
        """Clicks the checkout button to proceed to customer info step."""
        self.click(self.CHECKOUT_BUTTON)
        self.wait_for_url_contains("checkout-step-one.html")

    def continue_shopping(self) -> None:
        """Clicks Continue Shopping button to return to products inventory."""
        self.click(self.CONTINUE_SHOPPING_BUTTON)
        self.wait_for_url_contains("inventory.html")
