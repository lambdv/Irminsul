import { NextResponse } from 'next/server';
import { getCharacter } from '@/utils/DataGetters';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
        // const character = await getCharacter(params.id);
        
        // const serializedCharacter = JSON.parse(JSON.stringify(character));
        
        // return NextResponse.json(serializedCharacter);
        return NextResponse.json({ routes: ["api/characters", "api/characters/id" ] })
}