import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const webSearchTool = tool(
    async ({ query }: { query: string }) => {
        return `You searched for: ${query}`;
    },
    {
        name: "webSearch",
        description: "Search the web for information",
        schema: z.object({
            query: z.string().describe("The search query"),
        }),
    }
)


// export const webSearchTool = tool(
//     async ({ query }: { query: string }) => {
//         return `You searched for: ${query}`;
//     },
//     {
//         name: "webSearch",
//         description: "Search the web for information",
//         schema: z.object({
//             query: z.string().describe("The search query"),
//         }),
//     }
// )