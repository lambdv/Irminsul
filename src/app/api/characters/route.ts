import { NextRequest, NextResponse } from 'next/server';
import { Character } from '@/types/character';
import { getCharacters } from '@/utils/DataGetters';

export async function GET(req: NextRequest) {
    const data = await getCharacters()
    try {
        return NextResponse.json({
            data: data
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
