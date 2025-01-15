import { NextRequest, NextResponse } from 'next/server';
import { getWeapons } from '@/utils/DataGetters';

export async function GET(req: NextRequest) {
    const data = await getWeapons()
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
