import "@testing-library/jest-dom"

// Ensure TextEncoder/TextDecoder exist for deps (e.g. langchain/langsmith) in Jest.
// Jest environments sometimes don't expose Node's globals reliably.
defineTextEncodingPolyfill()
defineWebStreamsPolyfill()

// Polyfill fetch, Request, Response, Headers for Jest
defineJestFetchPolyfill()

function defineTextEncodingPolyfill() {
  try {
    if (
      typeof global.TextEncoder === "undefined" ||
      typeof global.TextDecoder === "undefined"
    ) {
      const { TextEncoder, TextDecoder } = require("node:util")
      global.TextEncoder = TextEncoder
      global.TextDecoder = TextDecoder
    }
  } catch (e) {
    // Ignore if not available
  }
}

function defineWebStreamsPolyfill() {
  try {
    if (typeof global.ReadableStream === "undefined") {
      const web = require("node:stream/web")
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
    if (typeof global.fetch === "undefined") {
      const fetch = require("node-fetch")
      global.fetch = fetch
      global.Request = fetch.Request
      global.Response = fetch.Response
      global.Headers = fetch.Headers
    }
  } catch (e) {
    // If node-fetch is not available, create minimal polyfills
    if (typeof global.Request === "undefined") {
      global.Request = class Request {
        url: string
        method: string
        headers: Headers
        body: ReadableStream | null

        constructor(input: string | Request, init?: RequestInit) {
          if (typeof input === "string") {
            this.url = input
          } else {
            this.url = input.url
          }
          this.method = init?.method || "GET"
          this.headers = new Headers(init?.headers)
          this.body = (init?.body as ReadableStream | null) || null
        }

        async json() {
          return {}
        }
        async text() {
          return ""
        }
        clone() {
          return this
        }
      } as any
    }
    if (typeof global.Response === "undefined") {
      global.Response = class Response {
        status: number
        statusText: string
        headers: Headers
        body: ReadableStream | null

        constructor(body?: BodyInit | null, init?: ResponseInit) {
          this.status = init?.status || 200
          this.statusText = init?.statusText || "OK"
          this.headers = new Headers(init?.headers)
          this.body = (body as ReadableStream | null) || null
        }

        async json() {
          return {}
        }
        async text() {
          return ""
        }
      } as any
    }
    if (typeof global.Headers === "undefined") {
      global.Headers = class Headers {
        private map: Map<string, string>
        constructor(init?: HeadersInit) {
          this.map = new Map()
          if (init) {
            if (Array.isArray(init)) {
              init.forEach(([key, value]) => this.map.set(key, value))
            } else if (init instanceof Headers) {
              init.forEach((value, key) => this.map.set(key, value))
            } else {
              Object.entries(init).forEach(([key, value]) =>
                this.map.set(key, value)
              )
            }
          }
        }
        get(name: string) {
          return this.map.get(name) || null
        }
        has(name: string) {
          return this.map.has(name)
        }
        set(name: string, value: string) {
          this.map.set(name, value)
        }
        forEach(callback: (value: string, key: string) => void) {
          this.map.forEach(callback)
        }
      } as any
    }
  }
}
