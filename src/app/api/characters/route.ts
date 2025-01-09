import { NextResponse, NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import { getCharacters } from '@/utils/DataGetters';

export async function GET(): Promise<NextResponse> {
    try {
        const characters = await getCharacters();
        
        // Ensure the data is serializable by converting it to a plain object
        const serializedCharacters = JSON.parse(JSON.stringify(characters));
        
        return NextResponse.json(serializedCharacters);
    } catch (error) {
        console.error('Error in characters GET route:', error);
        return NextResponse.json(
            { error: 'Failed to fetch characters' },
            { status: 500 }
        );
    }
}