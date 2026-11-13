"""
LoginPage Page Object for SauceDemo authentication.
Encapsulates login inputs, buttons, and error message validation.
"""

from typing import Tuple
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from Pytest_Tests.pages.base_page import BasePage
from Pytest_Tests import config


class LoginPage(BasePage):
    """Encapsulates SauceDemo login page elements and user interactions."""

    # Locators
    USERNAME_INPUT: Tuple[str, str] = (By.ID, "user-name")
    PASSWORD_INPUT: Tuple[str, str] = (By.ID, "password")
    LOGIN_BUTTON: Tuple[str, str] = (By.ID, "login-button")
    ERROR_CONTAINER: Tuple[str, str] = (By.CSS_SELECTOR, "h3[data-test='error']")
    BURGER_MENU_BUTTON: Tuple[str, str] = (By.ID, "react-burger-menu-btn")
    LOGOUT_LINK: Tuple[str, str] = (By.ID, "logout_sidebar_link")

    def __init__(self, driver: WebDriver):
        super().__init__(driver)

    def open(self) -> "LoginPage":
        """Navigates directly to the SauceDemo base URL."""
        self.navigate_to(config.BASE_URL)
        return self

    def enter_username(self, username: str) -> "LoginPage":
        """Types username into the username input field."""
        self.type_text(self.USERNAME_INPUT, username)
        return self

    def enter_password(self, password: str) -> "LoginPage":
        """Types password into the password input field."""
        self.type_text(self.PASSWORD_INPUT, password)
        return self

    def click_login(self) -> None:
        """Clicks the login submit button."""
        self.click(self.LOGIN_BUTTON)

    def login(self, username: str, password: str) -> None:
        """Convenience method to execute a complete login flow."""
        self.open()
        if username:
            self.enter_username(username)
        if password:
            self.enter_password(password)
        self.click_login()

    def get_error_message(self) -> str:
        """Fetches the error message text if visible."""
        return self.get_text(self.ERROR_CONTAINER)

    def is_error_displayed(self) -> bool:
        """Returns True if the login error banner is displayed."""
        return self.is_displayed(self.ERROR_CONTAINER)

    def is_on_login_page(self, timeout: int = 5) -> bool:
        """Validates if user is currently on the login page."""
        return self.is_displayed(self.LOGIN_BUTTON, timeout=timeout)

    def logout(self) -> None:
        """Performs logout via sidebar menu and waits for login page redirect."""
        self.click(self.BURGER_MENU_BUTTON)
        self.click(self.LOGOUT_LINK)
        self.is_on_login_page(timeout=5)
