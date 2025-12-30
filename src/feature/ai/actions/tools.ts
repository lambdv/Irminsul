import { generateText, tool } from "ai";
import { z } from 'zod';
import { getCharacter, getWeapon, getArtifact, getCharacters } from "@/utils/genshinData";
import { toKey } from "@/utils/standardizers";
import { findRelevantContent } from "@/lib/ai/embedding";
import { aitokenTable } from "@root/src/db/schema/aitoken";
import { eq, sql } from "drizzle-orm";
import db from "@root/src/db/db";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamUI } from "@ai-sdk/rsc"
import { queryGCSIMDatabase, fetchWebpageContent, getKeqingMainsInfo } from "./toolHelpers"
import { rerank } from 'ai';
import { tavily } from '@tavily/core';
import { YoutubeTranscript } from 'youtube-transcript-plus';


export const getInformationTool = tool({
    description: `Search the web for information about Genshin Impact. Use this tool ONCE per question to find relevant information. After receiving results, synthesize them into your answer without calling the tool again.`,
    inputSchema: z.object({
      query: z.string().describe('A clear, specific search query to find relevant information'),
    }),
    execute: async ({ query }) => {
        console.log("getInformationTool called: --------------------------------");
        const response = await webSearchAgent(query);
        console.log(response);
        console.log("--------------------------------");
        
        if (!response.results || response.results.length === 0) {
            return "No search results found. Please answer based on your knowledge.";
        }

        // Check for YouTube URLs and fetch transcripts
        const youtubeTranscripts: string[] = [];
        for (const result of response.results) {
            if (isYouTubeUrl(result.url)) {
                try {
                    const videoId = extractYouTubeVideoId(result.url);
                    if (videoId) {
                        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
                        const transcriptText = transcript.map(item => item.text).join(' ');
                        youtubeTranscripts.push(`YouTube Video: ${result.title}\nURL: ${result.url}\nTranscript: ${transcriptText.substring(0, 2000)}${transcriptText.length > 2000 ? '...' : ''}`);
                    }
                } catch (error) {
                    console.error(`Failed to fetch transcript for ${result.url}:`, error);
                    // Continue with other results even if transcript fails
                }
            }
        }

        let finalResponse = response.answer || '';
        
        if (youtubeTranscripts.length > 0) {
            finalResponse += '\n\nYouTube Transcripts:\n' + youtubeTranscripts.join('\n\n---\n\n');
        }
        
        return `${finalResponse}\n\nNow provide your answer to the user based on this information.`;
    },
});


const webSearchAgent = async (query: string) => {
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const response = await tvly.search(query, {
        includeRawContent: false, // Disable to save tokens - use content snippets instead
        maxResults: 10, // Minimal results
    });
    return response;
}

/**
 * Check if a URL is a YouTube URL
 */
function isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com/watch') || url.includes('youtu.be/') || url.includes('youtube.com/shorts/');
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeVideoId(url: string): string | null {
    try {
        // Handle youtu.be format
        if (url.includes('youtu.be/')) {
            const match = url.match(/youtu\.be\/([^?&#]+)/);
            return match ? match[1] : null;
        }
        
        // Handle youtube.com/watch?v= format
        if (url.includes('youtube.com/watch')) {
            const urlObj = new URL(url);
            return urlObj.searchParams.get('v');
        }
        
        // Handle youtube.com/shorts/ format
        if (url.includes('youtube.com/shorts/')) {
            const match = url.match(/youtube\.com\/shorts\/([^?&#]+)/);
            return match ? match[1] : null;
        }
        
        return null;
    } catch (error) {
        console.error('Error extracting YouTube video ID:', error);
        return null;
    }
}



export const tools = {
    getInformationTool: getInformationTool,
}