import { GeneralistAgent } from "../GeneralistAgent"
import { AgenticAgent } from "../AgenticAgent"
import { agentRegistry } from "../AgentRegistry"

// Register all agents
agentRegistry.register({
  id: "generalist",
  displayName: "Generalist",
  factory: () => new GeneralistAgent(),
})

agentRegistry.register({
  id: "agentic",
  displayName: "Agentic",
  factory: () => new AgenticAgent(),
})
