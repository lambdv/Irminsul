import { BaseAgent } from "./BaseAgent"

/**
 * Metadata for an AI agent
 */
export interface AgentMetadata {
  /** Unique identifier for the agent (e.g., "generalist", "agentic") */
  id: string
  /** Display name shown in the UI */
  displayName: string
  /** Factory function that creates an instance of the agent */
  factory: () => BaseAgent
}

/**
 * Registry for all available AI agents
 */
class AgentRegistry {
  private agents: Map<string, AgentMetadata> = new Map()

  /**
   * Register an agent with the registry
   */
  register(metadata: AgentMetadata): void {
    if (this.agents.has(metadata.id)) {
      console.warn(`Agent with id "${metadata.id}" is already registered. Overwriting.`)
    }
    this.agents.set(metadata.id, metadata)
  }

  /**
   * Register multiple agents at once
   */
  registerAll(agents: AgentMetadata[]): void {
    agents.forEach((agent) => this.register(agent))
  }

  /**
   * Get an agent by ID
   */
  get(id: string): BaseAgent {
    const metadata = this.agents.get(id)
    if (!metadata) {
      throw new Error(`Agent "${id}" not found. Available agents: ${Array.from(this.agents.keys()).join(", ")}`)
    }
    return metadata.factory()
  }

  /**
   * Get metadata for an agent
   */
  getMetadata(id: string): AgentMetadata | undefined {
    return this.agents.get(id)
  }

  /**
   * Get all registered agent IDs
   */
  getAllIds(): string[] {
    return Array.from(this.agents.keys())
  }

  /**
   * Get all registered agent metadata
   */
  getAllMetadata(): AgentMetadata[] {
    return Array.from(this.agents.values())
  }

  /**
   * Check if an agent is registered
   */
  has(id: string): boolean {
    return this.agents.has(id)
  }
}

// Singleton instance
export const agentRegistry = new AgentRegistry()

// Export type for agent IDs (derived from registry)
export type AIAgent = string
