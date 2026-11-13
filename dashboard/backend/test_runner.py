"""
Test Runner Module for TESTORA — Quality Engineering Platform.
Safely executes Pytest using Python subprocess, aggregates real test metrics,
and manages persistent execution history in JSON.
"""

import os
import sys
import json
import asyncio
import subprocess
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

# Base directories
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent.parent
TESTS_DIR = PROJECT_ROOT / "Pytest_Tests"
REPORTS_DIR = PROJECT_ROOT / "Test_Reports"
SCREENSHOTS_DIR = PROJECT_ROOT / "Screenshots"
HISTORY_FILE = BACKEND_DIR / "test_history.json"
CONFIG_FILE = BACKEND_DIR / "test_config.json"

DEFAULT_CONFIG = {
    "headless": True,
    "browser": "chrome",
    "timeout": 10,
    "base_url": "https://www.saucedemo.com/",
    "retries": 0,
    "verbose": True,
}

# Global lock to prevent overlapping test executions
_run_lock = asyncio.Lock()
_current_running_state = {
    "is_running": False,
    "started_at": None,
    "current_target": None,
}


def _ensure_history_file() -> None:
    """Initializes test_history.json if not present."""
    if not HISTORY_FILE.exists():
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)


def get_all_test_files() -> List[str]:
    """Discovers all test_*.py files in Pytest_Tests."""
    if not TESTS_DIR.exists():
        return []
    return sorted([f.name for f in TESTS_DIR.glob("test_*.py")])


def get_test_history(limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """Loads previous test execution history from test_history.json."""
    _ensure_history_file()
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                # Return in reverse chronological order (newest first)
                sorted_data = sorted(data, key=lambda x: x.get("timestamp", ""), reverse=True)
                if limit and limit > 0:
                    return sorted_data[:limit]
                return sorted_data
            return []
    except Exception as e:
        print(f"[Error] Failed to read test history: {e}")
        return []


def get_latest_test_result() -> Optional[Dict[str, Any]]:
    """Returns the most recent test run result."""
    history = get_test_history(limit=1)
    if history:
        return history[0]

    # Fallback to latest_results.json in Test_Reports if available
    latest_report_file = REPORTS_DIR / "latest_results.json"
    if latest_report_file.exists():
        try:
            with open(latest_report_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return None


def get_run_by_id(run_id: str) -> Optional[Dict[str, Any]]:
    """Fetches a specific historical run by its unique run_id."""
    history = get_test_history()
    for run in history:
        if run.get("run_id") == run_id:
            return run
    return None


def save_run_to_history(run_data: Dict[str, Any]) -> None:
    """Appends a new test run record to test_history.json."""
    _ensure_history_file()
    try:
        history = get_test_history()
        history.insert(0, run_data)  # newest first
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)
    except Exception as e:
        print(f"[Error] Failed to save test history: {e}")


def clear_test_history() -> bool:
    """Clears all records in test_history.json."""
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)
        return True
    except Exception as e:
        print(f"[Error] Failed to clear test history: {e}")
        return False


def delete_run_by_id(run_id: str) -> bool:
    """Deletes a specific test run record by run_id."""
    _ensure_history_file()
    try:
        history = get_test_history()
        filtered = [r for r in history if r.get("run_id") != run_id]
        if len(filtered) < len(history):
            with open(HISTORY_FILE, "w", encoding="utf-8") as f:
                json.dump(filtered, f, indent=2)
            return True
        return False
    except Exception as e:
        print(f"[Error] Failed to delete run {run_id}: {e}")
        return False


def delete_screenshot(filename: str) -> bool:
    """Deletes a failure screenshot by filename."""
    if not SCREENSHOTS_DIR.exists():
        return False
    # Prevent directory traversal
    safe_name = Path(filename).name
    target = SCREENSHOTS_DIR / safe_name
    if target.exists() and target.is_file():
        try:
            target.unlink()
            return True
        except Exception as e:
            print(f"[Error] Failed to delete screenshot {filename}: {e}")
            return False
    return False


def get_config() -> Dict[str, Any]:
    """Retrieves current test runner runtime configuration."""
    if not CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(DEFAULT_CONFIG, f, indent=2)
            return DEFAULT_CONFIG.copy()
        except Exception:
            return DEFAULT_CONFIG.copy()
    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            saved = json.load(f)
            merged = DEFAULT_CONFIG.copy()
            merged.update(saved)
            return merged
    except Exception:
        return DEFAULT_CONFIG.copy()


def update_config(updates: Dict[str, Any]) -> Dict[str, Any]:
    """Updates runtime configuration settings and persists them."""
    current = get_config()
    allowed_keys = {"headless", "browser", "timeout", "base_url", "retries", "verbose"}
    for k, v in updates.items():
        if k in allowed_keys and v is not None:
            current[k] = v
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(current, f, indent=2)
    except Exception as e:
        print(f"[Error] Failed to write config: {e}")
    return current


def is_execution_running() -> bool:
    """Returns True if a test suite is currently running."""
    return _current_running_state["is_running"]


def get_execution_state() -> Dict[str, Any]:
    """Returns the current execution state."""
    return _current_running_state.copy()


def _execute_pytest_subprocess(
    test_file: Optional[str] = None,
    headless: bool = True,
    browser: str = "chrome",
) -> Dict[str, Any]:
    """
    Synchronous subprocess execution function (run in thread pool).
    Safely executes pytest with validated parameters.
    """
    # Determine target test path
    if test_file and test_file.strip() and test_file.strip().lower() not in ("all", "all tests", "*"):
        # Validate that the file is safe (prevent path traversal)
        safe_filename = Path(test_file).name
        target_path = str(TESTS_DIR / safe_filename)
        if not Path(target_path).exists():
            raise FileNotFoundError(f"Requested test file '{safe_filename}' does not exist in Pytest_Tests")
    else:
        target_path = str(TESTS_DIR)

    # Ensure runtime directories exist
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

    html_report_path = REPORTS_DIR / "report.html"

    # Prepare command arguments
    cmd = [
        sys.executable,
        "-m",
        "pytest",
        target_path,
        "-v",
        f"--headless={'true' if headless else 'false'}",
        f"--browser={browser.lower()}",
        f"--html={str(html_report_path)}",
        "--self-contained-html",
    ]

    start_time = time.time()
    run_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    run_id = f"run_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    print(f"\n[Subprocess] Executing: {' '.join(cmd)} (cwd={PROJECT_ROOT})")

    # Run pytest subprocess safely
    proc = subprocess.run(
        cmd,
        cwd=str(PROJECT_ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    elapsed_duration = round(time.time() - start_time, 3)

    # Archive timestamped copy of the HTML report
    archived_html_path = REPORTS_DIR / f"report_{run_id}.html"
    if html_report_path.exists():
        try:
            import shutil
            shutil.copy2(str(html_report_path), str(archived_html_path))
        except Exception as e:
            print(f"[Warning] Failed to archive HTML report: {e}")

    # Read structured JSON generated by conftest.py
    latest_report_file = REPORTS_DIR / "latest_results.json"
    result_data = None

    if latest_report_file.exists():
        try:
            with open(latest_report_file, "r", encoding="utf-8") as f:
                result_data = json.load(f)
        except Exception as e:
            print(f"[Warning] Failed to parse generated report file: {e}")

    # Fallback / safety in case pytest crashed or had collection errors
    if not result_data:
        # Exit codes: 0 = all passed, 1 = some failed, 2 = interrupted, 3 = internal error, 4 = usage error, 5 = no tests collected
        is_passed = proc.returncode == 0
        result_data = {
            "run_id": run_id,
            "timestamp": run_timestamp,
            "exit_code": proc.returncode,
            "status": "passed" if is_passed else "failed",
            "duration_seconds": elapsed_duration,
            "summary": {
                "total": 0,
                "passed": 0,
                "failed": 1 if proc.returncode != 0 else 0,
                "skipped": 0,
                "errors": 1 if proc.returncode in (2, 3, 4) else 0,
            },
            "tests": [],
        }

    # Enrich run data with execution metadata
    result_data["run_id"] = run_id
    result_data["timestamp"] = run_timestamp
    result_data["duration_seconds"] = elapsed_duration
    result_data["target"] = "All Suites (18 Tests)" if Path(target_path) == TESTS_DIR else Path(target_path).name
    result_data["headless"] = headless
    result_data["browser"] = browser
    result_data["html_report"] = "/reports/report.html" if html_report_path.exists() else None
    result_data["archived_html_report"] = f"/reports/report_{run_id}.html" if archived_html_path.exists() else None
    result_data["stdout_summary"] = proc.stdout[-1500:] if proc.stdout else ""
    if proc.stderr:
        result_data["stderr_summary"] = proc.stderr[-1000:]

    # Persist into test_history.json
    save_run_to_history(result_data)

    return result_data


async def run_tests_async(
    test_file: Optional[str] = None,
    headless: bool = True,
    browser: str = "chrome",
) -> Dict[str, Any]:
    """
    Asynchronous wrapper around pytest execution with concurrency lock.
    Guarantees only one test run executes at a time.
    """
    if _run_lock.locked():
        raise RuntimeError("Another test execution is already in progress.")

    async with _run_lock:
        _current_running_state["is_running"] = True
        _current_running_state["started_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        _current_running_state["current_target"] = test_file or "all"

        try:
            # Run blocking subprocess in standard asyncio thread pool
            result = await asyncio.to_thread(
                _execute_pytest_subprocess,
                test_file=test_file,
                headless=headless,
                browser=browser,
            )
            return result
        finally:
            _current_running_state["is_running"] = False
            _current_running_state["started_at"] = None
            _current_running_state["current_target"] = None
