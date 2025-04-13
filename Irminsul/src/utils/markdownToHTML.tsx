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
            .replaceAll(/- (.*?)(?:<br\/>|$)/g, "<li>$1</li>")
            // .replaceAll(/Normal Attack(s)?/g, '<b class="text-red-500">Normal Attack$1</b>')
            // .replaceAll(/Charged Attack(s)?/g, '<b class="text-red-500">Charged Attack$1</b>')
            // .replaceAll(/Plunging Attack(s)?/g, '<b class="text-red-500">Plunging Attack$1</b>')
            // .replaceAll(/Elemental Skill(s)?/g, '<b class="text-red-500">Elemental Skill$1</b>')
            // .replaceAll(/Elemental Burst(s)?/g, '<b class="text-red-500">Elemental Burst$1</b>')
        }} />
    )
}
