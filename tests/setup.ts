import '@testing-library/jest-dom'

// Ensure TextEncoder/TextDecoder exist for deps (e.g. langchain/langsmith) in Jest.
// Jest environments sometimes don't expose Node's globals reliably.
defineTextEncodingPolyfill()
defineWebStreamsPolyfill()

// Polyfill fetch, Request, Response, Headers for Jest
defineJestFetchPolyfill()

function defineTextEncodingPolyfill() {
  try {
    if (typeof global.TextEncoder === 'undefined' || typeof global.TextDecoder === 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { TextEncoder, TextDecoder } = require('node:util')
      global.TextEncoder = TextEncoder
      global.TextDecoder = TextDecoder
    }
  } catch (e) {
    // Ignore if not available
  }
}

function defineWebStreamsPolyfill() {
  try {
    if (typeof global.ReadableStream === 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const web = require('node:stream/web')
      global.ReadableStream = web.ReadableStream
      global.WritableStream = web.WritableStream
      global.TransformStream = web.TransformStream
    }
  } catch (e) {
    // Ignore if not available
  }
}

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
