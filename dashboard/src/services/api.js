/**
 * API Service for TESTORA — Quality Engineering Platform
 * Communicates with FastAPI backend running on http://127.0.0.1:8000
 */

const DEFAULT_API_URL = 'http://127.0.0.1:8000';

export const getApiBaseUrl = () => {
  return localStorage.getItem('qa_backend_url') || DEFAULT_API_URL;
};

export const setApiBaseUrl = (url) => {
  const cleanUrl = url.replace(/\/+$/, '');
  localStorage.setItem('qa_backend_url', cleanUrl);
  return cleanUrl;
};

export const resetApiBaseUrl = () => {
  localStorage.removeItem('qa_backend_url');
  return DEFAULT_API_URL;
};

// Generic fetch wrapper with timeout
async function request(endpoint, options = {}, timeoutMs = 60000) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        // use default status text
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000} seconds`);
    }
    throw err;
  }
}

export const api = {
  // Health & System Status
  checkHealth: () => request('/'),
  getStatus: () => request('/api/status'),

  // Test Execution
  runTests: (params = {}) =>
    request('/api/run-tests', {
      method: 'POST',
      body: JSON.stringify({
        test_file: params.test_file || null,
        headless: params.headless !== undefined ? params.headless : true,
        browser: params.browser || 'chrome',
      }),
    }, 180000), // 3-minute timeout for test runs

  // Configuration (GET, PUT)
  getConfig: () => request('/api/config'),
  updateConfig: (config) =>
    request('/api/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    }),

  // Results & History (GET, DELETE)
  getLatestResult: () => request('/api/results/latest'),
  getHistory: (limit = 50) => request(`/api/history?limit=${limit}`),
  getHistoryById: (runId) => request(`/api/history/${encodeURIComponent(runId)}`),
  clearHistory: () => request('/api/history', { method: 'DELETE' }),
  deleteHistoryRun: (runId) => request(`/api/history/${encodeURIComponent(runId)}`, { method: 'DELETE' }),

  // Suites & Screenshots (GET, DELETE)
  getTestFiles: () => request('/api/test-files'),
  getScreenshots: () => request('/api/screenshots'),
  deleteScreenshot: (filename) => request(`/api/screenshots/${encodeURIComponent(filename)}`, { method: 'DELETE' }),
  getReports: () => request('/api/reports'),

  // URL builders for screenshots and reports
  getScreenshotUrl: (filename) => {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}/screenshots/${encodeURIComponent(filename)}`;
  },
  getReportUrl: (filename) => {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}/reports/${encodeURIComponent(filename)}`;
  },
};
