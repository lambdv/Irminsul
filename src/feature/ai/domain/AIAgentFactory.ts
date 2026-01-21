import { BaseAgent } from "./BaseAgent"
import { agentRegistry, AIAgent } from "./AgentRegistry"

// Import agents to ensure they're registered
import "./agents"

/**
 * Factory for creating AI agents
 * @deprecated Use agentRegistry.get() directly for better type safety
 */
export class AIAgentFactory {
  /**
   * Create an agent instance by ID
   */
  public static createAgent(agent: AIAgent): BaseAgent {
    return agentRegistry.get(agent)
  }

  /**
   * Get all available agent IDs
   */
  public static getAvailableAgents(): string[] {
    return agentRegistry.getAllIds()
  }

  /**
   * Get display name for an agent
   */
  public static getDisplayName(agentId: string): string {
    const metadata = agentRegistry.getMetadata(agentId)
    return metadata?.displayName || agentId
  }
}

// Re-export types for backward compatibility
export type { AIAgent } from "./AgentRegistry"
