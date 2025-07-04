import { NextResponse, NextRequest } from 'next/server'
import { getToken } from "next-auth/jwt";
import { cookies } from 'next/headers'
import { isAdmin } from '@/app/(auth)/actions'

/**
 * Middleware for the application
 * @param req 
 * @returns 
 */
export async function middleware(req: NextRequest) {
    await AdminOnly(req)
    await RedirectArchive(req)
    return NextResponse.next()
}

/**
 * Redirects to the archive if the user is not an admin
 * @param req 
 * @returns 
 */
async function AdminOnly(req: NextRequest): Promise<void> {
    if(req.nextUrl.pathname.startsWith('/admin')){
        const allowed = await isAdmin()
        if(!allowed){
            NextResponse.redirect(new URL('/', req.url))
            return
        }
    }
}

// export const config = {
//     runtime: 'experimental-edge',
//     matcher: [
//         '/admin/:path*',
//         '/characters/:path*',
//         '/weapons/:path*',
//         '/artifacts/:path*'
//     ]
// }

/**
 * Redirects to the archive if the user is not an admin
 * @param req 
 * @returns 
 */
async function RedirectArchive(req: NextRequest): Promise<void> {
    const pathname = req.nextUrl.pathname
    switch(pathname){
        case '/characters/':
            NextResponse.redirect(new URL('/archive/characters/' + pathname.split('/')[2], req.url))
            return
        case '/weapons/':
            NextResponse.redirect(new URL('/archive/weapons/' + pathname.split('/')[2], req.url))
            return
        case '/artifacts/':
            NextResponse.redirect(new URL('/archive/artifacts/' + pathname.split('/')[2], req.url))
            return
    }
}


