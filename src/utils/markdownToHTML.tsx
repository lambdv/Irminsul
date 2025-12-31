import React from "react"

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function sanitizeUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const allowedProtocols = ["http:", "https:"]
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return null
    }
    const blockedDomains = ["javascript:", "data:", "vbscript:", "file:"]
    if (blockedDomains.some((p) => url.toLowerCase().startsWith(p))) {
      return null
    }
    return urlObj.toString()
  } catch {
    return null
  }
}

function extractYoutubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    if (
      urlObj.hostname === "www.youtube.com" ||
      urlObj.hostname === "youtube.com"
    ) {
      return urlObj.searchParams.get("v")
    }
    if (urlObj.hostname === "youtu.be" || urlObj.hostname === "www.youtu.be") {
      const parts = urlObj.pathname.split("/")
      return parts[parts.length - 1] || null
    }
    return null
  } catch {
    return null
  }
}

export default function markdownToHTML(
  markdown: string,
  highlightedWords?: string[]
) {
  let escaped = escapeHtml(markdown)

  if (highlightedWords && highlightedWords.length > 0) {
    highlightedWords.forEach((word) => {
      if (word && word.trim()) {
        const escapedWord = escapeHtml(word)
        const regex = new RegExp(`(${escapedWord})`, "gi")
        escaped = escaped.replace(regex, "<b>$1</b>")
      }
    })
  }

  escaped = escaped
    .replace(/### (.*?)(?=<h3|$)/g, (match, content) => {
      return `<h3 class="text-2xl font-bold">${content}</h3>`
    })
    .replace(/## (.*?)(?=<h2|$)/g, (match, content) => {
      return `<h2 class="text-xl font-bold">${content}</h2>`
    })
    .replace(/# (.*?)(?=<h1|$)/g, (match, content) => {
      return `<h1 class="text-lg font-bold">${content}</h1>`
    })
    .replace(/\*\*(.*?)\*\*\n%/g, "<b>$1%</b>")
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*\*\*(.*?)\*\*\*/g, "<b>$1</b>")
    .replace(/- (.*?)(?:<br\/>|$)/g, "<li>$1</li>")
    .replace(/\[source: (.*?)\]/g, (match, urlContent: string) => {
      const style = "font-size: 12px; color: #0000007c;"
      const sanitizedUrl = sanitizeUrl(urlContent)
      if (sanitizedUrl) {
        let displayText = urlContent
        try {
          const urlObj = new URL(sanitizedUrl)
          displayText = urlObj.hostname.replace(/^www\./, "")
        } catch {}
        return `<a href="${sanitizedUrl}" style="${style}" target="_blank" rel="noopener noreferrer">[${escapeHtml(displayText)}]</a>`
      } else {
        return `<span style="${style}">${escapeHtml(urlContent)}</span>`
      }
    })
    .replace(/\[yt: (.*?)\]/g, (match, urlContent: string) => {
      const videoId = extractYoutubeVideoId(urlContent)
      if (videoId) {
        return `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1rem 0;">
          <iframe
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 10px;"
            src="https://www.youtube.com/embed/${videoId}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>`
      } else {
        return `<span style="font-size: 12px;">[Invalid YouTube URL: ${escapeHtml(urlContent)}]</span>`
      }
    })

  return <div dangerouslySetInnerHTML={{ __html: escaped }} />
}
