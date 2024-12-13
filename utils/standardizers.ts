export default function flatten(input: string): string {
    return String(input)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
}