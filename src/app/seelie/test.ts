// import { generateText, streamText, tool } from "ai";
// import { z } from 'zod';
// import { getCharacterDataTool, getInformationTool } from "./tools";
// import { findRelevantContent } from '@/lib/ai/embedding';
// import { eq, sql, and } from "drizzle-orm";
// import db from "@/db/db";
// import { aitokenTable } from "@/db/schema/aitoken";
// import { purchasesTable } from "@/db/schema/purchase";
// import { usersTable } from "@/db/schema/user";
// import { createOpenAI } from '@ai-sdk/openai';

// import { openai } from '@ai-sdk/openai';


// const token = process.env.GITHUB_TOKEN
// const endpoint = "https://models.inference.ai.azure.com"
// const modelName = "gpt-4o"

// const client = createOpenAI({
//     baseURL: endpoint,
//     apiKey: token,
// })

// const model = client(modelName)


// const { textStream } = streamText({
//     model,
//     prompt: 'Write a vegetarian lasagna recipe for 4 people.',
//   });
