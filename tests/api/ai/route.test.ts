import { POST } from "../../../src/app/api/ai/route"
import { AIAgentFactory } from "../../../src/feature/_ai/domain/AIAgentFactory"

// Polyfill Response for Jest environment
if (typeof global.Response === "undefined") {
  global.Response = class Response {
    body: ReadableStream | null
    status: number
    statusText: string
    headers: Headers

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.status = init?.status || 200
      this.statusText = init?.statusText || "OK"
      this.headers = new Headers(init?.headers)

      if (body instanceof ReadableStream) {
        this.body = body
      } else if (body) {
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          start(controller) {
            const data = typeof body === "string" ? body : JSON.stringify(body)
            controller.enqueue(encoder.encode(data))
            controller.close()
          },
        })
        this.body = stream
      } else {
        this.body = null
      }
    }

    async json() {
      if (!this.body) return {}
      const reader = this.body.getReader()
      const decoder = new TextDecoder()
      let result = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result += decoder.decode(value)
      }
      return JSON.parse(result)
    }

    async text() {
      if (!this.body) return ""
      const reader = this.body.getReader()
      const decoder = new TextDecoder()
      let result = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result += decoder.decode(value)
      }
      return result
    }
  } as any
}

// Mock the AIAgentFactory
jest.mock("../../../src/feature/ai/AIAgentFactory", () => ({
  AIAgentFactory: {
    createAgent: jest.fn(),
  },
}))

// Mock @ai-sdk/langchain
jest.mock("@ai-sdk/langchain", () => ({
  toUIMessageStream: jest.fn((stream) => stream),
}))

// Mock ai package
jest.mock("ai", () => ({
  createUIMessageStreamResponse: jest.fn(({ stream }) => {
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    })
  }),
}))

// Helper to create Request objects for testing
function createRequest(
  url: string,
  options: {
    method?: string
    headers?: Record<string, string>
    body?: string
  } = {}
): any {
  const body = options.body
  return {
    url,
    method: options.method || "GET",
    headers: options.headers || {},
    json: async () => {
      if (!body) return {}
      try {
        return JSON.parse(body)
      } catch {
        throw new Error("Invalid JSON")
      }
    },
  }
}

// Helper to create async iterable from array
async function* createAsyncIterable(items: string[]) {
  for (const item of items) {
    yield item
  }
}

describe("/api/ai route", () => {
  let mockAgent: {
    streamRaw: jest.Mock
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Create a mock agent with streamRaw method
    mockAgent = {
      streamRaw: jest.fn(),
    }

    ;(AIAgentFactory.createAgent as jest.Mock).mockReturnValue(mockAgent)
  })

  describe("POST handler", () => {
    it("should create agent and call streamRaw with converted messages", async () => {
      const mockStream = createAsyncIterable(["Hello", " there", "!"])
      mockAgent.streamRaw.mockResolvedValue(mockStream)

      const request = createRequest("http://localhost/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(AIAgentFactory.createAgent).toHaveBeenCalledWith("generalist")
      // Messages should be converted to LangChain tuple format
      expect(mockAgent.streamRaw).toHaveBeenCalledWith([["user", "Hello"]])
    })

    it("should convert AI SDK message format with parts to LangChain format", async () => {
      const mockStream = createAsyncIterable(["Response"])
      mockAgent.streamRaw.mockResolvedValue(mockStream)

      const request = createRequest("http://localhost/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", parts: [{ type: "text", text: "Hello" }] },
            { role: "assistant", parts: [{ type: "text", text: "Hi!" }] },
            { role: "user", content: "How are you?" },
          ],
        }),
      })

      await POST(request)

      expect(mockAgent.streamRaw).toHaveBeenCalledWith([
        ["user", "Hello"],
        ["assistant", "Hi!"],
        ["user", "How are you?"],
      ])
    })

    it("should return 500 error when agent creation fails", async () => {
      ;(AIAgentFactory.createAgent as jest.Mock).mockImplementation(() => {
        throw new Error("Agent creation failed")
      })

      const request = createRequest("http://localhost/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const errorData = await response.json()
      expect(errorData.error).toBe("Agent creation failed")
    })

    it("should return 500 error when streamRaw fails", async () => {
      mockAgent.streamRaw.mockRejectedValue(new Error("Stream failed"))

      const request = createRequest("http://localhost/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const errorData = await response.json()
      expect(errorData.error).toBe("Stream failed")
    })

    it("should return 500 error when request body is invalid", async () => {
      const request = createRequest("http://localhost/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json",
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const errorData = await response.json()
      expect(errorData.error).toBeDefined()
    })

    it("should handle empty messages array", async () => {
      const mockStream = createAsyncIterable([])
      mockAgent.streamRaw.mockResolvedValue(mockStream)

      const request = createRequest("http://localhost/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockAgent.streamRaw).toHaveBeenCalledWith([])
    })
  })
})
