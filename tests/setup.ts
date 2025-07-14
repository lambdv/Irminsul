import '@testing-library/jest-dom'

// Polyfill for TextEncoder/TextDecoder
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Polyfill fetch, Request, Response, Headers for Jest
defineJestFetchPolyfill()

function defineJestFetchPolyfill() {
  try {
    // Only polyfill if not already defined
    if (typeof global.fetch === 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fetch = require('node-fetch')
      global.fetch = fetch
      global.Request = fetch.Request
      global.Response = fetch.Response
      global.Headers = fetch.Headers
    }
  } catch (e) {
    // Ignore if node-fetch is not available
  }
}
