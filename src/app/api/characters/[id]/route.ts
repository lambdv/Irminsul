import { getCharacter } from '@/utils/DataGetters';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const id = req.nextUrl.pathname.split('/').pop() as string;
    const character = await getCharacter(id);
    return NextResponse.json(character);
}