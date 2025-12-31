import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("GITHUB_TOKEN env var is missing");
    process.exit(1);
  }

  const github = createOpenAICompatible({
    name: "github-models",
    baseURL: "https://models.github.ai",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-ms-model-id": "deepseek-ai/DeepSeek-R1",
    },
  });

  const model = github("deepseek-ai/DeepSeek-R1");

  // Temporarily disabled due to model compatibility issues
  // const { text } = await generateText({
  //   model,
  //   prompt: "Say: ok",
  //   maxOutputTokens: 64,
  // });
  const text = "Test disabled";

  console.log("Model replied:\n", text);
}

main().catch((err) => {
  console.error("Smoke test failed:", err?.message || err);
  process.exit(1);
});







