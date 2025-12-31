import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { findRelevantContent } from "@/lib/ai/embedding"
import { queryGCSIMDatabase } from "@/feature/ai/actions/toolHelpers"
import * as cheerio from "cheerio"

export const getKQMArticleTool = tool(
  async ({ query }) => {
    return await getKQMArticle(query)
  },
  {
    name: "getKQMArticle",
    description:
      "Get information from KQM articles about Genshin Impact. Use this tool to get information about a specific character or weapon.",
    schema: z.object({
      query: z
        .string()
        .describe(
          "A clear, specific search query to find relevant information"
        ),
    }),
  }
)

async function getKQMArticle(query: string) {
  const page = await fetch(`https://keqingmains.com`)
  const html = await page.text()
  const $ = cheerio.load(html)

  //get div with id character-cards
  const characterCardsDiv = $("div#character-cards")

  const guides = []
  //for each div inside this div
  characterCardsDiv.find("div").each((index, element) => {
    console.log(index, element)
    const guide = {
      title: "",
      links: [],
    }
    //get div with name guide-title
    const guideTitleDiv = $(element).find("div.guide-title")

    //get text, this is the title of the guide
    const guideTitle = guideTitleDiv.text()
    guide.title = guideTitle
    //then get div with class guide-links div from element
    const guideLinksDiv = $(element).find("div.guide-links")

    //recursively get al lthe a tags inside this div
    const guideLinks = guideLinksDiv.find("a")
    //for each a tag, get the text and the href
    guideLinks.each((index, element) => {
      const link = $(element).attr("href")
      const text = $(element).text()
      guide.links.push({ text, link })
    })

    guides.push(guide)
  })
  console.log(guides)
  return guides
}

// getKQMArticle("Keqing")
