// src/hooks/useOwnerData.js
import { useState, useEffect, useCallback, useRef } from "react";
import api from "@api/axios";

/**
 * Hook for fetching owner analytics data with auto-refresh, retry logic, and caching.
 *
 * @param {string} token - JWT auth token (optional if using axios interceptors)
 * @param {Object} options - Configuration options
 * @param {number} options.refreshInterval - Auto-refresh interval in ms (default: 30000)
 * @param {boolean} options.autoRefresh - Enable auto-refresh (default: true)
 * @param {number} options.retryCount - Max retry attempts on failure (default: 3)
 * @param {number} options.retryDelay - Base delay between retries in ms (default: 1000)
 * @param {boolean} options.enabled - Conditionally enable/disable fetching (default: true)
 * @param {Function} options.onSuccess - Callback when fetch succeeds (receives data)
 * @param {Function} options.onError - Callback when fetch fails (receives error)
 * @param {number} options.staleTime - Cache duration in ms before considering data stale (default: 0)
 *
 * @returns {Object} { data, loading, error, refetch, isRefreshing, lastUpdated }
 */
export const useOwnerData = (token, options = {}) => {
  const {
    refreshInterval = 30000,
    autoRefresh = true,
    retryCount = 3,
    retryDelay = 1000,
    enabled = true,
    onSuccess = null,
    onError = null,
    staleTime = 0,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Refs for cleanup and state management
  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);
  const cacheRef = useRef({ data: null, timestamp: null });
  const isMountedRef = useRef(true);
  const fetchPromiseRef = useRef(null);

  // ── Core fetch function with retry logic & abort support ─────────────────
  const fetchData = useCallback(
    async (isManualRefetch = false) => {
      // Skip if disabled or no token (when token is required)
      if (!enabled || (token && !token)) {
        setLoading(false);
        return null;
      }

      // Return cached data if still fresh (stale-while-revalidate pattern)
      if (
        !isManualRefetch &&
        staleTime > 0 &&
        cacheRef.current.data &&
        cacheRef.current.timestamp &&
        Date.now() - cacheRef.current.timestamp < staleTime
      ) {
        if (import.meta.env.DEV) {
          console.log("[useOwnerData] Returning cached data");
        }
        // Still refresh in background if enabled
        if (autoRefresh && !isRefreshing) {
          fetchData(true);
        }
        return cacheRef.current.data;
      }

      // Prevent duplicate simultaneous requests (request deduplication)
      if (fetchPromiseRef.current && !isManualRefetch) {
        if (import.meta.env.DEV) {
          console.log("[useOwnerData] Deduplicating request");
        }
        return fetchPromiseRef.current;
      }

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Set loading states
      if (isManualRefetch) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Create the fetch promise for deduplication
      const fetchPromise = (async () => {
        try {
          const API_BASE_URL =
            import.meta.env.VITE_API_URL || "http://localhost:5000/api";

          const response = await api.get("/analytics", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            signal: abortControllerRef.current.signal,
            // Axios-specific: timeout after 15 seconds
            timeout: 15000,
          });

          const result = response.data;

          // Handle API-level errors (success: false in response body)
          if (result?.success === false) {
            throw new Error(result.message || "API returned error");
          }

          // Update cache
          cacheRef.current = {
            data: result,
            timestamp: Date.now(),
          };

          // Update state only if component is still mounted
          if (isMountedRef.current) {
            setData(result);
            setLastUpdated(new Date());
            setError(null);
          }

          // Reset retry counter on success
          retryCountRef.current = 0;

          // Trigger success callback
          if (typeof onSuccess === "function" && isMountedRef.current) {
            onSuccess(result);
          }

          if (import.meta.env.DEV) {
            console.log("[useOwnerData] Fetch successful", {
              timestamp: new Date().toISOString(),
              hasData: !!result,
            });
          }

          return result;
        } catch (err) {
          // Ignore abort errors (expected during cleanup)
          if (err.name === "AbortError") {
            if (import.meta.env.DEV) {
              console.log("[useOwnerData] Request aborted");
            }
            return null;
          }

          // Handle retry logic
          if (retryCountRef.current < retryCount) {
            retryCountRef.current += 1;
            const delay = retryDelay * Math.pow(2, retryCountRef.current - 1); // exponential backoff

            if (import.meta.env.DEV) {
              console.warn(
                `[useOwnerData] Retry ${retryCountRef.current}/${retryCount} after ${delay}ms`,
                err?.message,
              );
            }

            // Wait then retry
            await new Promise((resolve) => setTimeout(resolve, delay));
            return fetchData(isManualRefetch);
          }

          // Max retries exceeded — handle error
          const errorMessage =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to fetch owner analytics data";

          if (import.meta.env.DEV) {
            console.error(
              "[useOwnerData] Fetch failed after retries:",
              errorMessage,
              err,
            );
          }

          if (isMountedRef.current) {
            setError(errorMessage);

            // Trigger error callback
            if (typeof onError === "function") {
              onError(errorMessage, err);
            }
          }

          return null;
        } finally {
          // Update loading states only if mounted
          if (isMountedRef.current) {
            setLoading(false);
            setIsRefreshing(false);
          }
          // Clear the deduplication promise
          if (fetchPromiseRef.current === fetchPromise) {
            fetchPromiseRef.current = null;
          }
        }
      })();

      // Store promise for deduplication
      if (!isManualRefetch) {
        fetchPromiseRef.current = fetchPromise;
      }

      return fetchPromise;
    },
    [
      token,
      enabled,
      autoRefresh,
      retryCount,
      retryDelay,
      staleTime,
      onSuccess,
      onError,
      isRefreshing,
    ],
  );

  // ── Manual refetch wrapper (always bypasses cache) ───────────────────────
  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // ── Effect: Initial fetch + auto-refresh interval ────────────────────────
  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      fetchData();
    }

    // Auto-refresh interval
    let intervalId = null;
    if (autoRefresh && enabled && refreshInterval > 0) {
      intervalId = setInterval(() => {
        // Only auto-refresh if data isn't stale (respect staleTime)
        if (
          !staleTime ||
          !cacheRef.current.timestamp ||
          Date.now() - cacheRef.current.timestamp >= staleTime
        ) {
          fetchData();
        }
      }, refreshInterval);
    }

    // Cleanup on unmount or dependency change
    return () => {
      isMountedRef.current = false;

      if (intervalId) clearInterval(intervalId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      fetchPromiseRef.current = null;
    };
  }, [fetchData, autoRefresh, refreshInterval, enabled, staleTime]);

  // ── Reset hook state (useful for logout or token change) ─────────────────
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setData(null);
    setLoading(true);
    setError(null);
    setLastUpdated(null);
    cacheRef.current = { data: null, timestamp: null };
    retryCountRef.current = 0;
  }, []);

  return {
    data, // Fetched analytics data (or null)
    loading, // Initial load state
    error, // Error message (or null)
    isRefreshing, // True during auto-refresh or manual refetch
    lastUpdated, // Date object of last successful fetch
    refetch, // Manual trigger: () => Promise
    reset, // Clear all state: () => void
  };
};

