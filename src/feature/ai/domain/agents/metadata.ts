/**
 * Agent metadata definitions (client-safe)
 * This file can be imported in client components without pulling in server-only dependencies
 * 
 * To add a new agent:
 * 1. Add metadata here
 * 2. Create the agent class
 * 3. Register it in agents/index.ts with the same id
 */

/**
 * Agent metadata (without factory functions - client-safe)
 */
export interface AgentMetadataClient {
  id: string
  displayName: string
}

/**
 * Agent metadata definitions
 * These are registered server-side but can be accessed client-side
 */
export const agentMetadata: AgentMetadataClient[] = [
  {
    id: "generalist",
    displayName: "Generalist",
  },
  {
    id: "agentic",
    displayName: "Agentic",
  },
]

/**
 * Get metadata for an agent by ID (client-safe)
 */
export function getAgentMetadata(id: string): AgentMetadataClient | undefined {
  return agentMetadata.find((meta) => meta.id === id)
}

/**
 * Get all agent IDs (client-safe)
 */
export function getAllAgentIds(): string[] {
  return agentMetadata.map((meta) => meta.id)
}

/**
 * Get all agent metadata (client-safe)
 */
export function getAllAgentMetadata(): AgentMetadataClient[] {
  return agentMetadata
}
