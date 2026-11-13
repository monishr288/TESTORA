import React, { useState, useMemo } from 'react';
import {
  Network,
  Send,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Code,
  Layers,
  Server,
  FileJson,
  Loader2,
  Info,
  Filter,
  Search,
  Sliders,
  Trash2,
  Edit3,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { API_ENDPOINTS } from '../data/apiEndpoints';
import { getApiBaseUrl } from '../services/api';
import { useTestContext } from '../context/TestContext';

export default function ApiTestingPage() {
  const { addNotification, backendConnected, history, refreshData } = useTestContext();

  const [methodFilter, setMethodFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveOnly, setLiveOnly] = useState(false);

  const [activeEndpoint, setActiveEndpoint] = useState(API_ENDPOINTS[0]);
  const [requestPayload, setRequestPayload] = useState(
    API_ENDPOINTS[0].samplePayload ? JSON.stringify(API_ENDPOINTS[0].samplePayload, null, 2) : ''
  );
  const [pathParam, setPathParam] = useState('');
  const [responseResult, setResponseResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [batchResults, setBatchResults] = useState({});
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Filtered endpoints list
  const filteredEndpoints = useMemo(() => {
    return API_ENDPOINTS.filter((ep) => {
      const matchesMethod = methodFilter === 'ALL' || ep.method === methodFilter;
      const matchesLive = !liveOnly || ep.isLive;
      const matchesSearch =
        ep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMethod && matchesLive && matchesSearch;
    });
  }, [methodFilter, liveOnly, searchQuery]);

  const handleSelectEndpoint = (ep) => {
    setActiveEndpoint(ep);
    setRequestPayload(ep.samplePayload ? JSON.stringify(ep.samplePayload, null, 2) : '');
    setResponseResult(null);

    // Auto-populate sensible path parameter if needed
    if (ep.endpoint.includes('{run_id}')) {
      const firstRunId = history && history.length > 0 ? history[0].run_id : 'run_sample_123';
      setPathParam(firstRunId);
    } else if (ep.endpoint.includes('{filename}')) {
      setPathParam('sample_failure.png');
    } else if (ep.endpoint.includes('{item_id}')) {
      setPathParam('4');
    } else {
      setPathParam('');
    }
  };

  const getMethodBadgeStyle = (method) => {
    switch (method) {
      case 'GET':
        return {
          background: 'rgba(16, 185, 129, 0.18)',
          color: '#34d399',
          border: '1px solid rgba(52, 211, 153, 0.35)',
        };
      case 'POST':
        return {
          background: 'rgba(129, 140, 248, 0.18)',
          color: '#818cf8',
          border: '1px solid rgba(129, 140, 248, 0.35)',
        };
      case 'PUT':
        return {
          background: 'rgba(245, 158, 11, 0.18)',
          color: '#fbbf24',
          border: '1px solid rgba(251, 191, 36, 0.35)',
        };
      case 'DELETE':
        return {
          background: 'rgba(244, 63, 94, 0.18)',
          color: '#fb7185',
          border: '1px solid rgba(251, 113, 133, 0.35)',
        };
      default:
        return {
          background: 'rgba(148, 163, 184, 0.18)',
          color: '#94a3b8',
          border: '1px solid rgba(148, 163, 184, 0.35)',
        };
    }
  };

  // Compute final endpoint path with path parameters substituted
  const resolveEndpointUrl = () => {
    let resolved = activeEndpoint.endpoint;
    if (resolved.includes('{run_id}')) {
      resolved = resolved.replace('{run_id}', encodeURIComponent(pathParam.trim() || 'sample_id'));
    } else if (resolved.includes('{filename}')) {
      resolved = resolved.replace('{filename}', encodeURIComponent(pathParam.trim() || 'sample.png'));
    } else if (resolved.includes('{item_id}')) {
      resolved = resolved.replace('{item_id}', encodeURIComponent(pathParam.trim() || '4'));
    }
    return resolved;
  };

  // Execute single live API test
  const handleExecuteSingle = async () => {
    if (!activeEndpoint.isLive) {
      addNotification({
        title: 'Mock/Sample Endpoint',
        message: 'This is a documentation/contract sample endpoint and cannot be dispatched live.',
        type: 'info',
      });
      return;
    }

    setIsExecuting(true);
    const start = performance.now();
    const baseUrl = getApiBaseUrl();
    const endpointPath = resolveEndpointUrl();
    const fullUrl = `${baseUrl}${endpointPath}`;

    try {
      const options = {
        method: activeEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      };

      if (['POST', 'PUT', 'PATCH'].includes(activeEndpoint.method) && requestPayload) {
        options.body = requestPayload;
      }

      const res = await fetch(fullUrl, options);
      const elapsed = Math.round(performance.now() - start);

      let data;
      try {
        data = await res.json();
      } catch {
        data = { raw: await res.text() };
      }

      const resultObj = {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        timeMs: elapsed,
        headers: Object.fromEntries(res.headers.entries()),
        data,
      };

      setResponseResult(resultObj);
      setBatchResults((prev) => ({
        ...prev,
        [activeEndpoint.id]: {
          status: res.status,
          ok: res.ok,
          timeMs: elapsed,
        },
      }));

      addNotification({
        title: `API ${activeEndpoint.method} ${endpointPath}`,
        message: `Response HTTP ${res.status} received in ${elapsed}ms.`,
        type: res.ok ? 'success' : 'error',
      });

      // If configuration or history was updated, refresh context data
      if (activeEndpoint.method === 'PUT' || activeEndpoint.method === 'DELETE') {
        refreshData();
      }
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      setResponseResult({
        status: 0,
        statusText: 'Network / Connection Error',
        ok: false,
        timeMs: elapsed,
        error: err.message,
      });

      addNotification({
        title: 'API Request Failed',
        message: err.message || 'Network error communicating with backend',
        type: 'error',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Run all safe live endpoints (excluding mass DELETE and long-running runner)
  const handleRunAllLive = async () => {
    setIsBatchRunning(true);
    const safeLiveEndpoints = API_ENDPOINTS.filter(
      (e) => e.isLive && e.method === 'GET' && !e.endpoint.includes('{')
    );
    const results = {};
    const baseUrl = getApiBaseUrl();

    for (const ep of safeLiveEndpoints) {
      const start = performance.now();
      try {
        const res = await fetch(`${baseUrl}${ep.endpoint}`, {
          method: ep.method,
          headers: { 'Content-Type': 'application/json' },
        });
        const elapsed = Math.round(performance.now() - start);
        results[ep.id] = { status: res.status, ok: res.ok, timeMs: elapsed };
      } catch (err) {
        results[ep.id] = { status: 0, ok: false, timeMs: 0, error: err.message };
      }
      setBatchResults({ ...results });
    }

    setIsBatchRunning(false);
    addNotification({
      title: 'API Test Suite Completed',
      message: `Executed verification on ${safeLiveEndpoints.length} live GET endpoints.`,
      type: 'success',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '22px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-passed">
              <Server size={12} />
              TESTORA REST Engine
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              FastAPI OpenAPI / Swagger at :8000/docs
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
            TESTORA REST API Console & Verification
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Test live TESTORA backend REST endpoints (GET, POST, PUT, DELETE) in real-time or review contract definitions.
          </p>
        </div>

        <button
          onClick={handleRunAllLive}
          className="btn btn-primary"
          disabled={isBatchRunning || !backendConnected}
        >
          {isBatchRunning ? <Loader2 size={16} className="spin-icon" /> : <Play size={16} fill="currentColor" />}
          <span>Verify Live GET Endpoints</span>
        </button>
      </div>

      {/* Main Grid: Endpoints List on Left, Live Runner on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '20px' }}>
        {/* Endpoints Catalog */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              API Endpoints Catalog
            </h3>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              {filteredEndpoints.length} of {API_ENDPOINTS.length} Endpoints
            </span>
          </div>

          {/* Method Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map((m) => {
              const active = methodFilter === m;
              return (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: active ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                    background: active ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: active ? '#38bdf8' : 'var(--text-secondary)',
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {/* Search & Live Filter */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-glass"
                style={{ paddingLeft: '32px', fontSize: '0.775rem', height: '34px' }}
              />
            </div>

            <button
              onClick={() => setLiveOnly(!liveOnly)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: liveOnly ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                background: liveOnly ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: liveOnly ? '#38bdf8' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              Live Only
            </button>
          </div>

          {/* Endpoints List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '660px', overflowY: 'auto' }}>
            {filteredEndpoints.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No endpoints match the selected filter.
              </div>
            ) : (
              filteredEndpoints.map((ep) => {
                const isSelected = activeEndpoint.id === ep.id;
                const batchStatus = batchResults[ep.id];
                const badgeStyle = getMethodBadgeStyle(ep.method);

                return (
                  <div
                    key={ep.id}
                    onClick={() => handleSelectEndpoint(ep)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.675rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-mono)',
                            ...badgeStyle,
                          }}
                        >
                          {ep.method}
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {ep.name}
                        </span>
                      </div>

                      {ep.isLive ? (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: '#38bdf8',
                            background: 'rgba(56, 189, 248, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          LIVE
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          SAMPLE
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {ep.endpoint}
                      </span>

                      {batchStatus && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: batchStatus.ok ? '#34d399' : '#fb7185',
                          }}
                        >
                          {batchStatus.status} ({batchStatus.timeMs}ms)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Test Executor Console */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Header of Selected Endpoint */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontFamily: 'var(--font-mono)',
                    ...getMethodBadgeStyle(activeEndpoint.method),
                  }}
                >
                  {activeEndpoint.method}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
                  {resolveEndpointUrl()}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                {activeEndpoint.description}
              </p>
            </div>

            {/* Execute Button */}
            {activeEndpoint.isLive ? (
              <button
                onClick={handleExecuteSingle}
                className="btn btn-primary"
                disabled={isExecuting || !backendConnected}
                style={{
                  background:
                    activeEndpoint.method === 'DELETE'
                      ? 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)'
                      : activeEndpoint.method === 'PUT'
                      ? 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)'
                      : undefined,
                }}
              >
                {isExecuting ? (
                  <Loader2 size={15} className="spin-icon" />
                ) : activeEndpoint.method === 'DELETE' ? (
                  <Trash2 size={15} />
                ) : activeEndpoint.method === 'PUT' ? (
                  <Edit3 size={15} />
                ) : (
                  <Send size={15} />
                )}
                <span>Send {activeEndpoint.method}</span>
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Info size={14} />
                <span>Contract / Sample Endpoint (Doc Only)</span>
              </div>
            )}
          </div>

          {/* Path Parameter Input (if endpoint contains placeholders) */}
          {activeEndpoint.endpoint.includes('{') && (
            <div style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <label style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Path Parameter Value
              </label>
              <input
                type="text"
                className="input-glass"
                placeholder="Enter path parameter value..."
                value={pathParam}
                onChange={(e) => setPathParam(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
              />
            </div>
          )}

          {/* Request Payload (if POST, PUT, or PATCH) */}
          {['POST', 'PUT', 'PATCH'].includes(activeEndpoint.method) && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Request Body (JSON)
                </label>
                {activeEndpoint.samplePayload && (
                  <button
                    type="button"
                    onClick={() => setRequestPayload(JSON.stringify(activeEndpoint.samplePayload, null, 2))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: '0.725rem',
                      cursor: 'pointer',
                      padding: '0',
                    }}
                  >
                    Reset to Default Payload
                  </button>
                )}
              </div>
              <textarea
                className="input-glass"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                rows={5}
                value={requestPayload}
                onChange={(e) => setRequestPayload(e.target.value)}
                disabled={!activeEndpoint.isLive}
              />
            </div>
          )}

          {/* Live Response Panel */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Live Response
              </span>

              {responseResult && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: responseResult.ok ? '#34d399' : '#fb7185',
                    }}
                  >
                    HTTP {responseResult.status} {responseResult.statusText}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    &bull; {responseResult.timeMs}ms
                  </span>
                </div>
              )}
            </div>

            <pre className="code-terminal" style={{ minHeight: '160px', maxHeight: '300px' }}>
              {responseResult
                ? JSON.stringify(responseResult.data || responseResult.error, null, 2)
                : '// Click "Send Request" to trigger this endpoint against the FastAPI server...'}
            </pre>
          </div>

          {/* Expected Response Schema Preview */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Contract Schema / Expected Response (HTTP {activeEndpoint.expectedStatus})
            </div>
            <pre
              className="code-terminal"
              style={{
                color: '#94a3b8',
                background: 'rgba(5, 8, 16, 0.4)',
                border: '1px solid var(--border-subtle)',
                maxHeight: '160px',
              }}
            >
              {JSON.stringify(activeEndpoint.expectedResponse, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
