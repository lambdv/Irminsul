import { NextResponse, NextRequest } from 'next/server'
import { getToken } from "next-auth/jwt";
import { cookies } from 'next/headers'
// import Gatekeeper from './app/(content)/seelie/gatekeeper'

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname
    const cookieStore = await cookies()

    if(pathname.startsWith('/characters/'))
        return NextResponse.redirect(new URL('/archive/characters/' + pathname.split('/')[2], req.url))
    if(pathname.startsWith('/weapons/'))
        return NextResponse.redirect(new URL('/archive/weapons/' + pathname.split('/')[2], req.url))
    if(pathname.startsWith('/artifacts/'))
        return NextResponse.redirect(new URL('/archive/artifacts/' + pathname.split('/')[2], req.url))
    
    // if (req.nextUrl.pathname.startsWith("/seelie")) {
    //     const sessionCookie = cookieStore.get('authjs.session-token')
    //     if(!sessionCookie)
    //         return NextResponse.rewrite(Gatekeeper())
    // }

    return NextResponse.next()
}

// export const config = {
//     matcher: [ 
//         '/seelie/:path*', 
//         '/archive/:path*',
//     ]
// }
