import { NextResponse, NextRequest } from 'next/server';
import { promises as fs } from 'fs';

let cachedCharacters: any[] | null = null;

async function loadCharacters() {
    const dir = './src/data/characters';
    const files = await fs.readdir(dir);
    const characters = await Promise.all(
        files.map(async (file) => {
            const content = await fs.readFile(`${dir}/${file}`, 'utf8');
            return JSON.parse(content);
        })
    );
    return characters;
}

export async function GET(): Promise<NextResponse> {
    if (!cachedCharacters) {
        cachedCharacters = await loadCharacters();
    }
    return NextResponse.json(cachedCharacters);
}