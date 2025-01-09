import { NextResponse } from 'next/server';
import { getCharacter } from '@/utils/DataGetters';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const character = await getCharacter(params.id);
        
        if (!character) {
            return NextResponse.json(
                { error: 'Character not found' },
                { status: 404 }
            );
        }

        // Ensure the data is serializable
        const serializedCharacter = JSON.parse(JSON.stringify(character));
        
        return NextResponse.json(serializedCharacter);
    } catch (error) {
        console.error('Error in character [id] GET route:', error);
        return NextResponse.json(
            { error: 'Failed to fetch character' },
            { status: 500 }
        );
    }
}