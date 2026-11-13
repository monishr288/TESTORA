"""
Pytest configuration and fixture module.
Includes:
1. Dynamic WebDriver initialization with headless and browser CLI options.
2. Automatic failure screenshot capture.
3. Custom JSON test report generator in Test_Reports/latest_results.json.
4. Clean test teardown.
"""

import os
import sys
import json
import time
from datetime import datetime
from pathlib import Path
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.edge.options import Options as EdgeOptions

# Add project root to sys.path
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from Pytest_Tests import config


def pytest_addoption(parser):
    """Adds custom command-line flags for Pytest."""
    parser.addoption(
        "--headless",
        action="store",
        default=str(config.HEADLESS).lower(),
        help="Run browser in headless mode: true or false (default: true)",
    )
    parser.addoption(
        "--browser",
        action="store",
        default=config.BROWSER,
        help="Browser to run tests with: chrome or edge (default: chrome)",
    )
    parser.addoption(
        "--custom-report-path",
        action="store",
        default="",
        help="Optional custom path to write test results JSON",
    )


@pytest.fixture(scope="session")
def is_headless(request) -> bool:
    """Fixture determining whether headless mode is active."""
    val = request.config.getoption("--headless")
    return val.lower() in ("true", "1", "yes")


@pytest.fixture(scope="session")
def browser_name(request) -> str:
    """Fixture determining target browser."""
    return request.config.getoption("--browser").lower()


@pytest.fixture
def driver(request, is_headless: bool, browser_name: str):
    """
    Selenium WebDriver fixture.
    Initializes browser, provides it to test function, and automatically captures
    a screenshot if the test fails before cleanly closing the browser.
    """
    web_driver = None

    if browser_name == "edge":
        options = EdgeOptions()
        if is_headless:
            options.add_argument("--headless=new")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        web_driver = webdriver.Edge(options=options)
    else:  # Chrome default
        options = ChromeOptions()
        if is_headless:
            options.add_argument("--headless=new")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--ignore-certificate-errors")
        web_driver = webdriver.Chrome(options=options)

    web_driver.implicitly_wait(2)

    yield web_driver

    # Failure screenshot capture during fixture teardown
    rep_call = getattr(request.node, "rep_call", None)
    rep_setup = getattr(request.node, "rep_setup", None)
    has_failed = (rep_call and rep_call.failed) or (rep_setup and rep_setup.failed)

    if has_failed:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        sanitized_name = request.node.name.replace("[", "_").replace("]", "_").replace(" ", "_")
        filename = f"failure_{sanitized_name}_{timestamp}.png"
        filepath = config.SCREENSHOTS_DIR / filename
        try:
            web_driver.save_screenshot(str(filepath))
            # Store screenshot path on node for report generation
            request.node.failure_screenshot = str(filepath)
            print(f"\n[Screenshot Captured] Saved failure screenshot to: {filepath}")
        except Exception as e:
            print(f"\n[Warning] Could not capture failure screenshot: {e}")

    try:
        web_driver.quit()
    except Exception:
        pass


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Hook to capture test outcome on test node for fixtures and reporters."""
    outcome = yield
    report = outcome.get_result()
    setattr(item, "rep_" + report.when, report)


# --- Custom Structured Test Reporter ---

def pytest_configure(config):
    """Initializes reporter container on pytest configuration."""
    config._qa_session_start_time = time.time()
    config._qa_test_records = []


def pytest_runtest_logreport(report):
    """Collects individual test outcomes when executed."""
    # We record calls, skipped setup, or failed setup/teardowns (errors)
    if report.when == "call":
        _record_report(report)
    elif report.when == "setup" and report.outcome == "skipped":
        _record_report(report)
    elif report.when in ("setup", "teardown") and report.failed:
        _record_report(report, is_error=True)


def _record_report(report, is_error: bool = False):
    """Helper to store structured test record."""
    pytest_config = pytest.Config
    # Use session container if available
    try:
        from _pytest.config import get_plugin_manager
    except ImportError:
        pass


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_protocol(item, nextitem):
    """Executes around each individual test protocol."""
    yield
    # Extract records after test completes
    rep_call = getattr(item, "rep_call", None)
    rep_setup = getattr(item, "rep_setup", None)
    rep_teardown = getattr(item, "rep_teardown", None)

    outcome = "passed"
    duration = 0.0
    error_message = None

    if rep_setup and rep_setup.failed:
        outcome = "error"
        duration = rep_setup.duration
        error_message = str(rep_setup.longrepr)
    elif rep_setup and rep_setup.skipped:
        outcome = "skipped"
        duration = rep_setup.duration
        error_message = str(rep_setup.longrepr) if rep_setup.longrepr else None
    elif rep_call:
        duration = rep_call.duration
        if rep_call.passed:
            outcome = "passed"
        elif rep_call.failed:
            outcome = "failed"
            error_message = str(rep_call.longrepr)
        elif rep_call.skipped:
            outcome = "skipped"
    elif rep_teardown and rep_teardown.failed:
        outcome = "error"
        duration = rep_teardown.duration
        error_message = str(rep_teardown.longrepr)

    screenshot_path = getattr(item, "failure_screenshot", None)

    # Clean test file path
    rel_path = ""
    try:
        rel_path = str(Path(item.fspath).relative_to(config.PROJECT_ROOT))
    except Exception:
        rel_path = Path(item.fspath).name

    record = {
        "id": item.nodeid,
        "name": item.name,
        "file": rel_path,
        "outcome": outcome,
        "duration": round(duration, 3),
        "error_message": error_message,
        "screenshot": screenshot_path,
    }

    if not hasattr(item.config, "_qa_test_records"):
        item.config._qa_test_records = []
    item.config._qa_test_records.append(record)


def pytest_sessionfinish(session, exitstatus):
    """
    Hook called after all tests complete.
    Aggregates test statistics and exports structured JSON reports.
    """
    records = getattr(session.config, "_qa_test_records", [])
    total_duration = round(time.time() - getattr(session.config, "_qa_session_start_time", time.time()), 3)

    passed_count = sum(1 for r in records if r["outcome"] == "passed")
    failed_count = sum(1 for r in records if r["outcome"] == "failed")
    skipped_count = sum(1 for r in records if r["outcome"] == "skipped")
    error_count = sum(1 for r in records if r["outcome"] == "error")
    total_count = len(records)

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    run_id = f"run_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    result_summary = {
        "run_id": run_id,
        "timestamp": timestamp,
        "exit_code": exitstatus,
        "status": "passed" if (failed_count == 0 and error_count == 0) else "failed",
        "duration_seconds": total_duration,
        "summary": {
            "total": total_count,
            "passed": passed_count,
            "failed": failed_count,
            "skipped": skipped_count,
            "errors": error_count,
        },
        "tests": records,
    }

    # Write latest_results.json
    latest_file = config.REPORTS_DIR / "latest_results.json"
    with open(latest_file, "w", encoding="utf-8") as f:
        json.dump(result_summary, f, indent=2)

    # Write timestamped history report file
    history_file = config.REPORTS_DIR / f"report_{run_id}.json"
    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(result_summary, f, indent=2)

    # Optional custom path requested via CLI
    custom_path = session.config.getoption("--custom-report-path")
    if custom_path:
        custom_file = Path(custom_path)
        custom_file.parent.mkdir(parents=True, exist_ok=True)
        with open(custom_file, "w", encoding="utf-8") as f:
            json.dump(result_summary, f, indent=2)
