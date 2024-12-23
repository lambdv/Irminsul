import { NextResponse, NextRequest } from 'next/server';
import { promises as fs } from 'fs';


export async function GET(req: NextRequest): Promise<NextResponse> {
    //request can be a id for the character

    return NextResponse.json({
        data: "a"
    });
}