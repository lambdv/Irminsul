import React from "react"

export default function markdownToHTML(
    markdown: string,
    highlightedWords?: string[]
) {
    // Wrap highlighted words in <b> tags
    if (highlightedWords) {
        highlightedWords.forEach(word => {
            const regex = new RegExp(`(${word})`, 'gi');
            markdown = markdown.replaceAll(regex, '<b>$1</b>');
        });
    }

    return (
        <div dangerouslySetInnerHTML={{ __html: markdown
            .replaceAll(/### (.*?)/g, '<h3 className="text-2xl font-bold">$1</h3>')
            .replaceAll(/## (.*?)/g, '<h2 className="text-xl font-bold">$1</h2>')
            .replaceAll(/# (.*?)/g, '<h1 className="text-lg font-bold">$1</h1>')
            
            .replaceAll(/\*\*(.*?)\*\*\n\%/g, '<b>$1%</b>')
            .replaceAll(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replaceAll(/\*\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replaceAll(/- (.*?)(?:<br\/>|$)/g, "<li>$1</li>")
            .replaceAll(/\[source: (.*?)\]/g, (match, url) => {
              // Extract domain name from URL if it's a URL
              let displayText = url;
              let href = "";
              try {
                if (url.startsWith('http') || url.includes('www.')) {
                  const urlObj = new URL(url);
                  displayText = urlObj.hostname.replace(/^www\./, '');
                  href = url;
                }   
              } catch (e) {}

              const style = "font-size: 12px; color: #0000007c;"
              
              if (href) {
                return `<a href="${href}" style="${style}" target="_blank">[${displayText}]</a>`;
              } else {
                return `<span style="${style}">${displayText}</span>`;
              }
            })

            .replaceAll(/\[yt: (.*?)\]/g, (match, url) => {
              // Convert YouTube links to embedded iframes
              let videoId = "";
              try {
                if (url.includes('youtube.com')) {
                  const urlObj = new URL(url);
                  videoId = urlObj.searchParams.get('v') || "";
                } else if (url.includes('youtu.be')) {
                  videoId = url.split('/').pop() || "";
                }
              } catch (e) {}

              if (videoId) {
                return `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1rem 0;">
                  <iframe 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 10px;" 
                    src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                  </iframe>
                </div>`;
              } else {
                return `<span style="font-size: 12px;">[Invalid YouTube URL: ${url}]</span>`;
              }
            })
            // .replaceAll(/Normal Attack(s)?/g, '<b class="text-red-500">Normal Attack$1</b>')
            // .replaceAll(/Charged Attack(s)?/g, '<b class="text-red-500">Charged Attack$1</b>')
            // .replaceAll(/Plunging Attack(s)?/g, '<b class="text-red-500">Plunging Attack$1</b>')
            // .replaceAll(/Elemental Skill(s)?/g, '<b class="text-red-500">Elemental Skill$1</b>')
            // .replaceAll(/Elemental Burst(s)?/g, '<b class="text-red-500">Elemental Burst$1</b>')
        }} />
    )
}
