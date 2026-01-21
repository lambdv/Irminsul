# Adding New AI Agents

This guide explains how to add a new AI agent to the system.

## Quick Start

1. **Add metadata** to `src/feature/ai/domain/agents/metadata.ts` (for client-side access):

```typescript
export const agentMetadata: AgentMetadataClient[] = [
  // ... existing agents
  {
    id: "my-new-agent",
    displayName: "My New Agent",
  },
]
```

2. **Create your agent class** extending `BaseAgent`:

```typescript
// src/feature/ai/domain/agents/MyNewAgent.ts
import { BaseAgent } from "../BaseAgent"

export class MyNewAgent extends BaseAgent {
  public async *streamRaw(
    messages: Array<[string, string]>
  ): AsyncGenerator<string> {
    // Your agent implementation
    yield "Hello from MyNewAgent!"
  }
}
```

3. **Register your agent** in `src/feature/ai/domain/agents/index.ts`:

```typescript
import { MyNewAgent } from "./MyNewAgent"
import { registerAgent } from "../AgentRegistry"

registerAgent({
  id: "my-new-agent",
  displayName: "My New Agent",
  factory: () => new MyNewAgent(),
})
```

That's it! Your agent will automatically:
- ✅ Appear in the UI dropdown
- ✅ Be available via `agentRegistry.get("my-new-agent")`
- ✅ Show its display name and description in the UI

## Agent Metadata

When registering an agent, provide:

- **`id`** (required): Unique identifier (e.g., `"my-new-agent"`)
- **`displayName`** (required): Name shown in UI (e.g., `"My New Agent"`)
- **`factory`** (required): Function that returns a new instance of your agent

## Example: Complete Agent

```typescript
// src/feature/ai/domain/agents/CreativeAgent.ts
import { BaseAgent } from "../BaseAgent"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

export class CreativeAgent extends BaseAgent {
  private model: ChatGoogleGenerativeAI

  constructor() {
    super()
    this.model = new ChatGoogleGenerativeAI({
      model: "models/gemini-flash-latest",
      apiKey: process.env.AISTUDIO_GOOGLE_API_KEY,
      temperature: 0.9, // More creative
    })
  }

  public async *streamRaw(
    messages: Array<[string, string]>
  ): AsyncGenerator<string> {
    // Your streaming implementation
    const response = await this.model.stream(messages)
    for await (const chunk of response) {
      yield chunk
    }
  }
}
```

Then register it:

```typescript
// src/feature/ai/domain/agents/index.ts
import { CreativeAgent } from "./CreativeAgent"
import { registerAgent } from "../AgentRegistry"

registerAgent({
  id: "creative",
  displayName: "Creative Writer",
  factory: () => new CreativeAgent(),
})
```

## Using Agents

### In API Routes

```typescript
import { agentRegistry } from "@root/src/feature/ai/domain/agents"
import "@root/src/feature/ai/domain/agents" // Ensure registration

const agent = agentRegistry.get("my-new-agent")
```

### In Components

```typescript
import { agentRegistry } from "@root/src/feature/ai/domain/agents"
import "@root/src/feature/ai/domain/agents"

// Get all available agents
const agents = agentRegistry.getAllIds()

// Get agent metadata
const metadata = agentRegistry.getMetadata("my-new-agent")
console.log(metadata?.displayName) // "My New Agent"
```

## Backward Compatibility

The old `AIAgentFactory` still works but is deprecated:

```typescript
import { AIAgentFactory } from "@root/src/feature/ai/domain/AIAgentFactory"
import "@root/src/feature/ai/domain/agents" // Ensure registration

const agent = AIAgentFactory.createAgent("my-new-agent")
```

## Best Practices

1. **Keep agent IDs lowercase with hyphens**: `"my-new-agent"` ✅ not `"MyNewAgent"` ❌
2. **Use descriptive display names**: `"Creative Writer"` ✅ not `"Agent1"` ❌
3. **One agent per file**: Keep agents in separate files for maintainability
4. **Export from index**: All agents should be registered in `agents/index.ts`
