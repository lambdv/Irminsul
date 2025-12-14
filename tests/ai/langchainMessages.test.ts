import { toLangChainMessages } from '@root/src/feature/ai/AIAgentFactory'
import { AIMessage, HumanMessage, SystemMessage } from 'langchain'

describe('toLangChainMessages', () => {
  it('prefixes the agent system prompt and maps roles correctly', () => {
    const msgs = toLangChainMessages('SYS', [
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'hello' },
      { role: 'system', content: 'extra system' },
    ])

    expect(msgs).toHaveLength(4)
    expect(msgs[0]).toBeInstanceOf(SystemMessage)
    expect(msgs[1]).toBeInstanceOf(HumanMessage)
    expect(msgs[2]).toBeInstanceOf(AIMessage)
    expect(msgs[3]).toBeInstanceOf(SystemMessage)
  })
})

