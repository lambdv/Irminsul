import { AIAgentFactory } from "@root/src/feature/ai/domain/AIAgentFactory"
import { GeneralistAgent } from "@root/src/feature/ai/domain/GeneralistAgent"

describe("AIAgentFactory", () => {
  it('creates a GeneralistAgent when type is "generalist"', () => {
    const agent = AIAgentFactory.createAgent("generalist")
    expect(agent).toBeInstanceOf(GeneralistAgent)
  })

  it("has a streamRaw method on GeneralistAgent", () => {
    const agent = AIAgentFactory.createAgent("generalist")
    expect(typeof agent.streamRaw).toBe("function")
  })

  it("throws error for unknown agent type", () => {
    expect(() => AIAgentFactory.createAgent("unknown" as any)).toThrow(
      "Agent unknown not found"
    )
  })
})
