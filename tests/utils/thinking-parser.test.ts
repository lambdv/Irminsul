describe("Thinking Block Parser", () => {
  const parseThinkingBlocks = (content: string): string => {
    const thinkingRegex = /:::thinking\s*\n([\s\S]*?)\n:::/g
    return content.replace(thinkingRegex, "\n$1\n")
  }

  test("should parse :::thinking blocks correctly", () => {
    const testInput = `:::thinking

What is the user asking?The user is initiating a conversation with a greeting ("hi").

My analysis and findings...

I should respond to the greeting.:::
Yo, Traveler! Welcome to the server.`

    const actualOutput = parseThinkingBlocks(testInput)

    expect(actualOutput).toContain("\nI should respond to the greeting.\n")
    expect(actualOutput).toContain("What is the user asking?")
    expect(actualOutput).toContain("Yo, Traveler! Welcome to the server.")
    expect(actualOutput).not.toContain(":::thinking")
    expect(actualOutput).not.toContain(":::")
  })

  test("should handle multiple thinking blocks", () => {
    const testInput = `:::thinking

First thinking:::
Some text between
:::thinking

Second thinking:::
Final text`

    const actualOutput = parseThinkingBlocks(testInput)

    expect(actualOutput).toMatch(/\nFirst thinking\n/g)
    expect(actualOutput).toMatch(/\nSecond thinking\n/g)
    expect(actualOutput).not.toContain(":::thinking")
    expect(actualOutput).not.toContain(":::")
  })

  test("should not affect content without thinking blocks", () => {
    const testInput = "Just regular markdown content"
    const actualOutput = parseThinkingBlocks(testInput)
    expect(actualOutput).toBe(testInput)
  })
})
