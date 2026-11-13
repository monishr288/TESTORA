"""
Configuration module for TESTORA — SauceDemo Selenium & Pytest Test Automation Suite.
Loads settings from environment variables or falls back to standard defaults.
Credentials and environment-specific settings are separated from test logic.
"""

import os
from pathlib import Path

# Try loading .env file if python-dotenv is available
try:
    from dotenv import load_dotenv
    # Look for .env in current dir or parent project dir
    env_file = Path(__file__).resolve().parent.parent / ".env"
    if env_file.exists():
        load_dotenv(env_file)
except ImportError:
    pass

# Base Application Settings
BASE_URL = os.getenv("SAUCEDEMO_URL", "https://www.saucedemo.com/")

# Test User Accounts (provided by SauceDemo for QA practice)
STANDARD_USER = os.getenv("SAUCEDEMO_STANDARD_USER", "standard_user")
LOCKED_USER = os.getenv("SAUCEDEMO_LOCKED_USER", "locked_out_user")
PROBLEM_USER = os.getenv("SAUCEDEMO_PROBLEM_USER", "problem_user")
PERF_USER = os.getenv("SAUCEDEMO_PERF_USER", "performance_glitch_user")
PASSWORD = os.getenv("SAUCEDEMO_PASSWORD", "secret_sauce")

# Invalid Test Data
INVALID_USER = "invalid_qa_user"
INVALID_PASSWORD = "wrong_password_123"

# Automation Execution Settings
DEFAULT_TIMEOUT = int(os.getenv("TEST_TIMEOUT", "10"))
HEADLESS = os.getenv("HEADLESS", "true").lower() in ("true", "1", "yes")
BROWSER = os.getenv("BROWSER", "chrome").lower()

# Directory Paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
TESTS_DIR = PROJECT_ROOT / "Pytest_Tests"
SCREENSHOTS_DIR = PROJECT_ROOT / "Screenshots"
REPORTS_DIR = PROJECT_ROOT / "Test_Reports"
BUG_REPORTS_DIR = PROJECT_ROOT / "Bug_Reports"

# Ensure runtime directories exist
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
BUG_REPORTS_DIR.mkdir(parents=True, exist_ok=True)
