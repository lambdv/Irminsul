import { NextResponse, NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import { getCharacters } from '@/utils/DataGetters';

export async function GET(): Promise<NextResponse> {
        // const characters = await getCharacters();
        // const serializedCharacters = JSON.parse(JSON.stringify(characters));
        // return NextResponse.json(serializedCharacters);
        return NextResponse.json({ routes: ["api/characters", "api/characters/id" ] })
}