/**
 * API Logger
 *
 * Structured request/response logging for development.
 * Tracks timing, redacts sensitive fields, and formats output
 * for easy scanning in the console.
 *
 * Only active in __DEV__ — zero overhead in production.
 */

import { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// Fields to redact from logged payloads
const REDACTED_FIELDS = ['password', 'token', 'authorization', 'refreshToken', 'newPassword']
const REDACTED = '[REDACTED]'

// Store request start times keyed by a request ID
const pendingRequests = new Map<string, number>()

let requestCounter = 0

function getRequestId(config: InternalAxiosRequestConfig): string {
  // Attach a unique ID to each request for correlation
  if (!(config as any).__requestId) {
    ;(config as any).__requestId = `req_${++requestCounter}`
  }
  return (config as any).__requestId
}

function redact(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data
  if (Array.isArray(data)) return data.map(redact)

  const cleaned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (REDACTED_FIELDS.includes(key.toLowerCase())) {
      cleaned[key] = REDACTED
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = redact(value)
    } else {
      cleaned[key] = value
    }
  }
  return cleaned
}

function formatMethod(method?: string): string {
  return (method || 'GET').toUpperCase().padEnd(6)
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function truncate(data: unknown, maxLength = 500): string {
  const str = JSON.stringify(data)
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

// ── Public API ─────────────────────────────────────────────

export function logRequest(config: InternalAxiosRequestConfig): void {
  if (!__DEV__) return

  const id = getRequestId(config)
  const method = formatMethod(config.method)
  const url = config.url || ''

  pendingRequests.set(id, Date.now())

  const parts = [`→ ${method} ${url}`]

  if (config.params && Object.keys(config.params).length > 0) {
    parts.push(`  params: ${truncate(config.params)}`)
  }

  if (config.data) {
    parts.push(`  body: ${truncate(redact(config.data))}`)
  }

  console.log(`[API] ${parts.join('\n')}`)
}

export function logResponse(response: AxiosResponse): void {
  if (!__DEV__) return

  const config = response.config
  const id = getRequestId(config)
  const method = formatMethod(config.method)
  const url = config.url || ''
  const status = response.status

  const startTime = pendingRequests.get(id)
  pendingRequests.delete(id)
  const duration = startTime ? formatDuration(Date.now() - startTime) : '?'

  const data = redact(response.data)

  console.log(
    `[API] ← ${method} ${url} ${status} (${duration})\n  data: ${truncate(data)}`
  )
}

export function logError(
  method: string | undefined,
  url: string | undefined,
  status: number | undefined,
  data: unknown,
  config?: InternalAxiosRequestConfig,
): void {
  if (!__DEV__) return

  const id = config ? getRequestId(config) : null
  const startTime = id ? pendingRequests.get(id) : null
  if (id) pendingRequests.delete(id)

  const duration = startTime ? formatDuration(Date.now() - startTime) : '?'
  const fmtMethod = formatMethod(method)

  console.error(
    `[API] ✗ ${fmtMethod} ${url || '?'} ${status || 'ERR'} (${duration})\n  error: ${truncate(redact(data))}`
  )
}
