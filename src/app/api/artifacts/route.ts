import { NextRequest, NextResponse } from 'next/server';
import { getArtifacts } from '@/utils/DataGetters';

export async function GET(req: NextRequest) {
    const data = await getArtifacts()
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
