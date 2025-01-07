import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    return NextResponse.json({ routes: ["api/characters", "api/characters/id" ] })
}