# TESTORA — Quality Engineering Platform
> **Test Smarter. Deliver Better.**

[![Python Version](https://img.shields.io/badge/Python-3.14%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg)](https://vitejs.dev/)
[![Pytest](https://img.shields.io/badge/Pytest-8.0%2B-0A9EDC.svg)](https://docs.pytest.org/)
[![Selenium WebDriver](https://img.shields.io/badge/Selenium-4.20%2B-43B02A.svg)](https://www.selenium.dev/)
[![Application Under Test](https://img.shields.io/badge/Target-SauceDemo.com-orange.svg)](https://www.saucedemo.com/)

**TESTORA** is a modern, enterprise-grade **Quality Engineering Platform** built with **Python**, **Pytest**, **Selenium WebDriver**, **FastAPI**, and a **React 18 (Vite) Glassmorphism Dashboard**. Designed as an SDET / QA Automation Engineer technical portfolio project, it provides end-to-end quality telemetry across **Manual Testing**, **Automation Testing**, **API Testing**, **Bug Reports**, and **Execution Reports**.

---

## 🎯 Project Overview & Portfolio Highlights

- **Target Web Application:** [SauceDemo E-Commerce](https://www.saucedemo.com/)
- **UI Architecture:** Premium glassmorphism design with dark navy palette, frosted glass panels, cyan/blue/purple accents, and responsive layout.
- **Page Object Model (POM):** Clean separation of locators and browser interactions across Authentication, Catalog, Cart, and Checkout.
- **Reliable Automation:** Standardized **Explicit Waits** (`WebDriverWait` + `expected_conditions`) eliminating flaky fixed `time.sleep()` calls.
- **Subprocess Test Runner:** FastAPI triggers native Pytest processes safely using non-blocking asynchronous execution with concurrency locks.
- **Real Test Telemetry:** Captures authentic metrics (total, passed, failed, skipped, duration, failure traces) with zero mock/fake data.
- **Automatic Failure Screenshots:** Pytest teardown hooks detect failures and immediately capture high-resolution browser screenshots into `Screenshots/`.
- **Interactive API Testing Console:** Send live HTTP requests directly from the dashboard to verify backend REST endpoints in real-time.
- **Defect Tracking & Manual Repositories:** Full manual test cases repository with state persistence and professional QA bug reports.

---

## 📁 Project Directory Structure

```text
Ecommerce-Testing-Project/
├── .env                              # Active environment variables (credentials & settings)
├── .env.example                      # Template for environment configuration
├── .gitignore                        # Git exclusion rules
├── requirements.txt                  # Python dependencies
├── README.md                         # Project documentation
│
├── dashboard/                        # Stage 2 React (Vite) Frontend Application
│   ├── index.html                    # Root HTML document
│   ├── package.json                  # Frontend dependencies & scripts
│   ├── vite.config.js                # Vite build config & backend proxy
│   ├── src/
│   │   ├── main.jsx                  # React application entry point
│   │   ├── App.jsx                   # Navigation state, layout & page routing
│   │   ├── index.css                 # Premium glassmorphism CSS theme & variables
│   │   ├── context/
│   │   │   └── TestContext.jsx       # Global state (live polling, runner, notifications)
│   │   ├── services/
│   │   │   └── api.js                # API client communicating with FastAPI backend
│   │   ├── data/
│   │   │   ├── manualTests.js        # Manual test cases database
│   │   │   ├── bugReports.js         # QA defect tracking database
│   │   │   └── apiEndpoints.js       # Live API specs & contract schemas
│   │   ├── components/
│   │   │   ├── Sidebar.jsx           # Glassmorphism navigation sidebar
│   │   │   ├── TopNav.jsx            # Topbar with live status pill, search & profile
│   │   │   ├── MetricCard.jsx        # Animated glass KPI card with progress bars
│   │   │   ├── StatusBadge.jsx       # Glowing status badge (Pass, Fail, Running, etc.)
│   │   │   └── Modal.jsx             # Accessible glass modal dialog
│   │   └── pages/
│   │       ├── OverviewPage.jsx      # Telemetry summary, Recharts graphs & quick runner
│   │       ├── ManualTestingPage.jsx # Filterable table, test details & status updater
│   │       ├── AutomationTestingPage.jsx # Pytest suite runner & breakdown table
│   │       ├── ApiTestingPage.jsx    # Interactive live API console & contract specs
│   │       ├── BugReportsPage.jsx    # Bug tracker table, severity filters & defect logger
│   │       ├── TestReportsPage.jsx   # Execution history table & screenshot gallery
│   │       └── SettingsPage.jsx      # Backend host URL, headless toggle & history purge
│   │
│   └── backend/                      # Stage 1 FastAPI Backend Server
│       ├── main.py                   # REST API routes & CORS configuration
│       ├── test_runner.py            # Subprocess test executor & JSON history manager
│       ├── test_history.json         # Persistent test execution records
│       └── requirements.txt          # Python package requirements
│
├── Pytest_Tests/
│   ├── config.py                     # Centralized URLs, timeouts, accounts, and directory paths
│   ├── conftest.py                   # WebDriver fixtures, CLI flags, screenshot hooks & JSON reporter
│   ├── pages/                        # Page Object Model (POM) implementations
│   │   ├── __init__.py               # Package export definitions
│   │   ├── base_page.py              # Reusable Selenium explicit wait methods
│   │   ├── login_page.py             # Login & Logout locators and actions
│   │   ├── products_page.py          # Inventory catalog, sorting & cart badge actions
│   │   ├── cart_page.py              # Cart inspection & item removal
│   │   └── checkout_page.py          # Multi-step checkout form & order completion
│   ├── test_login.py                 # Valid login & session logout test suite
│   ├── test_login_scenarios.py       # Invalid credentials, empty fields & locked user tests
│   ├── test_products.py              # Catalog verification & price/alphabetical sorting tests
│   ├── test_cart.py                  # Single/multiple item addition & badge counter tests
│   └── test_checkout.py              # Form validation & End-to-End order fulfillment tests
│
├── Bug_Reports/
│   └── sample_bug_report.md          # Real-world QA bug ticket (problem_user inventory & checkout issue)
├── Test_Reports/                     # Generated latest_results.json & timestamped execution reports
└── Screenshots/                      # Auto-captured PNG screenshots on test failures
```

---

## ⚡ Quick Start (PowerShell Commands)

### 1. Start the FastAPI Backend Server
In the first PowerShell terminal:

```powershell
# Navigate to backend directory
cd "c:\Users\LENOVO\Downloads\MONISH\projects\testing\Ecommerce-Testing-Project\dashboard\backend"

# Start the FastAPI server with live reloading
python -m uvicorn main:app --reload --port 8000
```
- Backend API: **`http://127.0.0.1:8000`**
- Interactive Swagger UI: **`http://127.0.0.1:8000/docs`**

---

### 2. Install Dependencies & Start the React Frontend
In a second PowerShell terminal:

```powershell
# Navigate to dashboard directory
cd "c:\Users\LENOVO\Downloads\MONISH\projects\testing\Ecommerce-Testing-Project\dashboard"

# Install frontend dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
- Open browser at: **`http://localhost:5173`**

---

### 3. Build the Frontend for Production
```powershell
cd "c:\Users\LENOVO\Downloads\MONISH\projects\testing\Ecommerce-Testing-Project\dashboard"
npm run build
```
- Compiles production-ready bundle to `dashboard/dist/`.

---

## 🖥️ Frontend Pages & Functionality

### 1. Overview (`OverviewPage.jsx`)
- **Combined Telemetry & Source Attribution:** Consolidates live automated results from the FastAPI Pytest runner with persistent manual QA records while guaranteeing **zero double-counting**.
- **Accurate Scope Calculation:** Combined Active Tests = Latest Automated Suite (18) + Manually Executed Tests (8). Unexecuted manual tests (4 Not Run in catalog) are clearly isolated.
- **KPI Metrics Cards:** Active Tests Executed, Passed Tests, Failed Tests, Skipped/Blocked, Pytest Subprocess Errors, and Latest Automation Duration with source pills.
- **Testing Scope Breakdown Matrix:** Side-by-side audit table separating Automated, Manual, and Defect metrics.
- **Interactive Outcomes Telemetry:** Multi-series visualization with tabs to inspect `Combined`, `Automated Only`, and `Manual Only` outcomes.
- **Execution Trend Chart:** Recharts Area chart displaying historical test duration in seconds across consecutive runs from `test_history.json`.

### 2. Manual Testing (`ManualTestingPage.jsx`)
- Full repository of manual test cases across Authentication, Catalog, Cart, Checkout, Performance, and Security.
- **Execution Statuses:** `Not Run`, `Passed`, `Failed`, and `Blocked`.
- **Manual Execution Tracking:** Distinguishes manually executed tests (`isExecutedManually = true`) from pending catalog items (`Not Run`), ensuring execution pass rates strictly reflect executed tests.
- Filters by **Module**, **Priority** (Critical, High, Medium, Low), and **Status** (Passed, Failed, Blocked, Not Run).
- Global search by scenario or Test ID.
- Click any row to open the **Detail View Modal** showing preconditions, test steps, expected vs. actual results, and live status changer.
- Instant persistence in `localStorage` (`qa_manual_tests`) synchronizing directly with the Overview dashboard.

### 3. Automation Testing (`AutomationTestingPage.jsx`)
- Suite cards for each test file with test counts and descriptions.
- Individual **"Run File"** triggers or global **"Execute Selected Suite"**.
- Headless mode toggle (checkbox) and browser selector (Chrome / Edge).
- Live execution progress indicator with elapsed seconds counter.
- **Live Pytest Execution Breakdown:** Displays actual `total`, `passed`, `failed`, `skipped`, `errors`, and `duration` from the FastAPI backend.
- **Terminal Log Viewer:** Modal displaying raw Pytest console output.
- **Failure Screenshot Evidence:** View captured screenshots directly inside the dashboard.

### 4. API Testing (`ApiTestingPage.jsx`)
- Full REST verb support: **GET**, **POST**, **PUT**, and **DELETE** endpoints with color-coded method badges:
  - `GET` (Green): Health checks, system status, test suites, test history, screenshots, configuration.
  - `POST` (Indigo): Pytest test execution trigger and mock authentication session generator.
  - `PUT` (Amber): Dynamic runtime configuration updater (`PUT /api/config`) and sample cart updates.
  - `DELETE` (Rose): Test history purger (`DELETE /api/history`), single run remover (`DELETE /api/history/{run_id}`), screenshot remover (`DELETE /api/screenshots/{filename}`), and sample cart item deletion.
- **Method Filter Tabs:** Quick filter buttons (`ALL`, `GET`, `POST`, `PUT`, `DELETE`) and `Live Only` toggle.
- **Interactive REST Runner:** Edit JSON request body for `POST`/`PUT`, fill path parameters (`{run_id}`, `{filename}`), and execute via `Send Request`.
- Clearly distinguishes **LIVE** backend endpoints from **SAMPLE / Contract** documentation.
- **Live Response Inspector:** Displays HTTP status code, millisecond latency, response headers, and formatted JSON output.
- **"Verify Live GET Endpoints" Action:** Automated batch verification across all live read endpoints.

### 5. Bug Reports (`BugReportsPage.jsx`)
- Defect tracking table with columns: Bug ID, Title, Classification, Severity, Priority, Status, Module.
- **Defect Classification:** Explicitly distinguishes **`Confirmed Live Bug`** (verified reproducible on live SauceDemo) from **`Sample Demo Defect`** (documented for portfolio specification).
- Filters by **Classification** (Confirmed Only, Sample Only), **Severity**, **Status**, and **Module**.
- Detail inspection modal displaying steps to reproduce, expected vs actual results, environment, and developer fix suggestions.
- Interactive status update dropdown and "Log New Defect" modal form with classification toggle.

### 6. Test Reports (`TestReportsPage.jsx`)
- Audit log of historical test runs loaded from `test_history.json`.
- Export any historical run as a standalone JSON artifact.
- **Failure Screenshots Gallery:** Previews of auto-captured screenshot images with full modal viewer and direct download links.
- Strictly references real, verified files on disk with zero broken links.

### 7. Settings (`SettingsPage.jsx`)
- Backend Host URL configuration with **"Test Connection"** ping tool.
- Automation defaults (default browser, explicit wait timeout seconds, headless default).
- Target Application specification ([https://www.saucedemo.com/](https://www.saucedemo.com/)).
- **"Clear Execution History"** button calling `DELETE /api/history`.

---

## 🧪 Running Pytest Tests Directly (CLI)

```powershell
cd "c:\Users\LENOVO\Downloads\MONISH\projects\testing\Ecommerce-Testing-Project"

# Run all 18 test cases in headless mode
python -m pytest Pytest_Tests -v

# Run with visible Chrome browser window (headed mode)
python -m pytest Pytest_Tests -v --headless=false

# Run a specific test suite
python -m pytest Pytest_Tests/test_login.py -v
python -m pytest Pytest_Tests/test_login_scenarios.py -v
python -m pytest Pytest_Tests/test_products.py -v
python -m pytest Pytest_Tests/test_cart.py -v
python -m pytest Pytest_Tests/test_checkout.py -v
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check (`{"message": "TESTORA Backend API is running", "status": "healthy"}`) |
| `GET` | `/api/status` | System status, active execution flag, available test suites, target app |
| `GET` | `/api/history` | Historical test runs recorded in JSON (supports `?limit=N`) |
| `GET` | `/api/history/{run_id}` | Detailed data for a specific historical run |
| `DELETE` | `/api/history` | Clears stored test run history |
| `DELETE` | `/api/history/{run_id}` | Deletes a specific historical test run |
| `POST` | `/api/run-tests` | Triggers Pytest execution via subprocess (`{"test_file": "...", "headless": true}`) |
| `GET` | `/api/results/latest` | Most recent test run results with detailed test cases breakdown |
| `GET` | `/api/test-files` | Discovered Pytest test suite files in `Pytest_Tests/` |
| `GET` | `/api/screenshots` | List of captured failure screenshot files on disk |
| `DELETE` | `/api/screenshots/{filename}` | Deletes a specific failure screenshot |
| `GET` | `/api/reports` | Available HTML and JSON report files on server |
| `GET` | `/reports/{filename}` | Serves self-contained Pytest HTML report artifacts |
| `GET` | `/api/config` | Retrieves current test engine runtime configuration |
| `PUT` | `/api/config` | Updates test engine runtime parameters (`headless`, `browser`, `timeout`) |

---

## 📸 Automated Screenshot Capture

When any test fails, `conftest.py` automatically intercepts the event:
1. Captures full browser screenshot via Selenium.
2. Saves as `Screenshots/failure_<test_name>_<timestamp>.png`.
3. Attaches screenshot path to the structured JSON telemetry.
4. Exposes asset via the `/screenshots/<filename>` endpoint, immediately visible in the React frontend.
