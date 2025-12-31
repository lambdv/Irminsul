import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { findRelevantContent } from "@/lib/ai/embedding"
import { queryGCSIMDatabase } from "@/feature/ai/actions/toolHelpers"
import { tavily } from "@tavily/core"

/**
 * LangChain tool for searching web using Tavily API
 * Similar to getInformationTool in seelie/tools.ts
 */
export const getInformationTool = tool(
  async ({ query }) => {
    try {
      console.log("getInformationTool (LangChain) called:", query)
      const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY })
      const response = await tvly.search(query, {
        includeRawContent: false,
        maxResults: 10,
      })

      if (!response.results || response.results.length === 0) {
        return "No search results found. Please answer based on your knowledge."
      }

      const results = response.results.map((r) => ({
        title: r.title,
        url: r.url,
        content: r.content,
      }))

      console.log("getInformationTool results:", results.length)
      return (
        JSON.stringify(results) +
        "\n\nNow provide your answer to the user based on this information."
      )
    } catch (error) {
      console.error("Error in getInformationTool:", error)
      return JSON.stringify({ error: "Web search failed" })
    }
  },
  {
    name: "getInformation",
    description:
      "Search the web for real-time information about Genshin Impact. Use this tool ONCE per question to find relevant information. After receiving results, synthesize them into your answer.",
    schema: z.object({
      query: z
        .string()
        .describe(
          "A clear, specific search query to find relevant information"
        ),
    }),
  }
)

/**
 * LangChain tool for searching the web for Genshin Impact information (Google)
 */
export const searchEngineTool = tool(
  async ({ query, numResults = 3 }) => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=${numResults}`
      )
        .then((res) => res.json())
        .then((data) => data.items || [])
        .then((items) =>
          items.map((item: any) => ({
            title: item.title,
            snippet: item.snippet,
            source: item.link,
          }))
        )
        .catch((e) => {
          console.error("Search engine error:", e)
          return []
        })

      console.log("searchEngineTool called")
      return JSON.stringify(res)
    } catch (error) {
      console.error("Error in searchEngineTool:", error)
      return JSON.stringify({ error: "Search failed" })
    }
  },
  {
    name: "searchEngine",
    description:
      "Search the web for real-time information about Genshin Impact",
    schema: z.object({
      query: z.string().describe("Search query"),
      numResults: z
        .number()
        .optional()
        .default(3)
        .describe("Number of results to return"),
    }),
  }
)

/**
 * LangChain tool for querying GC SIM team calculation database
 */
export const queryGCSIMDatabaseTool = tool(
  async ({ characters, excludeCharacters, limit = 10 }) => {
    try {
      const results = await queryGCSIMDatabase({
        characters,
        excludeCharacters,
        limit,
        sortBy: "summary.mean_dps_per_target",
        sortOrder: "desc",
      })
      console.log("QueryGCSIMDatabaseTool called")
      return JSON.stringify(results)
    } catch (error) {
      console.error("Error in QueryGCSIMDatabaseTool:", error)
      return JSON.stringify({ error: "Failed to query GC SIM database" })
    }
  },
  {
    name: "queryGCSIMDatabase",
    description:
      "Query GC SIM Team Calculation Database for team DPS comparisons. Use to answer questions about best teams, damage calculations, and character rankings.",
    schema: z.object({
      characters: z
        .array(z.string())
        .optional()
        .describe("Character names to include in team search"),
      excludeCharacters: z
        .array(z.string())
        .optional()
        .describe("Character names to exclude"),
      limit: z
        .number()
        .optional()
        .default(10)
        .describe("Number of results to return"),
    }),
  }
)

/**
 * LangChain tool for getting information from knowledge base
 */
export const getInformationFromKnowledgeBaseTool = tool(
  async ({ question }) => {
    try {
      console.log("getInformationFromKnowledgeBaseTool called")
      const similarResources = await findRelevantContent(question)
      return JSON.stringify(similarResources)
    } catch (error) {
      console.error("Error in getInformationFromKnowledgeBaseTool:", error)
      return JSON.stringify({ error: "Knowledge base query failed" })
    }
  },
  {
    name: "getInformationFromKnowledgeBase",
    description:
      "Get information from the knowledge base to answer Genshin Impact questions",
    schema: z.object({
      question: z
        .string()
        .describe("The question to search for in the knowledge base"),
    }),
  }
)

export const langchainTools = [
  getInformationTool,
  queryGCSIMDatabaseTool,
  // searchEngineTool,
  // getInformationFromKnowledgeBaseTool,
]
