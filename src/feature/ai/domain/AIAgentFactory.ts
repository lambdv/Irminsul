import { AgenticAgent } from "./AgenticAgent"
import { GeneralistAgent } from "./GeneralistAgent"
import { BaseAgent } from "./BaseAgent"

export type AIAgent = "generalist" | "agentic"

export class AIAgentFactory {
  public static createAgent(agent: AIAgent): BaseAgent {
    switch (agent) {
      case "generalist":
        return new GeneralistAgent()
      case "agentic":
        return new AgenticAgent()
    }
    throw new Error(`Agent ${agent} not found`)
  }
}
