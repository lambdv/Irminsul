import { NextRequest, NextResponse } from 'next/server';
import { Character } from '@/types/character';
import { getCharacter } from '@/utils/DataGetters';

export async function GET(req: NextRequest) {
    const id = req.nextUrl.pathname.split("/")[3]
    const data = await getCharacter(id)
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
