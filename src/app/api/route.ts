import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        return NextResponse.json({ 
            routes: [
                "/characters",
                "/weapons",
                "/artifacts"
            ]
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
