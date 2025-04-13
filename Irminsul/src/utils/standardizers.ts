export function flatten(input: string): string {
    return String(input)
        .toLowerCase()
        .replaceAll(" ", "-")
        .replace(/[^a-z0-9_]/g, "")
}

export function toTitleCase(input: string): string {
    return String(input)
        .split(" ")
        .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
}

export function toKey(input: string): string {
    return String(input)
        .toLowerCase()
        .replaceAll(" ", "-")
        .replaceAll("'", "")
}