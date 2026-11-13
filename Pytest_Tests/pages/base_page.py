"""
BasePage module implementing reusable Selenium actions with Explicit Waits.
All page objects inherit from this class to eliminate flaky fixed sleeps.
"""

from typing import List, Tuple
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    ElementClickInterceptedException,
)

from Pytest_Tests import config


class BasePage:
    """Base class for all Page Objects in the SauceDemo test suite."""

    def __init__(self, driver: WebDriver, timeout: int = config.DEFAULT_TIMEOUT):
        self.driver = driver
        self.timeout = timeout

    def navigate_to(self, url: str) -> None:
        """Navigates driver to the specified URL."""
        self.driver.get(url)

    def find_element(self, locator: Tuple[str, str], timeout: int = None) -> WebElement:
        """Waits explicitly until an element is visible, then returns it."""
        t = timeout if timeout is not None else self.timeout
        wait = WebDriverWait(self.driver, t)
        return wait.until(EC.visibility_of_element_located(locator))

    def find_present_element(self, locator: Tuple[str, str], timeout: int = None) -> WebElement:
        """Waits explicitly until an element exists in DOM, then returns it."""
        t = timeout if timeout is not None else self.timeout
        wait = WebDriverWait(self.driver, t)
        return wait.until(EC.presence_of_element_located(locator))

    def find_elements(self, locator: Tuple[str, str], timeout: int = None) -> List[WebElement]:
        """Waits explicitly for at least one element to be present, then returns all matching elements."""
        t = timeout if timeout is not None else self.timeout
        wait = WebDriverWait(self.driver, t)
        try:
            wait.until(EC.presence_of_element_located(locator))
            return self.driver.find_elements(*locator)
        except TimeoutException:
            return []

    def click(self, locator: Tuple[str, str], timeout: int = None) -> None:
        """Waits explicitly until element is present, scrolls it into view, and clicks it reliably."""
        t = timeout if timeout is not None else self.timeout
        wait = WebDriverWait(self.driver, t)
        element = wait.until(EC.presence_of_element_located(locator))
        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
        self.driver.execute_script("arguments[0].click();", element)

    def type_text(self, locator: Tuple[str, str], text: str, clear_first: bool = True, timeout: int = None) -> None:
        """Waits for element, optionally clears it, and types text with React virtual DOM fallback."""
        element = self.find_element(locator, timeout)
        if clear_first:
            element.clear()
        element.send_keys(text)
        # In React controlled forms under headless Chrome, ensure state triggers properly if value didn't take
        if text and element.get_attribute("value") != text:
            self.driver.execute_script("""
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                nativeInputValueSetter.call(arguments[0], arguments[1]);
                arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
                arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
            """, element, text)

    def get_text(self, locator: Tuple[str, str], timeout: int = None) -> str:
        """Waits for element to be visible and returns its inner text."""
        element = self.find_element(locator, timeout)
        return element.text.strip()

    def get_attribute(self, locator: Tuple[str, str], attribute: str, timeout: int = None) -> str:
        """Retrieves an attribute value from the located element."""
        element = self.find_present_element(locator, timeout)
        return element.get_attribute(attribute) or ""

    def is_displayed(self, locator: Tuple[str, str], timeout: int = None) -> bool:
        """Checks if an element is currently displayed within the given timeout."""
        t = timeout if timeout is not None else self.timeout
        try:
            wait = WebDriverWait(self.driver, t)
            return wait.until(EC.visibility_of_element_located(locator)).is_displayed()
        except (TimeoutException, NoSuchElementException):
            return False

    def wait_for_url_contains(self, fragment: str, timeout: int = None) -> bool:
        """Waits for the current URL to contain a specific substring."""
        t = timeout if timeout is not None else self.timeout
        wait = WebDriverWait(self.driver, t)
        try:
            return wait.until(EC.url_contains(fragment))
        except TimeoutException:
            return False

    def get_current_url(self) -> str:
        """Returns the current browser URL."""
        return self.driver.current_url

    def get_title(self) -> str:
        """Returns the current page title."""
        return self.driver.title

    def take_screenshot(self, filepath: str) -> str:
        """Saves a screenshot to the specified file path."""
        self.driver.save_screenshot(filepath)
        return filepath
