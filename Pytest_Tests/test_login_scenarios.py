"""
Test Suite: Authentication Edge Cases & Error Validation
Tests invalid credentials, empty fields, and locked-out user scenarios on SauceDemo.
"""

import pytest
from Pytest_Tests import config
from Pytest_Tests.pages.login_page import LoginPage


class TestLoginScenarios:
    """Test suite covering negative login scenarios and error message validations."""

    def test_invalid_username(self, driver):
        """
        Verify that submitting an unregistered/invalid username displays
        the appropriate authentication error message.
        """
        login_page = LoginPage(driver)
        login_page.login(config.INVALID_USER, config.PASSWORD)

        assert login_page.is_error_displayed(), "Expected error message to be displayed"
        error_text = login_page.get_error_message()
        assert "Username and password do not match" in error_text, (
            f"Expected 'Username and password do not match' error, but received: '{error_text}'"
        )

    def test_invalid_password(self, driver):
        """
        Verify that submitting an incorrect password for a valid username displays
        the appropriate authentication error message.
        """
        login_page = LoginPage(driver)
        login_page.login(config.STANDARD_USER, config.INVALID_PASSWORD)

        assert login_page.is_error_displayed(), "Expected error message to be displayed"
        error_text = login_page.get_error_message()
        assert "Username and password do not match" in error_text, (
            f"Expected 'Username and password do not match' error, but received: '{error_text}'"
        )

    def test_empty_username(self, driver):
        """
        Verify that leaving the username field empty displays
        'Epic sadface: Username is required'.
        """
        login_page = LoginPage(driver)
        login_page.login("", config.PASSWORD)

        assert login_page.is_error_displayed(), "Expected error message for empty username"
        error_text = login_page.get_error_message()
        assert "Username is required" in error_text, (
            f"Expected 'Username is required' error, but received: '{error_text}'"
        )

    def test_empty_password(self, driver):
        """
        Verify that leaving the password field empty displays
        'Epic sadface: Password is required'.
        """
        login_page = LoginPage(driver)
        login_page.login(config.STANDARD_USER, "")

        assert login_page.is_error_displayed(), "Expected error message for empty password"
        error_text = login_page.get_error_message()
        assert "Password is required" in error_text, (
            f"Expected 'Password is required' error, but received: '{error_text}'"
        )

    def test_locked_out_user(self, driver):
        """
        Verify that attempting to log in with a locked-out account displays
        'Epic sadface: Sorry, this user has been locked out.'
        """
        login_page = LoginPage(driver)
        login_page.login(config.LOCKED_USER, config.PASSWORD)

        assert login_page.is_error_displayed(), "Expected error message for locked out account"
        error_text = login_page.get_error_message()
        assert "Sorry, this user has been locked out" in error_text, (
            f"Expected locked out error, but received: '{error_text}'"
        )
