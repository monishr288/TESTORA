"""
FastAPI Backend for TESTORA — Quality Engineering Platform.
Provides RESTful APIs for triggering Pytest test runs, streaming execution status,
and querying real historical test results and failure screenshots.
"""

import sys
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Ensure local imports work cleanly
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import test_runner

# Initialize FastAPI App
app = FastAPI(
    title="TESTORA Quality Engineering Platform API",
    description="TESTORA E-Commerce Quality Engineering Platform Backend powering automated Pytest & Selenium runs on SauceDemo.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for React development servers (Vite: 5173, CRA: 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Screenshots directory for direct visual inspection via browser
screenshots_path = PROJECT_ROOT / "Screenshots"
screenshots_path.mkdir(parents=True, exist_ok=True)
app.mount("/screenshots", StaticFiles(directory=str(screenshots_path)), name="screenshots")

# Mount Test_Reports directory for direct HTML/JSON report inspection via browser
reports_path = PROJECT_ROOT / "Test_Reports"
reports_path.mkdir(parents=True, exist_ok=True)
app.mount("/reports", StaticFiles(directory=str(reports_path)), name="reports")


# --- Request and Response Models ---

class RunTestsRequest(BaseModel):
    """Payload for triggering test executions."""
    test_file: Optional[str] = Field(
        None,
        description="Optional specific test file name to execute (e.g. 'test_login.py'). If omitted, runs entire test suite.",
        examples=["test_login.py", "test_cart.py"],
    )
    headless: bool = Field(
        True,
        description="Whether to run browser in headless mode (recommended for CI/CD and automated runners).",
    )
    browser: str = Field(
        "chrome",
        description="Browser engine to automate (e.g. 'chrome' or 'edge').",
    )


class UpdateConfigRequest(BaseModel):
    """Payload for updating test runner runtime configuration via PUT."""
    headless: Optional[bool] = Field(None, description="Run browser in headless mode")
    browser: Optional[str] = Field(None, description="Automated browser engine (chrome, edge)")
    timeout: Optional[int] = Field(None, ge=1, le=60, description="Explicit wait timeout in seconds")
    base_url: Optional[str] = Field(None, description="Target application base URL")
    retries: Optional[int] = Field(None, ge=0, le=5, description="Test retry count on failure")
    verbose: Optional[bool] = Field(None, description="Verbose Pytest output")


class ApiResponse(BaseModel):
    """Standardized API response wrapper."""
    success: bool
    message: str
    data: Optional[Any] = None


# --- Endpoints ---

@app.get("/", tags=["Health"])
async def root():
    """Root health check endpoint returning backend service status."""
    return {
        "message": "TESTORA Backend API is running",
        "status": "healthy",
        "version": "1.0.0",
        "docs_url": "/docs",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }


@app.get("/api/status", tags=["System Status"])
async def get_system_status():
    """
    Returns the real-time operational status of the testing backend,
    including active execution state, available test suites, and total runs recorded.
    """
    exec_state = test_runner.get_execution_state()
    available_files = test_runner.get_all_test_files()
    history = test_runner.get_test_history()

    return {
        "status": "busy" if exec_state["is_running"] else "ready",
        "is_test_running": exec_state["is_running"],
        "active_execution": exec_state if exec_state["is_running"] else None,
        "available_test_suites": available_files,
        "total_history_runs": len(history),
        "target_application": {
            "name": "SauceDemo E-Commerce",
            "url": "https://www.saucedemo.com/",
        },
        "environment": {
            "python_version": sys.version.split()[0],
            "platform": sys.platform,
        },
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }


@app.get("/api/history", tags=["Test History"])
async def get_history(limit: Optional[int] = Query(None, description="Max number of past runs to retrieve")):
    """
    Retrieves previous test execution history records stored in JSON.
    Chronologically sorted (newest runs first).
    """
    history = test_runner.get_test_history(limit=limit)
    return {
        "success": True,
        "count": len(history),
        "history": history,
    }


@app.get("/api/history/{run_id}", tags=["Test History"])
async def get_history_by_id(run_id: str):
    """Retrieves a single historical test run by its unique run_id."""
    run = test_runner.get_run_by_id(run_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test run with ID '{run_id}' not found.",
        )
    return {
        "success": True,
        "run": run,
    }


@app.delete("/api/history", tags=["Test History"])
async def clear_history():
    """Clears all historical test execution records."""
    success = test_runner.clear_test_history()
    return {
        "success": success,
        "message": "Test history cleared successfully" if success else "Failed to clear history",
    }


@app.delete("/api/history/{run_id}", tags=["Test History"])
async def delete_history_run(run_id: str):
    """Deletes a specific test run record by its unique run_id."""
    deleted = test_runner.delete_run_by_id(run_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test run with ID '{run_id}' not found.",
        )
    return {
        "success": True,
        "message": f"Test run '{run_id}' deleted successfully",
    }


@app.get("/api/config", tags=["Configuration"])
async def get_test_configuration():
    """Retrieves current test execution configuration settings."""
    cfg = test_runner.get_config()
    return {
        "success": True,
        "config": cfg,
    }


@app.put("/api/config", tags=["Configuration"])
async def update_test_configuration(request: UpdateConfigRequest):
    """
    Updates runtime test execution parameters via HTTP PUT.
    Merges updated values into persistent test configuration.
    """
    updates = request.model_dump(exclude_unset=True)
    updated_cfg = test_runner.update_config(updates)
    return {
        "success": True,
        "message": "Configuration updated successfully",
        "config": updated_cfg,
    }


@app.post("/api/run-tests", tags=["Test Execution"])
async def execute_test_suite(request: RunTestsRequest = RunTestsRequest()):
    """
    Executes actual Pytest tests via Python subprocess safely.
    Captures genuine test metrics (total, passed, failed, skipped, duration)
    and stores execution results into test_history.json.
    """
    if test_runner.is_execution_running():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A test execution is already in progress. Please wait for it to finish.",
        )

    try:
        # Run tests asynchronously with concurrency locking
        run_result = await test_runner.run_tests_async(
            test_file=request.test_file,
            headless=request.headless,
            browser=request.browser,
        )

        return {
            "success": True,
            "message": "Test execution finished",
            "run": run_result,
        }
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing test suite: {str(e)}",
        )


@app.get("/api/results/latest", tags=["Test Results"])
async def get_latest_result():
    """
    Retrieves the most recent test execution result.
    Never returns fake data; returns null if no executions exist yet.
    """
    latest = test_runner.get_latest_test_result()
    if not latest:
        return {
            "success": True,
            "message": "No test runs executed yet.",
            "latest": None,
        }
    return {
        "success": True,
        "latest": latest,
    }


@app.get("/api/test-files", tags=["Test Suites"])
async def list_test_files():
    """Lists all available test files under Pytest_Tests."""
    files = test_runner.get_all_test_files()
    return {
        "success": True,
        "count": len(files),
        "files": files,
    }


@app.get("/api/screenshots", tags=["Screenshots"])
async def list_screenshots():
    """Lists all captured failure screenshots."""
    screenshots_dir = PROJECT_ROOT / "Screenshots"
    if not screenshots_dir.exists():
        return {"success": True, "count": 0, "screenshots": []}

    files = []
    for f in sorted(screenshots_dir.glob("*.png"), key=lambda p: p.stat().st_mtime, reverse=True):
        files.append({
            "filename": f.name,
            "size_bytes": f.stat().st_size,
            "url": f"/screenshots/{f.name}",
            "created_at": datetime.fromtimestamp(f.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
        })

    return {
        "success": True,
        "count": len(files),
        "screenshots": files,
    }


@app.delete("/api/screenshots/{filename}", tags=["Screenshots"])
async def delete_screenshot(filename: str):
    """Deletes a captured failure screenshot file."""
    deleted = test_runner.delete_screenshot(filename)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Screenshot '{filename}' not found or could not be removed.",
        )
    return {
        "success": True,
        "message": f"Screenshot '{filename}' deleted successfully",
    }


@app.get("/api/reports", tags=["Reports"])
async def list_reports():
    """Lists all available generated test reports (HTML and JSON) on disk."""
    reports_dir = PROJECT_ROOT / "Test_Reports"
    if not reports_dir.exists():
        return {"success": True, "count": 0, "reports": []}

    files = []
    for f in sorted(reports_dir.glob("*.*"), key=lambda p: p.stat().st_mtime, reverse=True):
        if f.suffix in (".html", ".json"):
            files.append({
                "filename": f.name,
                "type": "html" if f.suffix == ".html" else "json",
                "size_bytes": f.stat().st_size,
                "url": f"/reports/{f.name}",
                "created_at": datetime.fromtimestamp(f.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
            })

    return {
        "success": True,
        "count": len(files),
        "reports": files,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
