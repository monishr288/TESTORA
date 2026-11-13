"""
CheckoutPage Page Object for SauceDemo checkout flow.
Encapsulates Step One (customer details), Step Two (order overview),
and Step Three (order confirmation and completion).
"""

from typing import Tuple
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from Pytest_Tests.pages.base_page import BasePage


class CheckoutPage(BasePage):
    """Encapsulates SauceDemo multi-step checkout workflow and validations."""

    # Step One Locators
    TITLE: Tuple[str, str] = (By.CLASS_NAME, "title")
    FIRST_NAME_INPUT: Tuple[str, str] = (By.ID, "first-name")
    LAST_NAME_INPUT: Tuple[str, str] = (By.ID, "last-name")
    POSTAL_CODE_INPUT: Tuple[str, str] = (By.ID, "postal-code")
    CONTINUE_BUTTON: Tuple[str, str] = (By.ID, "continue")
    CANCEL_BUTTON: Tuple[str, str] = (By.ID, "cancel")
    ERROR_CONTAINER: Tuple[str, str] = (By.CSS_SELECTOR, "h3[data-test='error']")

    # Step Two Locators
    SUBTOTAL_LABEL: Tuple[str, str] = (By.CLASS_NAME, "summary_subtotal_label")
    TAX_LABEL: Tuple[str, str] = (By.CLASS_NAME, "summary_tax_label")
    TOTAL_LABEL: Tuple[str, str] = (By.CLASS_NAME, "summary_total_label")
    FINISH_BUTTON: Tuple[str, str] = (By.ID, "finish")

    # Order Complete Locators
    COMPLETE_HEADER: Tuple[str, str] = (By.CLASS_NAME, "complete-header")
    COMPLETE_TEXT: Tuple[str, str] = (By.CLASS_NAME, "complete-text")
    BACK_HOME_BUTTON: Tuple[str, str] = (By.ID, "back-to-products")

    def __init__(self, driver: WebDriver):
        super().__init__(driver)

    def is_step_one_loaded(self) -> bool:
        """Verifies if Step 1 (customer information form) is loaded."""
        return self.wait_for_url_contains("checkout-step-one.html") and self.is_displayed(self.FIRST_NAME_INPUT)

    def enter_customer_info(self, first_name: str = "", last_name: str = "", postal_code: str = "") -> "CheckoutPage":
        """Fills out the customer information inputs."""
        if first_name:
            self.type_text(self.FIRST_NAME_INPUT, first_name)
        if last_name:
            self.type_text(self.LAST_NAME_INPUT, last_name)
        if postal_code:
            self.type_text(self.POSTAL_CODE_INPUT, postal_code)
        return self

    def click_continue(self) -> None:
        """Clicks Continue to submit customer info."""
        self.click(self.CONTINUE_BUTTON)

    def get_error_message(self) -> str:
        """Returns the validation error message shown on the checkout form."""
        return self.get_text(self.ERROR_CONTAINER)

    def is_error_displayed(self) -> bool:
        """Checks if form validation error is visible."""
        return self.is_displayed(self.ERROR_CONTAINER)

    def is_step_two_loaded(self, timeout: int = 5) -> bool:
        """Verifies if Step 2 (order overview) is loaded."""
        return self.wait_for_url_contains("checkout-step-two.html", timeout=timeout) and self.is_displayed(self.FINISH_BUTTON, timeout=timeout)

    def get_subtotal_text(self) -> str:
        """Returns the item subtotal string."""
        return self.get_text(self.SUBTOTAL_LABEL)

    def get_total_text(self) -> str:
        """Returns the total price string."""
        return self.get_text(self.TOTAL_LABEL)

    def click_finish(self) -> None:
        """Clicks Finish to place the order."""
        self.click(self.FINISH_BUTTON)
        self.wait_for_url_contains("checkout-complete.html")

    def is_order_complete(self, timeout: int = 5) -> bool:
        """Verifies if checkout completion page is loaded."""
        return self.wait_for_url_contains("checkout-complete.html", timeout=timeout) and self.is_displayed(self.COMPLETE_HEADER, timeout=timeout)

    def get_completion_header(self) -> str:
        """Returns the order success header text (e.g. 'Thank you for your order!')."""
        return self.get_text(self.COMPLETE_HEADER)
