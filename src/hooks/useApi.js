import { useState, useCallback } from 'react'

const API_BASE    = 'https://www.urusverify.com/v1/client/04658938-c096-47af-80c2-4f085c7f5db6/api'
const FACTORY_KEY = 'factory2026'

/**
 * Core fetch wrapper — attaches mandatory headers automatically.
 *
 * @param {string} endpoint  - e.g. '/clients' or '/plans/123'
 * @param {RequestInit} options - standard fetch options (method, body, signal, …)
 * @returns {Promise<any>}   - parsed JSON response
 */
export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`

  const headers = {
    'Content-Type': 'application/json',
    'x-factory-key': FACTORY_KEY,
    ...options.headers
  }

  const config = {
    ...options,
    headers
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    let errorPayload
    try {
      errorPayload = await response.json()
    } catch {
      errorPayload = { message: response.statusText }
    }
    const error = new Error(errorPayload?.message || `HTTP ${response.status}`)
    error.status  = response.status
    error.payload = errorPayload
    throw error
  }

  // 204 No Content — nothing to parse
  if (response.status === 204) return null

  return response.json()
}

/**
 * React hook that wraps fetchApi with loading / error / data state.
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi()
 *   execute('/clients')
 *   execute('/plans', { method: 'POST', body: JSON.stringify(payload) })
 */
export function useApi() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const execute = useCallback(async (endpoint, options = {}) => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchApi(endpoint, options)
      setData(result)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, execute, reset }
}

// ─── Convenience helpers per table ──────────────────────────────────────────

export const tables = [
  'clients',
  'plans',
  'api_keys',
  'api_request_logs',
  'marketplaces',
  'scraper_runs',
  'apps',
  'categories',
  'integrations',
  'integration_snapshots',
  'gap_analysis_results',
  'trend_snapshots',
  'scraper_alerts'
]

/**
 * Generic CRUD factory for any URUS table.
 *
 * @param {string} table - one of the values in `tables`
 * @returns {{ list, get, create, update, remove }}
 */
export function createTableApi(table) {
  return {
    list:   (params = '')          => fetchApi(`/${table}${params ? '?' + params : ''}`),
    get:    (id)                   => fetchApi(`/${table}/${id}`),
    create: (body)                 => fetchApi(`/${table}`,     { method: 'POST',   body: JSON.stringify(body) }),
    update: (id, body)             => fetchApi(`/${table}/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
    patch:  (id, body)             => fetchApi(`/${table}/${id}`, { method: 'PATCH',  body: JSON.stringify(body) }),
    remove: (id)                   => fetchApi(`/${table}/${id}`, { method: 'DELETE' })
  }
}