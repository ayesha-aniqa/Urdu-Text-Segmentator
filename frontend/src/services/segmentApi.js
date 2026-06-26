/**
 * segmentApi.js — Frontend API client for the segmentation backend
 *
 * All communication with the FastAPI backend goes through this module.
 * The CRA dev server proxy (setupProxy.js) forwards /api/* requests
 * to localhost:8000, so we use relative URLs here.
 */

// ── Configuration ────────────────────────────
const API_BASE = '/api'
const SEGMENT_ENDPOINT = `${API_BASE}/segment`
const HEALTH_ENDPOINT = `${API_BASE}/health`
const REQUEST_TIMEOUT_MS = 30_000  // 30 seconds (model inference can be slow)
const MAX_RETRIES = 1

// ── Custom Error Classes ─────────────────────

export class BackendUnreachableError extends Error {
  constructor(message = 'Backend server is not reachable. Please make sure the Python server is running on port 8000.') {
    super(message)
    this.name = 'BackendUnreachableError'
  }
}

export class SegmentationError extends Error {
  constructor(message = 'Segmentation failed. Please try again.') {
    super(message)
    this.name = 'SegmentationError'
  }
}

// ── Internal: fetch with timeout ─────────────

async function fetchWithTimeout(url, options, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

// ── Public API ───────────────────────────────

/**
 * Send text to the backend for BiLSTM+CRF segmentation.
 *
 * @param {string} text — Raw Urdu text to segment
 * @returns {Promise<{tokens: string[], tags: string[], segments: string[]}>}
 * @throws {BackendUnreachableError} if the server cannot be reached
 * @throws {SegmentationError} if the server returns an error
 */
export async function segmentText(text) {
  let lastError = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[segmentApi] Retry attempt ${attempt}/${MAX_RETRIES}`)
        // Brief delay before retry
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      const response = await fetchWithTimeout(SEGMENT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      // Handle HTTP errors
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        const detail = errorBody.detail || `Server error (${response.status})`

        if (response.status === 503) {
          throw new SegmentationError('Model is not loaded yet. Please wait and try again.')
        }
        if (response.status === 422) {
          throw new SegmentationError('Invalid input: ' + detail)
        }
        throw new SegmentationError(detail)
      }

      const data = await response.json()

      console.log(
        `[segmentApi] ✅ ${data.tokens.length} tokens → ${data.segments.length} segments ` +
        `(model: ${data.model_type})`
      )

      return {
        tokens: data.tokens,
        tags: data.tags,
        segments: data.segments,
      }

    } catch (err) {
      lastError = err

      // Don't retry on known application errors
      if (err instanceof SegmentationError) {
        throw err
      }

      // Network-level failures → retry
      if (err.name === 'AbortError') {
        lastError = new BackendUnreachableError(
          'Request timed out — the model may be processing a very large text. Please try with shorter text.'
        )
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        lastError = new BackendUnreachableError()
      }

      console.warn(`[segmentApi] Attempt ${attempt + 1} failed:`, err.message)
    }
  }

  // All retries exhausted
  throw lastError || new BackendUnreachableError()
}


/**
 * Check if the backend server is running and the model is loaded.
 *
 * @returns {Promise<{status: string, model_loaded: boolean, model_type: string|null}>}
 * @throws {BackendUnreachableError} if the server cannot be reached
 */
export async function checkBackendHealth() {
  try {
    const response = await fetchWithTimeout(HEALTH_ENDPOINT, {
      method: 'GET',
    }, 5_000)  // shorter timeout for health checks

    if (!response.ok) {
      throw new BackendUnreachableError()
    }

    return await response.json()
  } catch (err) {
    if (err instanceof BackendUnreachableError) throw err
    throw new BackendUnreachableError()
  }
}
